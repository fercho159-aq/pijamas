'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { pesos } from '@/lib/formato'
import type { RamaMenu } from '@/lib/menu'

export default function Navegacion({ menu, wa }: { menu: RamaMenu[]; wa: string }) {
  const [abierto, setAbierto] = useState<string | null>(null) // mega menú de escritorio
  const [cajon, setCajon] = useState(false) // menú vertical en móvil
  const [rama, setRama] = useState<string | null>(null) // acordeón dentro del cajón
  const [montado, setMontado] = useState(false)
  const retardo = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ruta = usePathname()

  useEffect(() => setMontado(true), [])

  // cualquier cambio de página cierra todo
  useEffect(() => {
    setAbierto(null)
    setCajon(false)
  }, [ruta])

  // con el cajón abierto, la página de atrás no debe desplazarse
  useEffect(() => {
    document.body.style.overflow = cajon ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [cajon])

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAbierto(null)
      setCajon(false)
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [])

  function entrar(slug: string) {
    if (retardo.current) clearTimeout(retardo.current)
    setAbierto(slug)
  }
  function salir() {
    if (retardo.current) clearTimeout(retardo.current)
    // margen para cruzar el hueco entre la pestaña y el panel sin que se cierre
    retardo.current = setTimeout(() => setAbierto(null), 140)
  }

  return (
    <>
      {/* ── Escritorio ─────────────────────────────────────────── */}
      <nav className="mega" aria-label="Principal" onMouseLeave={salir}>
        {menu.map((r) => (
          // El foco se escucha en el div nativo, no en el Link: Next usa su
          // propio onFocus para el prefetch y desplaza al nuestro.
          <div
            key={r.slug}
            className="mega-item"
            onMouseEnter={() => entrar(r.slug)}
            onFocusCapture={() => entrar(r.slug)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) salir()
            }}
          >
            <Link
              href={`/${r.slug}`}
              className={`mega-tab ${abierto === r.slug ? 'activo' : ''}`}
              aria-expanded={abierto === r.slug}
              aria-haspopup="true"
            >
              {r.nombre.replace('Pijamas para ', '').replace(/^\w/, (m) => m.toUpperCase())}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="mega-flecha">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>

            {abierto === r.slug && (
              <div className="mega-panel" onMouseEnter={() => entrar(r.slug)}>
                <div className="mega-cols">
                  <div className="mega-col">
                    <h3>Por tipo</h3>
                    <ul>
                      {r.tipos.map((t) => (
                        <li key={t.etiqueta}>
                          <Link href={t.href}>
                            {t.etiqueta}
                            <em>{t.cuantos}</em>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/${r.slug}`} className="mega-todo">
                      Ver los {r.cuantos} modelos →
                    </Link>
                  </div>

                  <div className="mega-col mega-vitrina">
                    <h3>Los más pedidos</h3>
                    <div className="mega-fotos">
                      {r.vitrina.map((v) => (
                        <Link key={v.slug} href={`/producto/${v.slug}`}>
                          <Image src={v.img} alt={v.nombre} width={600} height={800} sizes="150px" />
                          <b>{v.nombre}</b>
                          <span className="money">{pesos(v.precio)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mega-col mega-nota">
                    <h3>¿Dudas de talla?</h3>
                    <p>
                      Manejamos CH a 2XG con medidas en centímetros. Si quedas entre dos tallas,
                      pide la mayor: el corte es holgado.
                    </p>
                    <Link href="/guia-de-tallas" className="btn btn-out">
                      Ver guía de tallas
                    </Link>
                    <a className="mega-wa" href={wa} target="_blank" rel="noopener noreferrer">
                      O pregúntanos por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <Link href="/ofertas" className="mega-tab mega-ofertas">
          Ofertas
        </Link>
      </nav>

      {/* ── Móvil ──────────────────────────────────────────────── */}
      <button
        className="hamburguesa"
        onClick={() => setCajon(true)}
        aria-label="Abrir menú"
        aria-expanded={cajon}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* El cajon y el velo se montan en <body>: dentro de .hdr, que tiene
          backdrop-filter, el header se vuelve bloque contenedor de los
          position:fixed y el velo quedaba del alto del encabezado. */}
      {montado &&
        createPortal(
          <>
            {/* Apertura por estilo en linea: no depende de la cascada. */}
            <div
              className="velo"
              style={{ opacity: cajon ? 1 : 0, pointerEvents: cajon ? 'auto' : 'none' }}
              onClick={() => setCajon(false)}
              aria-hidden="true"
            />

            <aside
              className="cajon"
              style={{ transform: cajon ? 'translateX(0)' : 'translateX(100%)' }}
              aria-label="Menú"
              aria-hidden={!cajon}
            >
              <div className="cajon-top">
                <span>Menú</span>
                <button onClick={() => setCajon(false)} aria-label="Cerrar menú">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <nav className="cajon-nav">
                {menu.map((r) => (
                  <div key={r.slug} className="cajon-rama">
                    <button
                      className="cajon-cab"
                      onClick={() => setRama(rama === r.slug ? null : r.slug)}
                      aria-expanded={rama === r.slug}
                    >
                      <span>
                        {r.nombre}
                        <em>{r.cuantos}</em>
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className={rama === r.slug ? 'gira' : ''}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {rama === r.slug && (
                      <div className="cajon-sub">
                        <Link href={`/${r.slug}`} className="cajon-todo">
                          Ver los {r.cuantos} modelos
                        </Link>
                        {r.tipos.map((t) => (
                          <Link key={t.etiqueta} href={t.href}>
                            {t.etiqueta}
                            <em>{t.cuantos}</em>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <Link href="/ofertas" className="cajon-suelto destaque">
                  Ofertas
                </Link>
                <Link href="/guia-de-tallas" className="cajon-suelto">
                  Guía de tallas
                </Link>
                <Link href="/carrito" className="cajon-suelto">
                  Tu carrito
                </Link>
              </nav>

              <a className="btn btn-wa cajon-wa" href={wa} target="_blank" rel="noopener noreferrer">
                Escríbenos por WhatsApp
              </a>
            </aside>
          </>,
          document.body
        )}
    </>
  )
}
