import type { Metadata } from 'next'
import Link from 'next/link'
import EstadoPago from '@/components/EstadoPago'
import { getConfig } from '@/lib/datos'
import { getPedido, marcarPago } from '@/lib/pedidos'
import { mpConfigurado, obtenerPago } from '@/lib/mp'
import { pesos } from '@/lib/formato'

export const metadata: Metadata = { title: 'Tu pedido', robots: { index: false } }
export const dynamic = 'force-dynamic'

/**
 * Regreso desde Mercado Pago. Lo que manda es el estado guardado en la base
 * (lo pone el webhook), no lo que diga la dirección del navegador.
 *
 * Aquí no se muestran nombre ni dirección: el folio es corto y cualquiera
 * podría probar otro.
 */
export default async function Gracias({
  searchParams,
}: {
  searchParams: Promise<{
    folio?: string
    status?: string
    collection_status?: string
    payment_id?: string
    collection_id?: string
  }>
}) {
  const { folio = '', status, collection_status, payment_id, collection_id } = await searchParams
  let pedido = folio ? await getPedido(folio) : null

  // Respaldo del aviso de Mercado Pago: si la clienta ya volvió y el pago
  // todavía no está registrado, se consulta aquí mismo. Lo que vale es lo que
  // responda Mercado Pago, no lo que traiga la dirección del navegador.
  const idPago = payment_id || collection_id
  if (pedido && pedido.estado !== 'pagado' && idPago && mpConfigurado) {
    try {
      const pago = await obtenerPago(idPago)
      if (pago.external_reference === pedido.folio) {
        await marcarPago(pedido.folio, String(pago.id), pago.status)
        pedido = await getPedido(folio)
      }
    } catch (e) {
      console.error('[pago] consulta al volver', folio, e)
    }
  }
  const config = await getConfig()
  const mp = pedido?.mp_estado ?? ''
  const avisoMP = status ?? collection_status ?? ''

  const pagado = pedido?.estado === 'pagado'
  const rechazado = ['rejected', 'cancelled'].includes(mp) || ['rejected', 'failure'].includes(avisoMP)
  const pendiente = !pagado && !rechazado && ['pending', 'in_process'].includes(mp || avisoMP)
  const esperando = !pagado && !rechazado && !pendiente && Boolean(pedido)

  const titulo = pagado
    ? `¡Listo! Pago recibido`
    : rechazado
      ? 'El pago no se completó'
      : pendiente
        ? 'Tu pago está en revisión'
        : pedido
          ? 'Estamos confirmando tu pago'
          : 'No encontramos ese pedido'

  const detalle = pagado
    ? 'Te escribimos por WhatsApp para confirmar el envío. Guarda tu folio.'
    : rechazado
      ? 'No se hizo ningún cargo. Puedes intentar con otra tarjeta o cerrar tu pedido por WhatsApp.'
      : pendiente
        ? 'Pasa con los pagos en efectivo o por transferencia. En cuanto se acredite, te avisamos.'
        : pedido
          ? 'Esto tarda unos segundos. La página se actualiza sola.'
          : 'Revisa la liga o escríbenos por WhatsApp con tu folio.'

  return (
    <section className="seccion envoltura" style={{ maxWidth: 620 }}>
      <EstadoPago pagado={pagado} esperando={esperando} />

      {pagado && (
        <div className="okIcono" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <h1 style={{ fontSize: 25, textAlign: 'center' }}>{titulo}</h1>
      {pedido && (
        <p className="apunte" style={{ textAlign: 'center', marginTop: 6 }}>
          Pedido <b>{pedido.folio}</b>
        </p>
      )}
      <p className="apunte" style={{ textAlign: 'center', margin: '10px 0 18px' }}>{detalle}</p>

      {pedido && (
        <div className="totales">
          {pedido.items.map((i, k) => (
            <div className="tr" key={k}>
              <span>
                {i.nombre_snapshot} × {i.cantidad}
              </span>
              <span className="money">{pesos(i.precio_unitario * i.cantidad)}</span>
            </div>
          ))}
          <div className="tr">
            <span>Envío</span>
            <span className="money">{pedido.envio ? pesos(pedido.envio) : 'Gratis'}</span>
          </div>
          <div className="tr grande">
            <span>Total</span>
            <span className="money">{pesos(pedido.total)}</span>
          </div>
        </div>
      )}

      {rechazado && (
        <Link className="btn btn-pri btn-full" href="/pedido" style={{ marginTop: 18 }}>
          Intentar de nuevo
        </Link>
      )}

      <a
        className="btn btn-wa btn-full"
        style={{ marginTop: 10 }}
        href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
          `Hola, les escribo por mi pedido ${pedido?.folio ?? folio}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Escribirnos por WhatsApp
      </a>
      <Link className="btn btn-out btn-full" href="/catalogo" style={{ marginTop: 10 }}>
        Seguir viendo
      </Link>
    </section>
  )
}
