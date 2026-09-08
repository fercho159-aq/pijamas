import Image from 'next/image'
import type { Color } from '@/lib/tipos'

/**
 * La clienta publica más colores de los que tiene fotografiados: su lista da
 * hasta 8 colores por modelo y de varios solo llegó una foto. Mientras tanto
 * el color se muestra como muestra sólida en el mismo hueco, con el mismo
 * 3:4, para que la rejilla no se desacomode cuando lleguen las fotos.
 */
export default function FotoColor({
  c,
  alt,
  sizes,
  prioridad = false,
  etiqueta = false,
}: {
  c: Color
  alt: string
  sizes: string
  prioridad?: boolean
  etiqueta?: boolean
}) {
  if (c.img)
    return (
      <Image src={c.img} alt={alt} width={600} height={800} sizes={sizes} priority={prioridad} />
    )

  return (
    <div className="muestra" style={{ background: c.hex }} role="img" aria-label={`${alt}. Foto pendiente`}>
      {etiqueta && <span>Foto en camino</span>}
    </div>
  )
}
