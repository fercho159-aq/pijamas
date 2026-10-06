import type { MetadataRoute } from 'next'
import { SITIO } from '@/lib/sitio'

/**
 * Lo que Google puede recorrer. El panel, el carrito y el cierre de pedido
 * quedan fuera: no aportan nada en resultados y traen datos de cada clienta.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/carrito', '/pedido', '/pedido/', '/api/'],
      },
    ],
    sitemap: `${SITIO}/sitemap.xml`,
  }
}
