'use server'

import { after } from 'next/server'
import { headers } from 'next/headers'
import { hayBase } from './db'
import { getConfig } from './datos'
import { mpConfigurado, crearPreferencia } from './mp'
import {
  armarPedido,
  guardarPedido,
  guardarPreferencia,
  ErrorPedido,
  type Armado,
  type DatosEnvio,
  type LineaPedido,
} from './pedidos'
import { mensajePedido } from './whatsapp'
import { correoAvisoTienda, correoPedidoNuevo } from './correo'

/**
 * Lo que puede hacer la tienda sin contraseña: cerrar un pedido por WhatsApp
 * o mandarlo a pagar con tarjeta. Ambas cosas pasan por el servidor para que
 * los precios y las existencias salgan de la base, no del navegador.
 */
export type Entrada = { datos: DatosEnvio; lineas: LineaPedido[] }

export type RespuestaWhatsApp =
  | { ok: true; folio: string; mensaje: string; url: string; guardado: boolean }
  | { ok: false; error: string }

export type RespuestaTarjeta = { ok: true; url: string; folio: string } | { ok: false; error: string }

async function urlBase() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const protocolo = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocolo}://${host}`
}

function revisarDatos(datos: DatosEnvio) {
  if (!datos?.nombre?.trim()) return 'Necesitamos tu nombre para preparar el pedido.'
  if ((datos.telefono ?? '').replace(/\D/g, '').length !== 10)
    return 'Escribe tu WhatsApp a 10 dígitos, sin lada del país.'
  if (!datos.calle?.trim()) return 'Sin calle y número no podemos enviarlo.'
  return null
}

function explicar(e: unknown) {
  if (e instanceof ErrorPedido) return e.message
  console.error('[pedido]', e)
  return 'No se pudo cerrar el pedido. Inténtalo de nuevo en un minuto.'
}

/** Los correos salen después de responder: la clienta no espera al servidor de correo. */
async function avisar(
  folio: string,
  datos: DatosEnvio,
  armado: Armado,
  canal: 'whatsapp' | 'mercadopago'
) {
  const panel = `${await urlBase()}/admin/pedidos/${folio}`
  after(async () => {
    await correoPedidoNuevo(folio, datos, armado, canal)
    await correoAvisoTienda(folio, datos, armado, canal, panel)
  })
}

/** Folio provisional de la vista de demostración, cuando no hay base conectada. */
const folioDemo = () => 'RL-' + String(Math.floor(Math.random() * 400) + 120).padStart(5, '0')

export async function cerrarPorWhatsApp(entrada: Entrada): Promise<RespuestaWhatsApp> {
  const falla = revisarDatos(entrada?.datos)
  if (falla) return { ok: false, error: falla }
  try {
    const armado = await armarPedido(entrada.lineas)
    const config = await getConfig()
    const folio = hayBase ? (await guardarPedido('whatsapp', entrada.datos, armado)).folio : folioDemo()
    if (hayBase) await avisar(folio, entrada.datos, armado, 'whatsapp')
    const mensaje = mensajePedido(folio, armado, entrada.datos)
    return {
      ok: true,
      folio,
      mensaje,
      url: `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(mensaje)}`,
      guardado: hayBase,
    }
  } catch (e) {
    return { ok: false, error: explicar(e) }
  }
}

export async function pagarConTarjeta(entrada: Entrada): Promise<RespuestaTarjeta> {
  const falla = revisarDatos(entrada?.datos)
  if (falla) return { ok: false, error: falla }

  const config = await getConfig()
  if (!hayBase || !mpConfigurado || !config.mercadopago)
    return { ok: false, error: 'El pago con tarjeta no está disponible ahora. Cierra tu pedido por WhatsApp.' }

  let folio = ''
  try {
    const armado: Armado = await armarPedido(entrada.lineas)
    const guardado = await guardarPedido('mercadopago', entrada.datos, armado)
    folio = guardado.folio
    const preferencia = await crearPreferencia({
      folio,
      envio: armado.envio,
      urlBase: await urlBase(),
      cliente: {
        nombre: entrada.datos.nombre,
        telefono: entrada.datos.telefono,
        email: entrada.datos.email,
      },
      items: armado.items.map((i) => ({
        nombre: `${i.nombre} · ${i.color} · ${i.talla}`,
        descripcion: `Modelo ${i.numero}`,
        cantidad: i.cantidad,
        precio: i.precio,
        foto: i.img,
      })),
    })
    await guardarPreferencia(folio, preferencia.id)
    await avisar(folio, entrada.datos, armado, 'mercadopago')
    return { ok: true, url: preferencia.url, folio }
  } catch (e) {
    if (folio) console.error('[pago]', folio, e)
    return { ok: false, error: explicar(e) }
  }
}
