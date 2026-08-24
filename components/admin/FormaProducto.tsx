'use client'

import { useActionState, useState, useTransition } from 'react'
import Image from 'next/image'
import { guardarProducto, guardarStock } from '@/lib/acciones'
import { pesos, descuento } from '@/lib/formato'
import type { Producto } from '@/lib/tipos'

export default function FormaProducto({ p }: { p: Producto }) {
  const [estado, accion, guardando] = useActionState(guardarProducto, null)
  const [lista, setLista] = useState(p.precioLista)
  const [oferta, setOferta] = useState(p.precioOferta ?? ('' as number | ''))

  const off =
    typeof oferta === 'number' && oferta > 0 && oferta < lista
      ? Math.round((1 - oferta / lista) * 100)
      : 0

  return (
    <div className="adm-cols2">
      <form action={accion} className="adm-caja">
        <input type="hidden" name="numero" value={p.numero} />

        <h2>Datos</h2>
        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" defaultValue={p.nombre} />
        </div>
        <div className="campo">
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion" rows={4} defaultValue={p.descripcion} />
        </div>
        <div className="campo">
          <label htmlFor="composicion">Composición y gramaje</label>
          <input id="composicion" name="composicion" defaultValue={p.composicion} />
          <p className="adm-pista">
            Obligatorio por la NOM‑004‑SCFI y tiene que coincidir con la etiqueta cosida.
          </p>
        </div>

        <h2>Precio y oferta</h2>
        <div className="dosCol">
          <div className="campo">
            <label htmlFor="precioLista">Precio de lista</label>
            <input
              id="precioLista"
              name="precioLista"
              inputMode="numeric"
              value={lista}
              onChange={(e) => setLista(Number(e.target.value) || 0)}
            />
          </div>
          <div className="campo">
            <label htmlFor="precioOferta">Precio de oferta</label>
            <input
              id="precioOferta"
              name="precioOferta"
              inputMode="numeric"
              placeholder="Vacío = sin oferta"
              value={oferta}
              onChange={(e) => setOferta(e.target.value === '' ? '' : Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="ofertaTermina">La oferta termina</label>
          <input id="ofertaTermina" name="ofertaTermina" type="datetime-local" />
          <p className="adm-pista">
            La cuenta regresiva de la tienda lee esta fecha. Al vencer, el precio vuelve solo al de
            lista: por eso el contador nunca puede contradecir lo que se cobra.
          </p>
        </div>

        {off > 0 && (
          <p className="adm-previo">
            Se mostrará <b>{pesos(oferta as number)}</b> tachando {pesos(lista)} · etiqueta{' '}
            <b>−{off}%</b> · ahorro de {pesos(lista - (oferta as number))}
          </p>
        )}
        {typeof oferta === 'number' && oferta >= lista && oferta > 0 && (
          <p className="adm-error">La oferta debe ser menor que el precio de lista.</p>
        )}

        {estado && <p className={estado.ok ? 'adm-ok' : 'adm-error'}>{estado.mensaje}</p>}

        <button className="btn btn-pri" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <div className="adm-caja">
        <h2>Existencias por color</h2>
        <p className="adm-pista">
          De aquí sale el aviso «Últimas N piezas» de la ficha, y solo aparece cuando quedan 5 o
          menos. Si el número no es real, la tienda lo repite igual.
        </p>
        <div className="adm-variantes">
          {p.colores.map((c) => (
            <Variante key={c.sku} sku={c.sku} nombre={c.nombre} hex={c.hex} stock={c.stock} img={c.img} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Variante({
  sku,
  nombre,
  hex,
  stock,
  img,
}: {
  sku: string
  nombre: string
  hex: string
  stock: number
  img: string
}) {
  const [n, setN] = useState(stock)
  const [aviso, setAviso] = useState<string | null>(null)
  const [pendiente, empezar] = useTransition()

  return (
    <div className="adm-var">
      <Image src={img} alt="" width={600} height={800} sizes="40px" />
      <span className="adm-punto" style={{ background: hex }} aria-hidden="true" />
      <div className="adm-var-txt">
        <b>{nombre}</b>
        <span>{sku}</span>
      </div>
      <input
        inputMode="numeric"
        value={n}
        aria-label={`Existencias de ${nombre}`}
        onChange={(e) => setN(Math.max(0, Number(e.target.value) || 0))}
      />
      <button
        className="btn btn-out"
        disabled={pendiente || n === stock}
        onClick={() => empezar(async () => setAviso((await guardarStock(sku, n)).mensaje))}
      >
        {pendiente ? '…' : 'Guardar'}
      </button>
      {aviso && <p className="adm-var-aviso">{aviso}</p>}
    </div>
  )
}
