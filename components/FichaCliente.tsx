'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCarrito } from './CarritoProvider'
import { pesos, precio, descuento } from '@/lib/formato'
import { waProducto } from '@/lib/whatsapp'
import type { Producto } from '@/lib/tipos'

export default function FichaCliente({
  p,
  tallas,
  numeroWa,
}: {
  p: Producto
  tallas: string[]
  numeroWa: string
}) {
  const [iColor, setIColor] = useState(0)
  const [talla, setTalla] = useState<string | null>(null)
  const [agregado, setAgregado] = useState(false)
  const { agregar } = useCarrito()
  const router = useRouter()

  const color = p.colores[iColor]
  const agotado = color.stock === 0
  const off = descuento(p)
  const wa = waProducto(numeroWa, p, color, talla ?? undefined)

  // el botón flotante toma el contexto de esta ficha
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('wa:contexto', { detail: wa }))
  }, [wa])

  function alAgregar() {
    if (!talla || agotado) return
    agregar({ numero: p.numero, color: color.nombre, talla, cantidad: 1 })
    setAgregado(true)
    setTimeout(() => router.push('/carrito'), 420)
  }

  return (
    <div className="ficha">
      <div className="ficha-foto">
        {off > 0 && <span className="tag tag-off">−{off}%</span>}
        <Image
          src={color.img}
          alt={`${p.nombre}, modelo ${p.numero}, color ${color.nombre}`}
          width={600}
          height={800}
          sizes="(min-width: 820px) 500px, 100vw"
          priority
        />
      </div>

      <div className="ficha-datos">
        <h1>{p.nombre}</h1>
        <div className="ficha-mod">
          Modelo {p.numero}
          {p.tipo ? ` · ${p.tipo}` : ''}
        </div>

        <div className="ficha-precio">
          <span className="money ahora">{pesos(precio(p))}</span>
          {p.precioOferta && (
            <>
              <s>{pesos(p.precioLista)}</s>
              <span className="ahorro">Ahorras {pesos(p.precioLista - p.precioOferta)}</span>
            </>
          )}
        </div>

        <p className="ficha-desc">{p.descripcion}</p>

        <div className="opcion">
          <div className="opcion-t">
            <span>Color</span>
            <b>{color.nombre}</b>
          </div>
          <div className="colores">
            {p.colores.map((c, i) => (
              <button
                key={c.sku}
                onClick={() => {
                  setIColor(i)
                  setTalla(null)
                }}
                aria-pressed={i === iColor}
                aria-label={`Color ${c.nombre}${c.stock === 0 ? ', agotado' : ''}`}
                title={c.nombre}
                className={c.stock === 0 ? 'sin' : ''}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="opcion">
          <div className="opcion-t">
            <span>Talla</span>
            <Link href="/guia-de-tallas">Guía de tallas</Link>
          </div>
          <div className="tallas">
            {tallas.map((t) => (
              <button
                key={t}
                onClick={() => setTalla(t)}
                aria-pressed={talla === t}
                disabled={agotado}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* La escasez sale del stock real. Si no hay dato, no hay mensaje. */}
        {agotado ? (
          <div className="aviso ido">
            Agotado en {color.nombre}. Escríbenos y te avisamos cuando regrese.
          </div>
        ) : color.stock <= 5 ? (
          <div className="aviso">
            Últimas {color.stock} piezas en {color.nombre}
          </div>
        ) : null}

        <div className="barra">
          <button
            className="btn btn-pri"
            onClick={alAgregar}
            disabled={agotado || !talla || agregado}
          >
            {agotado ? 'Agotado' : agregado ? '✓ Agregado' : talla ? 'Agregar al carrito' : 'Elige tu talla'}
          </button>
          <a
            className="btn btn-wa"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Preguntar por WhatsApp"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
