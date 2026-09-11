import 'server-only'
import { cache } from 'react'
import respaldo from '@/data/catalogo.json'
import type { Producto, Categoria, Config, ColorPaleta } from './tipos'
import { hayBase, modoBase, q } from './db'

/**
 * Origen de datos.
 *
 * Con base de datos (Neon en producción, PGlite en desarrollo) todo sale de
 * Postgres y el panel escribe ahí. Sin base, la tienda lee data/catalogo.json:
 * se puede desplegar y demostrar, pero el panel no guarda.
 */
export const usaBase = hayBase
export { modoBase }

const local = respaldo as unknown as {
  config: Config
  tallas: string[]
  paleta: ColorPaleta[]
  categorias: Categoria[]
  productos: Producto[]
}

type FilaProducto = {
  id: string
  numero: number
  nombre: string
  slug: string
  categoria: string | null
  tipo: string
  descripcion: string
  composicion: string
  cuidados: string
  precio_lista: number
  precio_oferta_vigente: number | null
  oferta_termina: string | null
  destacado: boolean
  activo: boolean
  portada: string | null
  colores: Producto['colores'] | string
  tallas: string[] | string
}

// Un producto por fila, con sus colores y tallas ya armados como JSON.
const SQL_PRODUCTOS = `
  select p.id, p.numero_modelo as numero, p.nombre, p.slug, c.slug as categoria,
         coalesce(p.tipo, '') as tipo, coalesce(p.descripcion, '') as descripcion,
         coalesce(p.composicion, '') as composicion, coalesce(p.cuidados, '') as cuidados,
         p.precio_lista::float8 as precio_lista,
         case when p.precio_oferta is not null
               and (p.oferta_inicia is null or p.oferta_inicia <= now())
               and (p.oferta_termina is null or p.oferta_termina > now())
              then p.precio_oferta::float8 end as precio_oferta_vigente,
         to_json(p.oferta_termina) #>> '{}' as oferta_termina,
         p.destacado, p.activo, p.color_portada as portada,
         coalesce((
           select json_agg(json_build_object(
                    'nombre', v.color_nombre, 'hex', v.color_hex, 'sku', v.sku, 'stock', v.stock,
                    'img', (select i.url from variante_imagenes i
                            where i.variante_id = v.id order by i.orden limit 1)
                  ) order by v.orden)
           from variantes v where v.producto_id = p.id
         ), '[]') as colores,
         coalesce((
           select json_agg(t.codigo order by t.orden) from tallas t
           where exists (select 1 from variante_tallas vt join variantes v on v.id = vt.variante_id
                         where v.producto_id = p.id and vt.talla_codigo = t.codigo)
         ), '[]') as tallas
  from productos p
  left join categorias c on c.id = p.categoria_id
  where $1::boolean or p.activo
  order by p.numero_modelo`

const comoJson = <T>(v: T | string): T => (typeof v === 'string' ? (JSON.parse(v) as T) : v)

function normaliza(f: FilaProducto): Producto {
  const oferta = f.precio_oferta_vigente == null ? null : Number(f.precio_oferta_vigente)
  return {
    id: f.id,
    numero: Number(f.numero),
    nombre: f.nombre,
    slug: f.slug,
    categoria: f.categoria ?? '',
    tipo: f.tipo,
    descripcion: f.descripcion,
    composicion: f.composicion,
    cuidados: f.cuidados,
    precioLista: Number(f.precio_lista),
    precioOferta: oferta,
    ofertaTermina: oferta == null ? null : f.oferta_termina,
    destacado: Boolean(f.destacado),
    activo: Boolean(f.activo),
    portada: f.portada,
    tallas: comoJson(f.tallas),
    colores: comoJson(f.colores),
  }
}

