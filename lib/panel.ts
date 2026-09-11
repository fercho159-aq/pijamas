import 'server-only'
import {
  getProductos,
  getCategoriasTodas,
  getColoresConocidos,
  getTiposConocidos,
  TALLAS,
} from './datos'
import type { ModeloEntrada, OpcionesForma, Producto } from './tipos'

/** Del más repetido al menos: el primero es el que casi siempre se usa. */
function masUsados(valores: string[]) {
  const cuenta = new Map<string, number>()
  for (const v of valores.map((x) => x?.trim()).filter(Boolean))
    cuenta.set(v, (cuenta.get(v) ?? 0) + 1)
  return [...cuenta].sort((a, b) => b[1] - a[1]).map(([v]) => v)
}

export async function getOpcionesForma(): Promise<OpcionesForma> {
  const [productos, categorias, paleta, tipos] = await Promise.all([
    getProductos({ incluirOcultos: true }),
    getCategoriasTodas(),
    getColoresConocidos(),
    getTiposConocidos(),
  ])
  return {
    categorias: categorias.map(({ slug, nombre }) => ({ slug, nombre })),
    paleta,
    tipos,
    composiciones: masUsados(productos.map((p) => p.composicion)),
    cuidados: masUsados(productos.map((p) => p.cuidados)),
    tallas: TALLAS,
    modelos: productos.map((p) => ({ numero: p.numero, nombre: p.nombre })),
  }
}

export function aEntrada(p: Producto): ModeloEntrada {
  return {
    id: p.id ?? null,
    numero: p.numero,
    nombre: p.nombre,
    categoria: p.categoria,
    tipo: p.tipo,
    descripcion: p.descripcion,
    composicion: p.composicion,
    cuidados: p.cuidados,
    precioLista: p.precioLista,
    precioOferta: p.precioOferta,
    ofertaTermina: p.ofertaTermina ?? null,
    destacado: p.destacado,
    activo: p.activo !== false,
    portada: p.portada ?? null,
    tallas: p.tallas,
    colores: p.colores.map(({ nombre, hex, sku, stock, img }) => ({ nombre, hex, sku, stock, img })),
  }
}

/** Modelo en blanco, con la tela y los cuidados de siempre ya escritos. */
export function modeloVacio(o: OpcionesForma): ModeloEntrada {
  return {
    id: null,
    numero: 0,
    nombre: '',
    categoria: '',
    tipo: '',
    descripcion: '',
    composicion: o.composiciones[0] ?? '',
    cuidados: o.cuidados[0] ?? '',
    precioLista: 0,
    precioOferta: null,
    ofertaTermina: null,
    destacado: false,
    activo: true,
    portada: null,
    tallas: [],
    colores: [],
  }
}

/** «Duplicar»: todo igual menos número, nombre, fotos, piezas y oferta. */
export function copiaDe(p: Producto): ModeloEntrada {
  return {
    ...aEntrada(p),
    id: null,
    numero: 0,
    nombre: '',
    precioOferta: null,
    ofertaTermina: null,
    destacado: false,
    portada: null,
    colores: p.colores.map(({ nombre, hex }) => ({ nombre, hex, stock: 0, img: null })),
  }
}
