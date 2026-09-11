import 'server-only'
import sharp from 'sharp'
import { modoBase } from './db'

const TOPE_ANCHO = 1000 // la ficha se pinta a 500 px: alcanza para pantallas de doble densidad
const PESO_MAXIMO = 15 * 1024 * 1024

/**
 * Recibe la foto tal como la sube la clienta y la deja lista para la tienda:
 * la endereza según el celular, la recorta a 3:4 cuidando el centro de
 * atención, la reduce sin agrandarla nunca y la guarda como JPG.
 * Devuelve la URL pública.
 */
export async function guardarFoto(archivo: File, nombreBase: string): Promise<string> {
  if (archivo.size > PESO_MAXIMO) throw new Error('La foto pesa más de 15 MB. Usa una más ligera.')

  const entrada = Buffer.from(await archivo.arrayBuffer())
  let jpg: Buffer
  try {
    const meta = await sharp(entrada).rotate().metadata()
    const ancho = Math.min(
      TOPE_ANCHO,
      meta.width ?? TOPE_ANCHO,
      Math.round(((meta.height ?? TOPE_ANCHO * 1.333) * 3) / 4)
    )
    jpg = await sharp(entrada)
      .rotate()
      .resize(ancho, Math.round((ancho * 4) / 3), { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toBuffer()
  } catch {
    throw new Error(
      'No se pudo leer la foto. Usa JPG o PNG; en iPhone, elige «Más compatible» en los ajustes de la cámara.'
    )
  }

  const nombre = `${nombreBase}-${Date.now().toString(36)}.jpg`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const r = await put(`productos/${nombre}`, jpg, { access: 'public', contentType: 'image/jpeg' })
    return r.url
  }

  if (modoBase === 'local') {
    // desarrollo: se guarda en public/subidas, que `next dev` sirve al momento
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const carpeta = path.join(process.cwd(), 'public', 'subidas')
    await fs.mkdir(carpeta, { recursive: true })
    await fs.writeFile(path.join(carpeta, nombre), jpg)
    return `/subidas/${nombre}`
  }

  throw new Error('Falta conectar el almacenamiento de fotos (Vercel Blob).')
}