// cache(): la misma petición pide el catálogo varias veces (menú, página, pie); se lee una.
const leerProductos = cache(async (incluirOcultos: boolean): Promise<Producto[]> => {
  if (!hayBase)
    return incluirOcultos ? local.productos : local.productos.filter((p) => p.activo !== false)
  const filas = await q<FilaProducto>(SQL_PRODUCTOS, [incluirOcultos])
  return filas.map(normaliza)
})

type Opciones = { incluirOcultos?: boolean }

/**
 * Solo lo publicado. El panel pide `incluirOcultos` para poder volver a
 * publicar lo que la clienta oculta, por ejemplo por poca existencia.
 */
export async function getProductos({ incluirOcultos = false }: Opciones = {}): Promise<Producto[]> {
  return leerProductos(incluirOcultos)
}

export async function getProducto(slug: string, opciones: Opciones = {}): Promise<Producto | undefined> {
  const todos = await getProductos(opciones)
  return todos.find((p) => p.slug === slug)
}

export async function getPorCategoria(cat: string): Promise<Producto[]> {
  return (await getProductos()).filter((p) => p.categoria === cat)
}

export async function getDestacados(): Promise<Producto[]> {
  return (await getProductos()).filter((p) => p.destacado)
}

export async function getOfertas(): Promise<Producto[]> {
  return (await getProductos()).filter((p) => p.precioOferta)
}

/** Una sección sin nada publicado no aparece: ni en el menú, ni en el inicio, ni en el pie. */
export async function getCategorias(): Promise<Categoria[]> {
  const productos = await getProductos()
  return local.categorias.filter((c) => productos.some((p) => p.categoria === c.slug))
}

/** Todas las secciones, aunque estén vacías: el panel las ofrece al crear un modelo. */
export async function getCategoriasTodas(): Promise<Categoria[]> {
  return local.categorias
}

/** Los 17 colores con los que trabaja el taller. Numerados como en su lista. */
export const PALETA = local.paleta

/** Colores que ofrece el panel: la paleta del taller más los que ya usa algún modelo. */
export async function getColoresConocidos(): Promise<{ nombre: string; hex: string }[]> {
  const mapa = new Map(PALETA.map((c) => [c.nombre, c.hex]))
  for (const p of await getProductos({ incluirOcultos: true }))
    for (const c of p.colores) if (!mapa.has(c.nombre)) mapa.set(c.nombre, c.hex)
  return [...mapa].map(([nombre, hex]) => ({ nombre, hex }))
}

/** Tipos ya usados («Manga corta + short»…), para sugerirlos al capturar. */
export async function getTiposConocidos(): Promise<string[]> {
  const tipos = new Set((await getProductos({ incluirOcultos: true })).map((p) => p.tipo).filter(Boolean))
  return [...tipos].sort((a, b) => a.localeCompare(b, 'es'))
}

const leerConfig = cache(async (): Promise<Config> => {
  const base: Config = {
    ...local.config,
    whatsapp: process.env.NEXT_PUBLIC_WA_NUMERO || local.config.whatsapp,
  }
  if (!hayBase) return base

  const filas = await q<{ clave: string; valor: unknown }>('select clave, valor from config')
  const v = Object.fromEntries(filas.map((f) => [f.clave, f.valor]))
  const wa = String(v.whatsapp_numero ?? '').replace(/\D/g, '')
  const gratis = Number(v.envio_gratis_desde)
  const costo = Number(v.costo_envio_base)
  return {
    whatsapp: wa.length >= 12 ? wa : base.whatsapp,
    envioGratisDesde: gratis > 0 ? gratis : base.envioGratisDesde,
    costoEnvio: v.costo_envio_base != null && costo >= 0 ? costo : base.costoEnvio,
    horaCorte:
      typeof v.hora_corte_envio === 'string' && v.hora_corte_envio ? v.hora_corte_envio : base.horaCorte,
  }
})

export async function getConfig(): Promise<Config> {
  return leerConfig()
}

/** Unión de todas las escalas. Cada modelo trae la suya en `producto.tallas`. */
export const TALLAS = local.tallas
