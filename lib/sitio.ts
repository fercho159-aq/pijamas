/**
 * La dirección pública del sitio, en un solo lugar.
 *
 * Se define con NEXT_PUBLIC_SITE_URL en Vercel. Importa que sea UNA sola
 * (con www o sin www): es la que Google toma como buena y la que firma los
 * enlaces canónicos, el sitemap y las imágenes al compartir.
 */
export const SITIO = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rossylady.com').replace(/\/$/, '')

export const url = (ruta = '/') => new URL(ruta, SITIO).href
