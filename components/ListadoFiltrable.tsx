'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import TarjetaProducto from './TarjetaProducto'
import type { Producto } from '@/lib/tipos'

/**
 * El filtro vive en el cliente para que las páginas de categoría sigan
 * siendo estáticas: leer searchParams en el servidor las volvería dinámicas
 * y perderíamos el prerenderizado de las 4 listas.
 */
export default function ListadoFiltrable({ items }: { items: Producto[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const ruta = usePathname()

  const activo = params.get('tipo')
  const tipos = [...new Set(items.map((p) => p.tipo).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  )
  const visibles = activo ? items.filter((p) => p.tipo === activo) : items

  function elegir(t: string | null) {
    router.replace(t ? `${ruta}?tipo=${encodeURIComponent(t)}` : ruta, { scroll: false })
  }

  return (
    <>
      {tipos.length > 1 && (
        <div className="chips" role="group" aria-label="Filtrar por tipo">
          <button onClick={() => elegir(null)} aria-pressed={!activo}>
            Todos <em>{items.length}</em>
          </button>
          {tipos.map((t) => (
            <button key={t} onClick={() => elegir(t)} aria-pressed={activo === t}>
              {t} <em>{items.filter((p) => p.tipo === t).length}</em>
            </button>
          ))}
        </div>
      )}

      <p className="apunte" style={{ margin: '0 0 20px' }}>
        {visibles.length} {visibles.length === 1 ? 'modelo' : 'modelos'} ·{' '}
        {visibles.reduce((t, p) => t + p.colores.length, 0)} colores
      </p>

      {visibles.length === 0 ? (
        <div className="vacio">
          <h2>No hay modelos de ese tipo</h2>
          <p>Prueba con otro filtro.</p>
          <button className="btn btn-pri" onClick={() => elegir(null)}>
            Ver todos
          </button>
        </div>
      ) : (
        <div className="rejilla">
          {visibles.map((p, i) => (
            <TarjetaProducto key={p.numero} p={p} prioridad={i < 4} />
          ))}
        </div>
      )}
    </>
  )
}
