import { getProductos, getCategorias } from './datos'
import { precio } from './formato'
import type { Producto } from './tipos'

export type EntradaTipo = { etiqueta: string; cuantos: number; href: string }
export type Vitrina = { nombre: string; slug: string; img: string; precio: number }
export type RamaMenu = {
  slug: string
  nombre: string
  sub: string
  cuantos: number
  tipos: EntradaTipo[]
  vitrina: Vitrina[]
}

/**
 * El menú se arma del catálogo, no de una lista escrita a mano: si mañana
 * entra un modelo de un tipo nuevo, aparece solo.
 */
export async function getMenu(): Promise<RamaMenu[]> {
  const [productos, categorias] = await Promise.all([getProductos(), getCategorias()])

  return categorias.map((c) => {
    const items = productos.filter((p) => p.categoria === c.slug)

    const cuenta = new Map<string, number>()
    for (const p of items) {
      if (!p.tipo) continue
      cuenta.set(p.tipo, (cuenta.get(p.tipo) ?? 0) + 1)
    }

    const tipos = [...cuenta.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
      .map(([etiqueta, cuantos]) => ({
        etiqueta,
        cuantos,
        href: `/${c.slug}?tipo=${encodeURIComponent(etiqueta)}`,
      }))

    // primero los destacados; si no alcanzan, se completa con los demás
    const orden = (p: Producto) => (p.destacado ? 0 : 1)
    const vitrina = [...items]
      .sort((a, b) => orden(a) - orden(b))
      .slice(0, 3)
      .map((p) => ({
        nombre: p.nombre,
        slug: p.slug,
        img: p.colores[0].img,
        precio: precio(p),
      }))

    return { slug: c.slug, nombre: c.nombre, sub: c.sub, cuantos: items.length, tipos, vitrina }
  })
}
