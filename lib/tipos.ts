export type Color = {
  nombre: string
  hex: string
  sku: string
  stock: number
  /** null mientras no llegue la foto de ese color: se muestra la muestra sólida. */
  img: string | null
}

export type Producto = {
  numero: number
  nombre: string
  slug: string
  categoria: string
  tipo: string
  descripcion: string
  composicion: string
  cuidados: string
  precioLista: number
  precioOferta: number | null
  destacado: boolean
  /** La escala varía por modelo: la clienta maneja M–XX, M–XXX, CH–XG y petite CH–G. */
  tallas: string[]
  colores: Color[]
}

export type ColorPaleta = { numero: number; nombre: string; hex: string }

export type Categoria = { slug: string; nombre: string; sub: string }

export type Config = {
  envioGratisDesde: number
  costoEnvio: number
  horaCorte: string
  whatsapp: string
}

/** Una línea del carrito. Se guarda en localStorage, por eso es plana. */
export type LineaCarrito = {
  numero: number
  color: string
  talla: string
  cantidad: number
}
