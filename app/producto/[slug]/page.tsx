import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import FichaCliente from '@/components/FichaCliente'
import TarjetaProducto from '@/components/TarjetaProducto'
import Resenas from '@/components/Resenas'
import { getResenasDe, resenasSonEjemplo, promedio } from '@/lib/resenas'
import { getProducto, getProductos, getConfig, TALLAS } from '@/lib/datos'
import { precio, existencias, pesos } from '@/lib/formato'

export async function generateStaticParams() {
  const todos = await getProductos()
  return todos.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = await getProducto(slug)
  if (!p) return {}
  return {
    title: `${p.nombre} · Modelo ${p.numero}`,
    description: p.descripcion,
    openGraph: { images: [p.colores[0].img], title: p.nombre, description: p.descripcion },
  }
}

export default async function Ficha({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [p, todos, config] = await Promise.all([getProducto(slug), getProductos(), getConfig()])
  const resenas = p ? await getResenasDe(p.numero) : []
  if (!p) notFound()

  const relacionados = todos.filter((x) => x.categoria === p.categoria && x.numero !== p.numero).slice(0, 6)
  const hay = existencias(p) > 0

  // Datos estructurados: es lo que hace que Google muestre precio y disponibilidad.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.nombre} — Modelo ${p.numero}`,
    description: p.descripcion,
    sku: p.colores[0].sku,
    brand: { '@type': 'Brand', name: 'Rossy Lady' },
    image: p.colores.map((c) => c.img),
    ...(resenas.length >= 3 && !resenasSonEjemplo
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: promedio(resenas),
            reviewCount: resenas.length,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      price: precio(p),
      priceCurrency: 'MXN',
      availability: hay
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="envoltura">
        <FichaCliente p={p} tallas={TALLAS} numeroWa={config.whatsapp} />

        <div className="ficha-acc">
          <details className="acc">
            <summary>Composición y cuidados</summary>
            <div className="cuerpo">
              {p.composicion}. {p.cuidados}
            </div>
          </details>
          <details className="acc">
            <summary>Envíos</summary>
            <div className="cuerpo">
              Pide antes de las {config.horaCorte} y tu pedido sale hoy. Llega de 2 a 4 días
              hábiles según tu estado. Envío gratis desde {pesos(config.envioGratisDesde)}; abajo
              de ese monto, {pesos(config.costoEnvio)}.
            </div>
          </details>
          <details className="acc">
            <summary>Cambios y devoluciones</summary>
            <div className="cuerpo">
              Cambio de talla sin costo dentro de los primeros 15 días, con la prenda sin usar y
              con etiqueta. Por razones de higiene no aceptamos devoluciones de prendas usadas.
            </div>
          </details>
        </div>
      </div>

      <Resenas rs={resenas} ejemplo={resenasSonEjemplo} />

      {relacionados.length > 0 && (
        <section className="seccion envoltura">
          <div className="seccion-t">
            <h2>También te puede gustar</h2>
            <Link href={`/${p.categoria}`}>Ver todo</Link>
          </div>
          <div className="riel">
            {relacionados.map((x) => (
              <TarjetaProducto key={x.numero} p={x} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
