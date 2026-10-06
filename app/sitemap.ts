import type { MetadataRoute } from 'next'
import { getCategorias, getOfertas, getProductos } from '@/lib/datos'
import { SITIO } from '@/lib/sitio'

/**
 * Mapa del sitio para Google. Sale del catálogo, así que un modelo nuevo
 * aparece aquí solo, y uno despublicado desaparece.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productos, categorias, ofertas] = await Promise.all([
    getProductos(),
    getCategorias(),
    getOfertas(),
  ])
  const ahora = new Date()

  return [
    { url: `${SITIO}/`, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITIO}/catalogo`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.9 },
    ...(ofertas.length
      ? [{ url: `${SITIO}/ofertas`, lastModified: ahora, changeFrequency: 'daily' as const, priority: 0.8 }]
      : []),
    ...categorias.map((c) => ({
      url: `${SITIO}/${c.slug}`,
      lastModified: ahora,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...productos.map((p) => ({
      url: `${SITIO}/producto/${p.slug}`,
      lastModified: ahora,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    { url: `${SITIO}/guia-de-tallas`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
