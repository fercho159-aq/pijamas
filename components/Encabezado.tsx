'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCarrito } from './CarritoProvider'
import Navegacion from './Navegacion'
import { pesos } from '@/lib/formato'
import { waGeneral } from '@/lib/whatsapp'
import type { Config } from '@/lib/tipos'
import type { RamaMenu } from '@/lib/menu'

/**
 * Los estilos viven en globals.css a propósito: styled-jsx solo inyecta su
 * clase de ámbito en elementos nativos, no en componentes como <Link>, y eso
 * dejaba sin estilo al logo, al carrito y al botón de regreso.
 */
export default function Encabezado({ config, menu }: { config: Config; menu: RamaMenu[] }) {
  const { piezas, listo } = useCarrito()

  return (
    <>
      <div className="anuncio">Envío gratis en pedidos desde {pesos(config.envioGratisDesde)}</div>

      <header className="hdr">
        <div className="hdr-in envoltura">
          <Navegacion menu={menu} wa={waGeneral(config.whatsapp)} />

          <Link href="/" className="hdr-logo" aria-label="Rossy Lady, inicio">
            <Image src="/logo.png" alt="Rossy Lady" width={520} height={241} priority />
          </Link>

          <Link
            href="/carrito"
            className="hdr-carrito"
            aria-label={listo && piezas ? `Carrito, ${piezas} artículos` : 'Carrito vacío'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M6 6L5 3H2" />
            </svg>
            {listo && piezas > 0 && <span className="hdr-badge">{piezas}</span>}
          </Link>
        </div>
      </header>
    </>
  )
}
