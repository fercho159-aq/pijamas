import type { Producto } from './tipos'

export const pesos = (n: number) =>
  '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 })

/** Precio que se muestra y se cobra. Una sola fuente, como precio_vigente() en la base. */
export const precio = (p: Producto) => p.precioOferta ?? p.precioLista

export const descuento = (p: Producto) =>
  p.precioOferta ? Math.round((1 - p.precioOferta / p.precioLista) * 100) : 0

export const existencias = (p: Producto) =>
  p.colores.reduce((t, c) => t + c.stock, 0)

export const colorPorNombre = (p: Producto, nombre: string) =>
  p.colores.find((c) => c.nombre === nombre) ?? p.colores[0]

/**
 * La foto de portada. No siempre es el primer color: la clienta publica más
 * colores de los que tiene fotografiados, así que se toma el primero que sí
 * tenga foto y, si ninguno la tiene, el primero a secas para su muestra.
 */
export const portada = (p: Producto) => p.colores.find((c) => c.img) ?? p.colores[0]
