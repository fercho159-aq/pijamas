import type { Producto, Color } from './tipos'
import { pesos } from './formato'

const enlace = (numero: string, texto: string) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`

/** El mensaje cambia según dónde esté la clienta. Ahí está la mitad del valor del botón. */
export function waGeneral(numero: string) {
  return enlace(numero, 'Hola, quisiera informacion sobre sus pijamas.')
}

export function waProducto(numero: string, p: Producto, c: Color, talla?: string) {
  const t = talla ? ` en talla ${talla}` : ''
  const txt =
    c.stock === 0
      ? `Hola, cuando vuelve a haber el Modelo ${p.numero} ${p.nombre} en color ${c.nombre}?`
      : `Hola, me interesa el Modelo ${p.numero} ${p.nombre} en color ${c.nombre}${t}. Sigue disponible?`
  return enlace(numero, txt)
}

type ResumenPedido = {
  items: {
    nombre: string
    numero: number
    color: string
    talla: string
    cantidad: number
    importe: number
  }[]
  subtotal: number
  envio: number
}

/**
 * El mensaje lo arma el servidor con los precios de la base, no el navegador:
 * así el total del chat siempre coincide con el del pedido guardado.
 */
export function mensajePedido(
  folio: string,
  { items, subtotal, envio }: ResumenPedido,
  datos: Record<string, string | undefined>
) {
  const lineas = items
    .map(
      (i) =>
        `• ${i.nombre} (Modelo ${i.numero}) — ${i.color}, talla ${i.talla} x ${i.cantidad} = ${pesos(i.importe)}`
    )
    .join('\n')

  return `Hola, quiero confirmar mi pedido ${folio}

${lineas}

Subtotal: ${pesos(subtotal)}
Envio: ${envio ? pesos(envio) : 'Gratis'}
Total: ${pesos(subtotal + envio)}

Nombre: ${datos.nombre}
WhatsApp: ${datos.telefono}
Direccion: ${datos.calle}, ${datos.colonia}, ${datos.ciudad}, ${datos.estado}, CP ${datos.cp}
Referencias: ${datos.referencias || '—'}`
}

export const waPedido = (numero: string, mensaje: string) => enlace(numero, mensaje)
