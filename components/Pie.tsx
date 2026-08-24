import Link from 'next/link'
import Image from 'next/image'
import Redes from './Redes'

export default function Pie({ demo, whatsapp }: { demo: boolean; whatsapp: string }) {
  return (
    <footer className="pie">
      <div className="envoltura">
        <Image src="/logo.png" alt="Rossy Lady" width={520} height={241} className="pie-logo" />
        <p>
          Pijamas y camisones hechos en México desde 2019.
          <br />
          Dama, caballero y camisones, de la talla CH a la 2XG.
        </p>

        <Redes whatsapp={whatsapp} />

        <nav className="pie-links">
          <Link href="/guia-de-tallas">Guía de tallas</Link>
          <Link href="/dama">Dama</Link>
          <Link href="/camisones">Camisones</Link>
          <Link href="/caballero">Caballero</Link>
          <Link href="/ofertas">Ofertas</Link>
        </nav>

        <div className="pie-fin">
          <p>
            Composición de fibras conforme a la NOM‑004‑SCFI indicada en cada producto.
            Razón social, RFC y domicilio pendientes de captura.
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
