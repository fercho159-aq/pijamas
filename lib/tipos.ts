export type Color = {
  nombre: string
  hex: string
  sku: string
  stock: number
  /** null mientras no llegue la foto de ese color: se muestra la muestra sólida. */
  img: string | null
}

export type Producto = {
  /** Solo con base de datos: identifica el modelo aunque cambie de número. */
  id?: string
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
  /** ISO. Cuándo vence la oferta vigente; al vencer, el precio vuelve solo al de lista. */
  ofertaTermina?: string | null
  destacado: boolean
  /** false = oculto de la tienda, p. ej. por poca existencia. Ausente cuenta como publicado. */
  activo?: boolean
  /** Color de la portada. Se reparte entre modelos para que el catálogo muestre variedad. */
  portada?: string | null
  /** La escala varía por modelo: la clienta maneja M–XX, M–XXX, CH–XG y petite CH–G. */
  tallas: string[]
  colores: Color[]
}

export type ColorPaleta = { numero: number; nombre: string; hex: string }

/* ── Panel: lo que manda el editor de modelos al guardar ── */

export type ColorEntrada = {
  nombre: string
  hex: string
  /** Vacío en los colores nuevos: el servidor les asigna uno. */
  sku?: string
  stock: number
  img: string | null
}

export type ModeloEntrada = {
  id: string | null
  numero: number
  nombre: string
  categoria: string
  tipo: string
  descripcion: string
  composicion: string
  cuidados: string
  precioLista: number
  precioOferta: number | null
  /** ISO. El navegador convierte su hora local antes de enviarla. */
  ofertaTermina: string | null
  destacado: boolean
  activo: boolean
  portada: string | null
  tallas: string[]
  colores: ColorEntrada[]
}

/** Listas que el editor ofrece para elegir en vez de escribir. */
export type OpcionesForma = {
  categorias: { slug: string; nombre: string }[]
  paleta: { nombre: string; hex: string }[]
  tipos: string[]
  composiciones: string[]
  cuidados: string[]
  tallas: string[]
  modelos: { numero: number; nombre: string }[]
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
