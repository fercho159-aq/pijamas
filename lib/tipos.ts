export type Color = {
  nombre: string
  hex: string
  sku: string
  stock: number
  img: string
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
  colores: Color[]
}

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
