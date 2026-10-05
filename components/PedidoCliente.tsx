'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCarrito } from './CarritoProvider'
import { pesos, precio, colorPorNombre } from '@/lib/formato'
import { cerrarPorWhatsApp, pagarConTarjeta } from '@/lib/acciones-tienda'
import type { Producto, Config } from '@/lib/tipos'

const CAMPOS = [
  { id: 'nombre', et: 'Nombre completo', ph: 'María Hernández', req: true },
  { id: 'telefono', et: 'WhatsApp a 10 dígitos', ph: '55 1234 5678', req: true, num: true },
  { id: 'calle', et: 'Calle y número', ph: 'Av. Juárez 145, int. 3', req: true },
] as const

export default function PedidoCliente({
  productos,
  config,
}: {
  productos: Producto[]
  config: Config
}) {
  const { lineas, vaciar, listo } = useCarrito()
  const [datos, setDatos] = useState<Record<string, string>>({})
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [aviso, setAviso] = useState('')
  const [yendo, setYendo] = useState<'wa' | 'mp' | null>(null)
  const [enviado, setEnviado] = useState<{ folio: string; msg: string; url: string } | null>(null)

  if (!listo) return <div className="vacio">Un momento…</div>

  if (!enviado && lineas.length === 0)
    return (
      <div className="vacio">
        <h2>No hay nada que confirmar</h2>
        <p>Tu carrito está vacío.</p>
        <Link className="btn btn-pri" href="/catalogo">
          Ver catálogo
        </Link>
      </div>
    )

  if (enviado)
    return (
      <section className="seccion envoltura" style={{ maxWidth: 620 }}>
        <div className="okIcono" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 style={{ fontSize: 25, textAlign: 'center' }}>Pedido {enviado.folio} creado</h1>
        <p className="apunte" style={{ textAlign: 'center', margin: '10px 0 4px' }}>
          Ya quedó guardado. Este es el mensaje que se abre en WhatsApp:
        </p>
        <pre className="waMsg">{enviado.msg}</pre>
        <a
          className="btn btn-wa btn-full"
          href={enviado.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir WhatsApp
        </a>
        <Link className="btn btn-out btn-full" href="/" style={{ marginTop: 10 }}>
          Seguir viendo
        </Link>
        <p className="apunte" style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          Aunque no envíes el mensaje, tu pedido queda registrado y te damos seguimiento.
        </p>
      </section>
    )

  const items = lineas.map((l) => {
    const p = productos.find((x) => x.numero === l.numero)!
    return { producto: p, color: colorPorNombre(p, l.color), talla: l.talla, cantidad: l.cantidad }
  })
  const subtotal = items.reduce((t, i) => t + precio(i.producto) * i.cantidad, 0)
  const envio = subtotal >= config.envioGratisDesde ? 0 : config.costoEnvio

  function revisar() {
    const errs: Record<string, string> = {}
    if (!datos.nombre?.trim()) errs.nombre = 'Necesitamos tu nombre para preparar el pedido.'
    const tel = (datos.telefono || '').replace(/\D/g, '')
    if (tel.length !== 10) errs.telefono = 'Escribe tu WhatsApp a 10 dígitos, sin lada del país.'
    if (!datos.calle?.trim()) errs.calle = 'Sin calle y número no podemos enviarlo.'
    setErrores(errs)
    setAviso('')
    return Object.keys(errs).length === 0
  }

  // El pedido se arma en el servidor: ahí se revisan precios y existencias.
  const entrada = () => ({
    datos: {
      nombre: datos.nombre ?? '',
      telefono: datos.telefono ?? '',
      email: datos.email ?? '',
      calle: datos.calle ?? '',
      colonia: datos.colonia ?? '',
      ciudad: datos.ciudad ?? '',
      estado: datos.estado ?? '',
      cp: datos.cp ?? '',
      referencias: datos.referencias ?? '',
    },
    lineas,
  })

  async function cerrarWhatsApp() {
    if (!revisar() || yendo) return
    setYendo('wa')
    try {
      const r = await cerrarPorWhatsApp(entrada())
      if (!r.ok) return setAviso(r.error)
      setEnviado({ folio: r.folio, msg: r.mensaje, url: r.url })
      vaciar()
    } catch {
      setAviso('No se pudo cerrar el pedido. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setYendo(null)
    }
  }

  async function pagarTarjeta() {
    if (!revisar() || yendo) return
    setYendo('mp')
    try {
      const r = await pagarConTarjeta(entrada())
      if (!r.ok) {
        setAviso(r.error)
        setYendo(null)
        return
      }
      window.location.href = r.url // a Mercado Pago; el carrito se vacía al volver pagado
    } catch {
      setAviso('No se pudo abrir el pago. Inténtalo de nuevo o ciérralo por WhatsApp.')
      setYendo(null)
    }
  }

  return (
    <section className="seccion envoltura" style={{ maxWidth: 620 }}>
      <h1 style={{ fontSize: 'clamp(24px,4.6vw,32px)' }}>Datos de envío</h1>
      <p className="apunte" style={{ margin: '8px 0 20px' }}>
        Los guardamos para preparar tu pedido antes de que escribas.
      </p>

      {CAMPOS.map((c) => (
        <div className="campo" key={c.id}>
          <label htmlFor={c.id}>{c.et}</label>
          <input
            id={c.id}
            placeholder={c.ph}
            inputMode={'num' in c && c.num ? 'numeric' : undefined}
            value={datos[c.id] ?? ''}
            aria-invalid={!!errores[c.id]}
            onChange={(e) => setDatos({ ...datos, [c.id]: e.target.value })}
          />
          {errores[c.id] && <div className="error">{errores[c.id]}</div>}
        </div>
      ))}

      <div className="dosCol">
        <div className="campo">
          <label htmlFor="colonia">Colonia</label>
          <input id="colonia" placeholder="Centro" onChange={(e) => setDatos({ ...datos, colonia: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="cp">Código postal</label>
          <input id="cp" inputMode="numeric" placeholder="06000" onChange={(e) => setDatos({ ...datos, cp: e.target.value })} />
        </div>
      </div>
      <div className="dosCol">
        <div className="campo">
          <label htmlFor="ciudad">Ciudad</label>
          <input id="ciudad" placeholder="Ciudad de México" onChange={(e) => setDatos({ ...datos, ciudad: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="estado">Estado</label>
          <input id="estado" placeholder="CDMX" onChange={(e) => setDatos({ ...datos, estado: e.target.value })} />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="ref">Referencias para el repartidor</label>
        <textarea id="ref" rows={2} placeholder="Portón verde, entre Morelos y Allende"
          onChange={(e) => setDatos({ ...datos, referencias: e.target.value })} />
      </div>
      {config.mercadopago && (
        <div className="campo">
          <label htmlFor="email">
            Correo <span className="apunte">(para tu comprobante de pago)</span>
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            placeholder="maria@correo.com"
            value={datos.email ?? ''}
            onChange={(e) => setDatos({ ...datos, email: e.target.value })}
          />
        </div>
      )}

      <label className="acepto">
        <input type="checkbox" defaultChecked />
        <span>
          Acepto el aviso de privacidad y que me contacten por WhatsApp para confirmar este pedido.
        </span>
      </label>

      <div className="totales">
        <div className="tr"><span>Subtotal</span><span className="money">{pesos(subtotal)}</span></div>
        <div className="tr"><span>Envío</span><span className="money">{envio ? pesos(envio) : 'Gratis'}</span></div>
        <div className="tr grande"><span>Total</span><span className="money">{pesos(subtotal + envio)}</span></div>
      </div>

      {aviso && <div className="error" style={{ marginTop: 14 }}>{aviso}</div>}

      {config.mercadopago && (
        <>
          <button
            className="btn btn-pri btn-full"
            style={{ marginTop: 18 }}
            disabled={yendo !== null}
            onClick={pagarTarjeta}
          >
            {yendo === 'mp' ? 'Abriendo el pago…' : 'Pagar con tarjeta'}
          </button>
          <p className="apunte" style={{ textAlign: 'center', margin: '8px 0 2px', fontSize: 13 }}>
            El pago lo procesa Mercado Pago. Tus datos de tarjeta no pasan por esta tienda.
          </p>
        </>
      )}

      <button
        className="btn btn-wa btn-full"
        style={{ marginTop: config.mercadopago ? 10 : 18 }}
        disabled={yendo !== null}
        onClick={cerrarWhatsApp}
      >
        {yendo === 'wa' ? 'Preparando tu pedido…' : 'Enviar pedido por WhatsApp'}
      </button>
    </section>
  )
}
