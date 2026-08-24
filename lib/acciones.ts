'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { haySesion, abrirSesion, cerrarSesion, adminHabilitado } from './auth'
import { usaSupabase } from './datos'

export type Resultado = { ok: boolean; mensaje: string }

const SIN_BASE: Resultado = {
  ok: false,
  mensaje:
    'Modo demostración: no hay base de datos conectada, así que los cambios no se guardan. Configura las variables de Supabase para escribir de verdad.',
}

async function exigirSesion() {
  if (!adminHabilitado) throw new Error('Panel deshabilitado')
  if (!(await haySesion())) redirect('/admin/entrar')
}

/** Escritura contra Supabase con la service role key. Nunca desde el navegador. */
async function escribir(ruta: string, metodo: 'PATCH' | 'POST' | 'DELETE', cuerpo?: unknown) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base || !llave) throw new Error('Faltan credenciales de servidor de Supabase')

  const r = await fetch(`${base}/rest/v1/${ruta}`, {
    method: metodo,
    headers: {
      apikey: llave,
      Authorization: `Bearer ${llave}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    cache: 'no-store',
  })
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`)
}

function refrescar() {
  // invalida catálogo, fichas y panel de una sola vez
  revalidatePath('/', 'layout')
}

async function intentar(fn: () => Promise<void>, exito: string): Promise<Resultado> {
  await exigirSesion()
  if (!usaSupabase) return SIN_BASE
  try {
    await fn()
    refrescar()
    return { ok: true, mensaje: exito }
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

/* ══════════════ Sesión ══════════════ */

export async function entrar(_previo: Resultado | null, datos: FormData): Promise<Resultado> {
  const clave = String(datos.get('clave') ?? '')
  if (!clave) return { ok: false, mensaje: 'Escribe la contraseña.' }
  if (!(await abrirSesion(clave))) return { ok: false, mensaje: 'Contraseña incorrecta.' }
  redirect('/admin')
}

export async function salir() {
  await cerrarSesion()
  redirect('/admin/entrar')
}

/* ══════════════ Productos ══════════════ */

export async function guardarProducto(
  _previo: Resultado | null,
  datos: FormData
): Promise<Resultado> {
  const numero = Number(datos.get('numero'))
  const lista = Number(datos.get('precioLista'))
  const ofertaCruda = String(datos.get('precioOferta') ?? '').trim()
  const oferta = ofertaCruda ? Number(ofertaCruda) : null
  const termina = String(datos.get('ofertaTermina') ?? '').trim()

  if (!Number.isFinite(lista) || lista <= 0)
    return { ok: false, mensaje: 'El precio de lista tiene que ser un número mayor que cero.' }
  if (oferta !== null && !(oferta > 0 && oferta < lista))
    return { ok: false, mensaje: 'El precio de oferta debe ser menor que el de lista.' }
  if (oferta !== null && !termina)
    return {
      ok: false,
      mensaje: 'Una oferta necesita fecha de fin: sin ella el contador no puede ser honesto.',
    }

  return intentar(
    () =>
      escribir(`productos?numero_modelo=eq.${numero}`, 'PATCH', {
        nombre: String(datos.get('nombre') ?? '').trim(),
        descripcion: String(datos.get('descripcion') ?? '').trim(),
        composicion: String(datos.get('composicion') ?? '').trim(),
        precio_lista: lista,
        precio_oferta: oferta,
        oferta_termina: oferta !== null ? new Date(termina).toISOString() : null,
      }),
    'Producto guardado.'
  )
}

export async function alternarBandera(
  numero: number,
  campo: 'activo' | 'destacado',
  valor: boolean
): Promise<Resultado> {
  return intentar(
    () => escribir(`productos?numero_modelo=eq.${numero}`, 'PATCH', { [campo]: valor }),
    valor ? 'Activado.' : 'Desactivado.'
  )
}

export async function borrarProducto(numero: number): Promise<Resultado> {
  return intentar(
    () => escribir(`productos?numero_modelo=eq.${numero}`, 'DELETE'),
    `Modelo ${numero} eliminado.`
  )
}

export async function guardarStock(sku: string, stock: number): Promise<Resultado> {
  if (!Number.isFinite(stock) || stock < 0)
    return { ok: false, mensaje: 'Las existencias no pueden ser negativas.' }
  return intentar(
    () => escribir(`variantes?sku=eq.${encodeURIComponent(sku)}`, 'PATCH', { stock }),
    'Existencias actualizadas.'
  )
}

/* ══════════════ Reseñas ══════════════ */

export async function moderarResena(id: string, aprobar: boolean): Promise<Resultado> {
  return intentar(
    () =>
      aprobar
        ? escribir(`resenas?id=eq.${id}`, 'PATCH', { aprobada: true })
        : escribir(`resenas?id=eq.${id}`, 'DELETE'),
    aprobar ? 'Reseña publicada.' : 'Reseña descartada.'
  )
}

/* ══════════════ Configuración ══════════════ */

export async function guardarConfig(
  _previo: Resultado | null,
  datos: FormData
): Promise<Resultado> {
  const pares: [string, unknown][] = [
    ['whatsapp_numero', String(datos.get('whatsapp') ?? '').replace(/\D/g, '')],
    ['envio_gratis_desde', Number(datos.get('envioGratis'))],
    ['costo_envio_base', Number(datos.get('costoEnvio'))],
    ['hora_corte_envio', String(datos.get('horaCorte') ?? '')],
    ['banner_anuncio', String(datos.get('banner') ?? '')],
    ['mercadopago_activo', datos.get('mp') === 'on'],
  ]
  return intentar(async () => {
    for (const [clave, valor] of pares) {
      await escribir('config', 'POST', { clave, valor })
    }
  }, 'Configuración guardada.')
}
