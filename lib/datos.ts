import 'server-only'
import respaldo from '@/data/catalogo.json'
import type { Producto, Categoria, Config } from './tipos'

/**
 * Origen de datos.
 *
 * Sin credenciales de Supabase la app lee data/catalogo.json, así el sitio
 * se puede desplegar y demostrar antes de que exista la base. En cuanto se
 * definen NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY, las
 * mismas funciones consultan Postgres y el respaldo deja de usarse.
 */
export const usaSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const local = respaldo as unknown as {
  config: Config
  tallas: string[]
  categorias: Categoria[]
  productos: Producto[]
}

/** Consulta REST a Supabase. Evita dependencias: solo fetch. */
async function sb<T>(ruta: string): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${ruta}`
  const r = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    next: { revalidate: 60, tags: ['catalogo'] },
  })
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`)
  return r.json()
}

type FilaProducto = {
  numero_modelo: number
  nombre: string
  slug: string
  descripcion: string
  composicion: string
  cuidados: string
  precio_lista: string
  precio_oferta: string | null
  oferta_termina: string | null
  destacado: boolean
  categorias: { slug: string } | null
  variantes: {
    color_nombre: string
    color_hex: string
    sku: string
    stock: number
    orden: number
    variante_imagenes: { url: string; orden: number }[]
  }[]
}

function normaliza(f: FilaProducto): Producto {
  const vigente =
    f.precio_oferta && (!f.oferta_termina || new Date(f.oferta_termina) > new Date())
      ? Number(f.precio_oferta)
      : null
  return {
    numero: f.numero_modelo,
    nombre: f.nombre,
    slug: f.slug,
    categoria: f.categorias?.slug ?? 'dama',
    tipo: '',
    descripcion: f.descripcion,
    composicion: f.composicion,
    cuidados: f.cuidados,
    precioLista: Number(f.precio_lista),
    precioOferta: vigente,
    destacado: f.destacado,
    colores: [...f.variantes]
      .sort((a, b) => a.orden - b.orden)
      .map((v) => ({
        nombre: v.color_nombre,
        hex: v.color_hex,
        sku: v.sku,
        stock: v.stock,
        img:
          [...(v.variante_imagenes ?? [])].sort((a, b) => a.orden - b.orden)[0]?.url ??
          '/productos/placeholder.jpg',
      })),
  }
}

export async function getProductos(): Promise<Producto[]> {
  if (!usaSupabase) return local.productos
  const filas = await sb<FilaProducto[]>(
    'productos?activo=eq.true&select=*,categorias(slug),variantes(*,variante_imagenes(*))&order=numero_modelo'
  )
  return filas.map(normaliza)
}

export async function getProducto(slug: string): Promise<Producto | undefined> {
  const todos = await getProductos()
  return todos.find((p) => p.slug === slug)
}

export async function getPorCategoria(cat: string): Promise<Producto[]> {
  const todos = await getProductos()
  return todos.filter((p) => p.categoria === cat)
}

export async function getDestacados(): Promise<Producto[]> {
  const todos = await getProductos()
  return todos.filter((p) => p.destacado)
}

export async function getOfertas(): Promise<Producto[]> {
  const todos = await getProductos()
  return todos.filter((p) => p.precioOferta)
}

export async function getCategorias(): Promise<Categoria[]> {
  return local.categorias
}

export async function getConfig(): Promise<Config> {
  return { ...local.config, whatsapp: process.env.NEXT_PUBLIC_WA_NUMERO || local.config.whatsapp }
}

export const TALLAS = local.tallas
