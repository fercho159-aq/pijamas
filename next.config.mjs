/** @type {import('next').NextConfig} */
export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    // fotos que sube la clienta desde el panel (Vercel Blob)
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  // Postgres local de desarrollo: trae su propio .wasm y no se debe empaquetar
  serverExternalPackages: ['@electric-sql/pglite'],
  // la primera conexión a Neon lee estos archivos para armar la base
  outputFileTracingIncludes: { '/**': ['./db/schema.sql', './data/catalogo.json'] },
  experimental: {
    // Las fotos se reducen en el navegador antes de subir; esto deja margen.
    // Vercel no acepta cuerpos de más de 4.5 MB.
    serverActions: { bodySizeLimit: '4mb' },
  },
}
