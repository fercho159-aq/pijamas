import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import TarjetaProducto from '@/components/TarjetaProducto'
import { getCategorias, getPorCategoria, getOfertas } from '@/lib/datos'

const OFERTAS = { slug: 'ofertas', nombre: 'Ofertas', sub: 'Precios especiales por tiempo limitado' }

async function resolver(slug: string) {
  if (slug === 'ofertas') return { cat: OFERTAS, items: await getOfertas() }
  const cats = await getCategorias()
  const cat = cats.find((c) => c.slug === slug)
  if (!cat) return null
  return { cat, items: await getPorCategoria(slug) }
}

export async function generateStaticParams() {
  const cats = await getCategorias()
  return [...cats.map((c) => ({ categoria: c.slug })), { categoria: 'ofertas' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>
}): Promise<Metadata> {
  const { categoria } = await params
  const r = await resolver(categoria)
  if (!r) return {}
  return { title: r.cat.nombre, description: r.cat.sub }
}

export default async function Categoria({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const r = await resolver(categoria)
  if (!r) notFound()

  const colores = r.items.reduce((t, p) => t + p.colores.length, 0)

  return (
    <section className="seccion envoltura">
      <h1 style={{ fontSize: 'clamp(24px,4.6vw,34px)', letterSpacing: '-.02em' }}>
        {r.cat.nombre}
      </h1>
      <p className="apunte" style={{ margin: '8px 0 22px' }}>
        {r.items.length} {r.items.length === 1 ? 'modelo' : 'modelos'} · {colores} colores
      </p>

      {r.items.length === 0 ? (
        <div className="vacio">
          <h2>Todavía no hay nada aquí</h2>
          <p>Vuelve pronto, estamos surtiendo.</p>
        </div>
      ) : (
        <div className="rejilla">
          {r.items.map((p, i) => (
            <TarjetaProducto key={p.numero} p={p} prioridad={i < 4} />
          ))}
        </div>
      )}
    </section>
  )
}
