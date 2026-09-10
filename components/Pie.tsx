import Link from 'next/link'
import Image from 'next/image'
import Redes from './Redes'
import type { Categoria } from '@/lib/tipos'

export default function Pie({
  demo,
  whatsapp,
  categorias,
}: {
  demo: boolean
  whatsapp: string
  categorias: Categoria[]
}) {
  return (
    <footer className="pie">
      <div className="envoltura">
        <Image src="/logo.png" alt="Rossy Lady" width={583} height={900} className="pie-logo" />
        <p>
          Pijamas y batas hechas en nuestro propio taller desde 1999.
          <br />
          Rossy Lady es una marca registrada ante el IMPI.
        </p>

        <Redes whatsapp={whatsapp} />

        <nav className="pie-links">
          <Link href="/catalogo">Catálogo</Link>
          {categorias.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`}>
              {c.nombre}
            </Link>
          ))}
          <Link href="/guia-de-tallas">Guía de tallas</Link>
        </nav>

        <div className="pie-fin">
          <p>
            Tienda operada por Paralelogramo Diseño, S.A. de C.V. · RFC y domicilio fiscal
            pendientes de captura. Composición de fibras conforme a la NOM-004-SCFI indicada
            en cada producto.
          </p>
          {demo && (
            <p className="pie-demo">
              Vista de demostración · existencias y ofertas de ejemplo hasta conectar la base de
              datos
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
