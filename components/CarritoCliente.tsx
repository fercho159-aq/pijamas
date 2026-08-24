'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCarrito } from './CarritoProvider'
import { pesos, precio, colorPorNombre } from '@/lib/formato'
import type { Producto, Config } from '@/lib/tipos'

export default function CarritoCliente({
  productos,
  config,
}: {
  productos: Producto[]
  config: Config
}) {
  const { lineas, piezas, cambiarCantidad, quitar, listo } = useCarrito()

  if (!listo) return <div className="vacio">Cargando tu carrito…</div>

  if (lineas.length === 0)
    return (
      <div className="vacio">
        <h2>Tu carrito está vacío</h2>
        <p>Todavía no has agregado nada.</p>
        <Link className="btn btn-pri" href="/dama">
          Ver catálogo
        </Link>
      </div>
    )

  const filas = lineas.map((l) => {
    const p = productos.find((x) => x.numero === l.numero)!
    return { l, p, c: colorPorNombre(p, l.color) }
  })

  const subtotal = filas.reduce((t, f) => t + precio(f.p) * f.l.cantidad, 0)
  const envio = subtotal >= config.envioGratisDesde ? 0 : config.costoEnvio
  const falta = Math.max(0, config.envioGratisDesde - subtotal)
  const avance = Math.min(100, Math.round((subtotal / config.envioGratisDesde) * 100))

  return (
    <section className="seccion envoltura" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 'clamp(24px,4.6vw,32px)' }}>Tu carrito</h1>
      <p className="apunte" style={{ margin: '8px 0 18px' }}>
        {piezas} {piezas === 1 ? 'artículo' : 'artículos'}
      </p>

      {filas.map((f, i) => (
        <div className="cl" key={`${f.l.numero}-${f.l.color}-${f.l.talla}`}>
          <Link href={`/producto/${f.p.slug}`}>
            <Image src={f.c.img} alt={f.p.nombre} width={600} height={800} sizes="80px" />
          </Link>
          <div>
            <h3>{f.p.nombre}</h3>
            <div className="cl-meta">
              Modelo {f.p.numero} · {f.c.nombre} · Talla {f.l.talla}
            </div>
            <div className="cl-fin">
              <div className="cant">
                <button onClick={() => cambiarCantidad(i, -1)} aria-label="Quitar uno">
                  −
                </button>
                <span>{f.l.cantidad}</span>
                <button onClick={() => cambiarCantidad(i, 1)} aria-label="Agregar uno">
                  +
                </button>
              </div>
              <span className="money">{pesos(precio(f.p) * f.l.cantidad)}</span>
            </div>
            <button className="cl-quitar" onClick={() => quitar(i)}>
              Quitar
            </button>
          </div>
        </div>
      ))}

      {/* Barra de envío gratis: la palanca de ticket promedio más honesta que hay. */}
      <div className={`envioBox ${falta ? '' : 'ok'}`}>
        <p>
          {falta ? (
            <>
              Te faltan <b>{pesos(falta)}</b> para envío gratis
            </>
          ) : (
            <>✓ Tu pedido tiene envío gratis</>
          )}
        </p>
        <div className="envioBar">
          <i style={{ width: `${avance}%` }} />
        </div>
      </div>

      <div className="totales">
        <div className="tr">
          <span>Subtotal</span>
          <span className="money">{pesos(subtotal)}</span>
        </div>
        <div className="tr">
          <span>Envío</span>
          <span className="money">{envio ? pesos(envio) : 'Gratis'}</span>
        </div>
        <div className="tr grande">
          <span>Total</span>
          <span className="money">{pesos(subtotal + envio)}</span>
        </div>
      </div>

      <Link className="btn btn-pri btn-full" href="/pedido" style={{ marginTop: 20 }}>
        Continuar
      </Link>
      <p className="apunte" style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
        Confirmas tu pedido por WhatsApp. Pago con tarjeta muy pronto.
      </p>
    </section>
  )
}
