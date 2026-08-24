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
