import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ListadoFiltrable from '@/components/ListadoFiltrable'
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

  return (
    <section className="seccion envoltura">
      <h1 style={{ fontSize: 'clamp(24px,4.6vw,34px)', letterSpacing: '-.02em' }}>
        {r.cat.nombre}
      </h1>
      <Suspense fallback={<p className="apunte" style={{ margin: '0 0 20px' }}>Cargando</p>}>
        <ListadoFiltrable items={r.items} />
      </Suspense>
    </section>
  )
}
