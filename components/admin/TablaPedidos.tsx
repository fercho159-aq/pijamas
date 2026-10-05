'use client'

import { useState } from 'react'
import Link from 'next/link'
import { pesos } from '@/lib/formato'
import type { PedidoFila } from '@/lib/pedidos'

/** Mismos nombres y colores que en la ficha del pedido. */
export const ESTADOS: Record<string, { et: string; clase: string }> = {
  nuevo: { et: 'Nuevo', clase: 'nuevo' },
  confirmado: { et: 'Confirmado', clase: 'confirmado' },
  pagado: { et: 'Pagado', clase: 'pagado' },
  enviado: { et: 'Enviado', clase: 'enviado' },
  entregado: { et: 'Entregado', clase: 'entregado' },
  cancelado: { et: 'Cancelado', clase: 'cancelado' },
}

export function Estado({ estado }: { estado: string }) {
  const e = ESTADOS[estado] ?? { et: estado, clase: 'nuevo' }
  return <span className={`ped-estado ${e.clase}`}>{e.et}</span>
}

export const fecha = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

export default function TablaPedidos({ pedidos }: { pedidos: PedidoFila[] }) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('')

  const q = busca.trim().toLowerCase()
  const visibles = pedidos.filter(
    (p) =>
      (!filtro || p.estado === filtro) &&
      (!q ||
        p.folio.toLowerCase().includes(q) ||
        (p.cliente_nombre ?? '').toLowerCase().includes(q) ||
        (p.cliente_telefono ?? '').includes(q))
  )

  return (
    <>
      <div className="adm-filtros">
        <input
          placeholder="Buscar por folio, nombre o teléfono"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar pedidos"
        />
        <div className="adm-chips">
          <button onClick={() => setFiltro('')} aria-pressed={!filtro}>
            Todos
          </button>
          {Object.entries(ESTADOS).map(([clave, e]) => (
            <button key={clave} onClick={() => setFiltro(clave)} aria-pressed={filtro === clave}>
              {e.et}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-scroll">
        <table className="adm-tabla">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Clienta</th>
              <th>Cómo</th>
              <th>Piezas</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/pedidos/${p.folio}`} className="adm-enlace">
                    {p.folio}
                  </Link>
                  <span className="adm-sub">{fecha(p.creado_en)}</span>
                </td>
                <td>
                  {p.cliente_nombre ?? '—'}
                  <span className="adm-sub">{p.cliente_telefono ?? ''}</span>
                </td>
                <td className="adm-sub">{p.canal === 'mercadopago' ? 'Tarjeta' : 'WhatsApp'}</td>
                <td className="num">{p.piezas ?? 0}</td>
                <td className="num">{pesos(p.total)}</td>
                <td>
                  <Estado estado={p.estado} />
                </td>
                <td className="adm-acciones">
                  <Link href={`/admin/pedidos/${p.folio}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibles.length === 0 && <p className="adm-vacio">Ningún pedido coincide con la búsqueda.</p>}
    </>
  )
}
