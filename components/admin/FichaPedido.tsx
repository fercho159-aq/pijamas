'use client'

import { useState, useTransition } from 'react'
import { cambiarEstadoPedido, guardarEnvioPedido } from '@/lib/acciones'
import { pesos } from '@/lib/formato'
import type { ItemGuardado, PedidoFila } from '@/lib/pedidos'
import { ESTADOS, Estado, fecha } from './TablaPedidos'

type Pedido = PedidoFila & { items: ItemGuardado[] }

/** El siguiente paso natural según cómo entró el pedido. */
const SIGUIENTE: Record<string, string[]> = {
  nuevo: ['confirmado', 'pagado', 'cancelado'],
  confirmado: ['pagado', 'enviado', 'cancelado'],
  pagado: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: ['nuevo'],
}

export default function FichaPedido({ pedido }: { pedido: Pedido }) {
  const [estado, setEstado] = useState(pedido.estado)
  const [guia, setGuia] = useState(pedido.guia_paqueteria ?? '')
  const [notas, setNotas] = useState(pedido.notas ?? '')
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null)
  const [pendiente, empezar] = useTransition()

  const tel = (pedido.cliente_telefono ?? '').replace(/\D/g, '')
  const wa = tel
    ? `https://wa.me/${tel.length === 10 ? '52' + tel : tel}?text=${encodeURIComponent(
        `Hola ${pedido.cliente_nombre ?? ''}, le escribimos de Rossy Lady por su pedido ${pedido.folio}.`
      )}`
    : null

  const direccion = [
    pedido.envio_calle,
    pedido.envio_colonia,
    pedido.envio_ciudad,
    pedido.envio_estado,
    pedido.envio_cp ? `CP ${pedido.envio_cp}` : '',
  ]
    .filter(Boolean)
    .join(', ')

  function mover(nuevo: string) {
    empezar(async () => {
      const r = await cambiarEstadoPedido(pedido.folio, nuevo)
      setAviso(r)
      if (r.ok) setEstado(nuevo)
    })
  }

  function guardar() {
    empezar(async () => setAviso(await guardarEnvioPedido(pedido.folio, guia, notas)))
  }

  const copiar = () => {
    const texto = `${pedido.cliente_nombre}\n${pedido.cliente_telefono}\n${direccion}${
      pedido.envio_referencias ? `\nReferencias: ${pedido.envio_referencias}` : ''
    }`
    navigator.clipboard?.writeText(texto).then(
      () => setAviso({ ok: true, mensaje: 'Dirección copiada.' }),
      () => setAviso({ ok: false, mensaje: 'No se pudo copiar.' })
    )
  }

  return (
    <>
      {aviso && <p className={aviso.ok ? 'adm-ok' : 'adm-error'}>{aviso.mensaje}</p>}

      <div className="adm-cols2">
        <div className="adm-caja">
          <h2>Qué pidió</h2>
          <div className="ped-items">
            {pedido.items.map((i, k) => (
              <div className="ped-item" key={k}>
                {i.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.img} alt="" />
                ) : (
                  <span className="ped-sinfoto" aria-hidden="true" />
                )}
                <div>
                  <b>{i.nombre_snapshot}</b>
                  <span className="adm-sub">
                    {i.cantidad} × {pesos(i.precio_unitario)}
                    {i.sku ? ` · ${i.sku}` : ''}
                  </span>
                </div>
                <span className="num">{pesos(i.precio_unitario * i.cantidad)}</span>
              </div>
            ))}
          </div>

          <dl className="adm-datos" style={{ marginTop: 14 }}>
            <div>
              <dt>Subtotal</dt>
              <dd>{pesos(pedido.subtotal)}</dd>
            </div>
            <div>
              <dt>Envío</dt>
              <dd>{pedido.envio ? pesos(pedido.envio) : 'Gratis'}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{pesos(pedido.total)}</dd>
            </div>
          </dl>

          <h2>Pago</h2>
          <dl className="adm-datos">
            <div>
              <dt>Cómo</dt>
              <dd>{pedido.canal === 'mercadopago' ? 'Tarjeta (Mercado Pago)' : 'WhatsApp'}</dd>
            </div>
            {pedido.canal === 'mercadopago' && (
              <>
                <div>
                  <dt>Estado en Mercado Pago</dt>
                  <dd>{pedido.mp_estado ?? 'sin respuesta todavía'}</dd>
                </div>
                <div>
                  <dt>Número de pago</dt>
                  <dd>{pedido.mp_payment_id ?? '—'}</dd>
                </div>
              </>
            )}
            <div>
              <dt>Fecha del pedido</dt>
              <dd>{fecha(pedido.creado_en)}</dd>
            </div>
          </dl>

          {pedido.canal === 'whatsapp' && (
            <p className="adm-pista">
              Este pedido se cerró por WhatsApp: el cobro lo haces tú. Cuando te paguen, márcalo
              como <b>Pagado</b> y resta las piezas en el modelo (Productos → Editar). Solo los
              pagos con tarjeta descuentan las existencias solos.
            </p>
          )}
        </div>

        <div>
          <div className="adm-caja">
            <h2>A dónde va</h2>
            <dl className="adm-datos">
              <div>
                <dt>Clienta</dt>
                <dd>{pedido.cliente_nombre ?? '—'}</dd>
              </div>
              <div>
                <dt>WhatsApp</dt>
                <dd>{pedido.cliente_telefono ?? '—'}</dd>
              </div>
              {pedido.cliente_email && (
                <div>
                  <dt>Correo</dt>
                  <dd>{pedido.cliente_email}</dd>
                </div>
              )}
            </dl>
            <p className="ped-dir">{direccion || 'Sin dirección'}</p>
            {pedido.envio_referencias && (
              <p className="adm-pista">Referencias: {pedido.envio_referencias}</p>
            )}
            <div className="ped-botones">
              {wa && (
                <a className="btn btn-out" href={wa} target="_blank" rel="noopener noreferrer">
                  Escribirle
                </a>
              )}
              <button className="btn btn-out" onClick={copiar}>
                Copiar dirección
              </button>
            </div>
          </div>

          <div className="adm-caja" style={{ marginTop: 16 }}>
            <h2>Seguimiento</h2>
            <p className="adm-pista" style={{ marginTop: 0 }}>
              Estado actual: <Estado estado={estado} />
            </p>
            <div className="ped-botones">
              {(SIGUIENTE[estado] ?? []).map((s) => (
                <button key={s} className="btn btn-pri" disabled={pendiente} onClick={() => mover(s)}>
                  {ESTADOS[s]?.et ?? s}
                </button>
              ))}
            </div>

            <div className="fm-campo" style={{ marginTop: 16 }}>
              <label htmlFor="guia">Guía de la paquetería</label>
              <input
                id="guia"
                className="fm-in"
                value={guia}
                maxLength={80}
                placeholder="Ej. 7749 1234 5678"
                onChange={(e) => setGuia(e.target.value)}
              />
            </div>
            <div className="fm-campo">
              <label htmlFor="notas">Notas</label>
              <textarea
                id="notas"
                className="fm-in"
                rows={3}
                maxLength={500}
                placeholder="Lo que necesites recordar de este pedido."
                onChange={(e) => setNotas(e.target.value)}
                value={notas}
              />
            </div>
            <button className="btn btn-out" disabled={pendiente} onClick={guardar}>
              {pendiente ? 'Guardando…' : 'Guardar guía y notas'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
