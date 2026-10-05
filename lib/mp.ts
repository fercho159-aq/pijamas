import 'server-only'
import crypto from 'node:crypto'

/**
 * Mercado Pago · Checkout Pro.
 *
 * Se habla directo con su API REST: una dependencia menos y el mismo
 * comportamiento. El Access Token vive solo en el servidor; el navegador
 * nunca lo ve.
 */
const API = 'https://api.mercadopago.com'
const TOKEN = process.env.MP_ACCESS_TOKEN

export const mpConfigurado = Boolean(TOKEN)
/** Las credenciales de prueba cobran dinero de juguete: hay que avisarlo. */
export const mpEsPrueba = Boolean(TOKEN && (TOKEN.startsWith('TEST-') || process.env.MP_MODO === 'prueba'))

async function llamar<T>(ruta: string, init: RequestInit & { idempotencia?: string } = {}): Promise<T> {
  if (!TOKEN) throw new Error('Falta MP_ACCESS_TOKEN')
  const { idempotencia, ...resto } = init
  const r = await fetch(API + ruta, {
    ...resto,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(idempotencia ? { 'X-Idempotency-Key': idempotencia } : {}),
      ...(resto.headers ?? {}),
    },
  })
  const texto = await r.text()
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${texto.slice(0, 300)}`)
  return texto ? (JSON.parse(texto) as T) : ({} as T)
}

export type ItemPreferencia = {
  nombre: string
  cantidad: number
  precio: number
  descripcion?: string
  foto?: string | null
}

/** Crea la preferencia y devuelve a dónde hay que mandar a la clienta. */
export async function crearPreferencia({
  folio,
  items,
  envio,
  cliente,
  urlBase,
}: {
  folio: string
  items: ItemPreferencia[]
  envio: number
  cliente: { nombre?: string; telefono?: string; email?: string }
  urlBase: string
}) {
  const publico = !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(urlBase)
  const [nombre, ...apellido] = (cliente.nombre ?? '').trim().split(/\s+/)
  const tel = (cliente.telefono ?? '').replace(/\D/g, '').slice(-10)

  const pref = await llamar<{ id: string; init_point: string; sandbox_init_point: string }>(
    '/checkout/preferences',
    {
      method: 'POST',
      idempotencia: `pedido-${folio}`,
      body: JSON.stringify({
        external_reference: folio,
        statement_descriptor: 'ROSSY LADY',
        items: [
          ...items.map((i) => ({
            id: i.nombre,
            title: i.nombre,
            description: i.descripcion,
            picture_url: i.foto ? new URL(i.foto, urlBase).href : undefined,
            quantity: i.cantidad,
            unit_price: i.precio,
            currency_id: 'MXN',
          })),
          ...(envio > 0
            ? [{ id: 'envio', title: 'Envío', quantity: 1, unit_price: envio, currency_id: 'MXN' }]
            : []),
        ],
        payer: {
          name: nombre || undefined,
          surname: apellido.join(' ') || undefined,
          email: cliente.email || undefined,
          phone: tel ? { area_code: tel.slice(0, 2), number: tel.slice(2) } : undefined,
        },
        // Mercado Pago no acepta direcciones locales: en desarrollo se omiten
        // el regreso automático y el aviso, y el pago se revisa a mano.
        ...(publico
          ? {
              back_urls: {
                success: `${urlBase}/pedido/gracias?folio=${folio}`,
                pending: `${urlBase}/pedido/gracias?folio=${folio}`,
                failure: `${urlBase}/pedido/gracias?folio=${folio}`,
              },
              auto_return: 'approved',
              notification_url: `${urlBase}/api/mp/webhook`,
            }
          : {}),
        metadata: { folio },
      }),
    }
  )
  return { id: pref.id, url: pref.init_point || pref.sandbox_init_point }
}

export type PagoMP = {
  id: number
  status: string
  status_detail?: string
  external_reference?: string
  transaction_amount?: number
}

export const obtenerPago = (id: string | number) => llamar<PagoMP>(`/v1/payments/${id}`)

/**
 * Firma del webhook. Mercado Pago manda `x-signature: ts=...,v1=...` y la
 * firma se arma con el id del pago, el id de la petición y ese ts. Sin
 * MP_WEBHOOK_SECRET no se puede verificar: entonces el aviso solo sirve de
 * disparador y el estado real se consulta a la API.
 */
export function firmaValida(firma: string | null, peticion: string | null, idPago: string) {
  const secreto = process.env.MP_WEBHOOK_SECRET
  if (!secreto) return null
  if (!firma) return false
  const partes = Object.fromEntries(
    firma.split(',').map((p) => p.split('=').map((x) => x.trim()) as [string, string])
  )
  if (!partes.ts || !partes.v1) return false
  const base = `id:${idPago};request-id:${peticion ?? ''};ts:${partes.ts};`
  const esperada = crypto.createHmac('sha256', secreto).update(base).digest('hex')
  const a = Buffer.from(esperada)
  const b = Buffer.from(partes.v1)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
