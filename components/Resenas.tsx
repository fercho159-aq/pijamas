import type { Resena } from '@/lib/resenas'
import { promedio } from '@/lib/resenas'

function Estrellas({ n, tam = 14 }: { n: number; tam?: number }) {
  return (
    <span className="estrellas" style={{ ['--tam' as string]: `${tam}px` }} aria-label={`${n} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i <= Math.round(n) ? 'on' : ''} aria-hidden="true">
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  )
}

export function ResumenEstrellas({ rs }: { rs: Resena[] }) {
  if (!rs.length) return null
  return (
    <div className="res-resumen">
      <Estrellas n={promedio(rs)} />
      <b>{promedio(rs).toFixed(1)}</b>
      <span>
        {rs.length} {rs.length === 1 ? 'reseña' : 'reseñas'}
      </span>
    </div>
  )
}

export default function Resenas({
  rs,
  ejemplo,
  titulo = 'Lo que dicen quienes ya la tienen',
}: {
  rs: Resena[]
  ejemplo: boolean
  titulo?: string
}) {
  // Sin reseñas no se renderiza nada: un bloque vacío resta más de lo que suma.
  if (!rs.length) return null

  const media = promedio(rs)
  const conteo = [5, 4, 3, 2, 1].map((e) => ({ e, n: rs.filter((r) => r.estrellas === e).length }))

  return (
    <section className="seccion envoltura res">
      <div className="seccion-t">
        <h2>{titulo}</h2>
      </div>

      {ejemplo && (
        <p className="res-aviso">
          Ejemplos de cómo se verán las reseñas. Las reales aparecen aquí solas: el sistema solo
          acepta reseñas de pedidos entregados.
        </p>
      )}

      <div className="res-cabeza">
        <div className="res-nota">
          <b>{media.toFixed(1)}</b>
          <Estrellas n={media} tam={17} />
          <span>
            {rs.length} {rs.length === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>
        <div className="res-barras">
          {conteo.map(({ e, n }) => (
            <div className="res-barra" key={e}>
              <span>{e}★</span>
              <i>
                <b style={{ width: `${rs.length ? (n / rs.length) * 100 : 0}%` }} />
              </i>
              <em>{n}</em>
            </div>
          ))}
        </div>
      </div>

      <div className="res-lista">
        {rs.map((r, i) => (
          <article className="res-item" key={`${r.nombre}-${i}`}>
            <Estrellas n={r.estrellas} />
            <p>{r.texto}</p>
            <footer>
              <b>{r.nombre}</b>
              {r.ciudad && <span>{r.ciudad}</span>}
              {/* El dato de ajuste resuelve la objeción número uno de ropa en línea. */}
              {r.estatura > 0 && r.talla && (
                <span className="res-ajuste">
                  Mide {(r.estatura / 100).toFixed(2)} m · pidió {r.talla}
                </span>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
