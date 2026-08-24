'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { waGeneral } from '@/lib/whatsapp'

/**
 * En la ficha de producto el mensaje lo arma FichaCliente, que sí sabe qué
 * color y talla eligió la clienta, y publica el enlace aquí. Fuera de la
 * ficha se usa el mensaje general.
 */
export default function BotonWhatsApp({ numero }: { numero: string }) {
  const [visible, setVisible] = useState(false)
  const [tip, setTip] = useState(false)
  const [enlace, setEnlace] = useState(() => waGeneral(numero))
  const ruta = usePathname()
  const enFicha = ruta.startsWith('/producto/')

  useEffect(() => {
    const alScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', alScroll, { passive: true })
    const t = setTimeout(() => setVisible(true), 8000)
    return () => {
      window.removeEventListener('scroll', alScroll)
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    setTip(true)
    const t = setTimeout(() => setTip(false), 4500)
    return () => clearTimeout(t)
  }, [visible])

  useEffect(() => {
    setEnlace(waGeneral(numero))
    const escucha = (e: Event) => setEnlace((e as CustomEvent<string>).detail)
    window.addEventListener('wa:contexto', escucha)
    return () => window.removeEventListener('wa:contexto', escucha)
  }, [numero, ruta])

  return (
    <>
      <a
        href={enlace}
        target="_blank"
        rel="noopener noreferrer"
        className={`fab ${visible ? 'on' : ''} ${enFicha ? 'arriba' : ''}`}
        aria-label="Escribir por WhatsApp"
      >
        <span className={`fab-tip ${tip ? 'on' : ''}`} aria-hidden="true">
          ¿Te ayudo con tu talla?
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23z" />
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
        </svg>
      </a>

      <style jsx>{`
        .fab {
          position: fixed;
          right: 16px;
          bottom: calc(18px + env(safe-area-inset-bottom));
          z-index: 45;
          width: 54px;
          height: 54px;
          border-radius: 40px;
          background: var(--wa);
          display: grid;
          place-items: center;
          box-shadow: 0 4px 16px rgba(10, 60, 35, 0.34);
          transform: translateY(96px);
          transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.3, 1);
        }
        .fab.on {
          transform: translateY(0);
        }
        /* en la ficha sube para no tapar la barra fija de compra */
        .fab.arriba {
          bottom: calc(86px + env(safe-area-inset-bottom));
        }
        @media (min-width: 820px) {
          .fab.arriba {
            bottom: calc(18px + env(safe-area-inset-bottom));
          }
        }
        svg {
          width: 29px;
          height: 29px;
          fill: #fff;
        }
        .fab-tip {
          position: absolute;
          right: 64px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--ink);
          color: var(--ground);
          font-size: 12.5px;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 9px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .fab-tip.on {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .fab {
            transition: none;
          }
        }
      `}</style>
    </>
  )
}
