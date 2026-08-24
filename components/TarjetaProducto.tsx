import Image from 'next/image'
import Link from 'next/link'
import type { Producto } from '@/lib/tipos'
import { pesos, precio, descuento, existencias } from '@/lib/formato'

export default function TarjetaProducto({
  p,
  prioridad = false,
}: {
  p: Producto
  prioridad?: boolean
}) {
  const stock = existencias(p)
  const agotado = stock === 0
  const pocos = stock > 0 && stock <= 8
  const off = descuento(p)
  const portada = p.colores[0]

  return (
    <Link href={`/producto/${p.slug}`} className={`tp ${agotado ? 'tp-gris' : ''}`}>
      <div className="tp-foto">
        {agotado ? (
          <span className="tag tag-out">Agotado</span>
        ) : off ? (
          <span className="tag tag-off">−{off}%</span>
        ) : pocos ? (
          <span className="tag tag-few">Últimas {stock}</span>
        ) : null}
        <Image
          src={portada.img}
          alt={`${p.nombre}, modelo ${p.numero}, color ${portada.nombre}`}
          width={600}
          height={800}
          sizes="(min-width: 940px) 260px, (min-width: 620px) 32vw, 46vw"
          priority={prioridad}
        />
      </div>

      <h3>{p.nombre}</h3>
      <div className="tp-mod">MODELO {p.numero}</div>

      <div className="tp-precio">
        <span className="money">{pesos(precio(p))}</span>
        {p.precioOferta && <s>{pesos(p.precioLista)}</s>}
      </div>

      <div className="tp-colores" aria-label={`${p.colores.length} colores`}>
        {p.colores.slice(0, 5).map((c) => (
          <i key={c.sku} style={{ background: c.hex }} title={c.nombre} />
        ))}
        {p.colores.length > 5 && <em>+{p.colores.length - 5}</em>}
      </div>
    </Link>
  )
}
