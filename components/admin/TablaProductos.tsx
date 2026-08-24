'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { alternarBandera, borrarProducto } from '@/lib/acciones'
import { pesos, precio, descuento, existencias } from '@/lib/formato'
import type { Producto } from '@/lib/tipos'

type Fila = Producto & { activo?: boolean }

export default function TablaProductos({ productos }: { productos: Producto[] }) {
  const [busca, setBusca] = useState('')
  const [cat, setCat] = useState('')
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null)
  const [pendiente, empezar] = useTransition()

  const cats = [...new Set(productos.map((p) => p.categoria))]
  const q = busca.trim().toLowerCase()
  const visibles = (productos as Fila[]).filter(
    (p) =>
      (!cat || p.categoria === cat) &&
      (!q || p.nombre.toLowerCase().includes(q) || String(p.numero).includes(q))
  )

  function accion(fn: () => Promise<{ ok: boolean; mensaje: string }>) {
    empezar(async () => setAviso(await fn()))
  }

  return (
    <>
      <div className="adm-filtros">
        <input
          placeholder="Buscar por nombre o número de modelo"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar productos"
        />
        <div className="adm-chips">
          <button onClick={() => setCat('')} aria-pressed={!cat}>
            Todas
          </button>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {aviso && <p className={aviso.ok ? 'adm-ok' : 'adm-error'}>{aviso.mensaje}</p>}

      <div className="adm-scroll">
        <table className="adm-tabla">
          <thead>
            <tr>
              <th></th>
              <th>Modelo</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Existencias</th>
              <th>Destacado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => {
              const stock = existencias(p)
              return (
                <tr key={p.numero} className={stock === 0 ? 'sinStock' : ''}>
                  <td className="adm-mini">
                    <Image src={p.colores[0].img} alt="" width={600} height={800} sizes="46px" />
                  </td>
                  <td>
                    <Link href={`/admin/productos/${p.slug}`} className="adm-enlace">
                      {p.nombre}
                    </Link>
                    <span className="adm-sub">
                      #{p.numero} · {p.colores.length}{' '}
                      {p.colores.length === 1 ? 'color' : 'colores'}
                    </span>
                  </td>
                  <td className="adm-cap">{p.categoria}</td>
                  <td className="num">
                    {pesos(precio(p))}
                    {p.precioOferta && <span className="adm-off">−{descuento(p)}%</span>}
                  </td>
                  <td className="num">
                    <span className={stock === 0 ? 'adm-rojo' : stock <= 8 ? 'adm-ambar' : ''}>
                      {stock}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`adm-toggle ${p.destacado ? 'on' : ''}`}
                      disabled={pendiente}
                      aria-pressed={p.destacado}
                      aria-label={`Destacar ${p.nombre}`}
                      onClick={() => accion(() => alternarBandera(p.numero, 'destacado', !p.destacado))}
                    >
                      <i />
                    </button>
                  </td>
                  <td className="adm-acciones">
                    <Link href={`/admin/productos/${p.slug}`}>Editar</Link>
                    <button
                      className="adm-borrar"
                      disabled={pendiente}
                      onClick={() => {
                        if (
                          !confirm(
                            `¿Eliminar el modelo ${p.numero} ${p.nombre}? Se borran también sus ${p.colores.length} variantes y no se puede deshacer.`
                          )
                        )
                          return
                        accion(() => borrarProducto(p.numero))
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {visibles.length === 0 && <p className="adm-vacio">Ningún modelo coincide con la búsqueda.</p>}
    </>
  )
}
