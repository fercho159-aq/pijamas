'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCarrito } from './CarritoProvider'
import { pesos } from '@/lib/formato'
import type { Config } from '@/lib/tipos'

export default function Encabezado({ config }: { config: Config }) {
  const { piezas, listo } = useCarrito()
  const ruta = usePathname()
  const enInicio = ruta === '/'

  return (
    <>
      <div className="anuncio">
        Envío gratis en pedidos desde {pesos(config.envioGratisDesde)}
      </div>

      <header className="hdr">
        <div className="hdr-in envoltura">
          {!enInicio && (
            <Link href="/" className="hdr-atras" aria-label="Ir al inicio">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}

          <Link href="/" className="hdr-logo" aria-label="Rossy Lady, inicio">
            <Image src="/logo.png" alt="Rossy Lady" width={520} height={241} priority />
          </Link>

          <nav className="hdr-nav">
            <Link href="/dama">Dama</Link>
            <Link href="/camisones">Camisones</Link>
            <Link href="/caballero">Caballero</Link>
            <Link href="/ofertas">Ofertas</Link>
          </nav>

          <Link
            href="/carrito"
            className="hdr-carrito"
            aria-label={`Carrito${listo && piezas ? `, ${piezas} artículos` : ', vacío'}`}
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

      <style jsx>{`
        .anuncio {
          background: var(--plum);
          color: #fff;
          font-size: 12.5px;
          text-align: center;
          padding: 8px 14px;
          font-weight: 500;
        }
        .hdr {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(253, 250, 252, 0.94);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line);
        }
        .hdr-in {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 10px;
          padding-bottom: 10px;
        }
        .hdr-atras {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          flex: none;
        }
        .hdr-atras:hover {
          background: var(--surface2);
        }
        .hdr-logo :global(img) {
          height: 26px;
          width: auto;
        }
        .hdr-nav {
          display: none;
          gap: 22px;
          margin-left: auto;
          font-size: 14.5px;
          font-weight: 600;
        }
        .hdr-nav :global(a):hover {
          color: var(--accent);
        }
        .hdr-carrito {
          position: relative;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          margin-left: auto;
          flex: none;
        }
        .hdr-carrito:hover {
          background: var(--surface2);
        }
        .hdr-badge {
          position: absolute;
          top: 3px;
          right: 2px;
          background: var(--accent);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 17px;
          height: 17px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          padding: 0 4px;
          font-variant-numeric: tabular-nums;
        }
        svg {
          width: 21px;
          height: 21px;
          stroke: var(--ink);
          stroke-width: 1.7;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        @media (min-width: 820px) {
          .hdr-nav {
            display: flex;
          }
          .hdr-carrito {
            margin-left: 22px;
          }
          .hdr-logo :global(img) {
            height: 32px;
          }
        }
      `}</style>
    </>
  )
}
