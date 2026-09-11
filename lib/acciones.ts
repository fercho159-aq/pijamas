'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { haySesion, abrirSesion, cerrarSesion, adminHabilitado } from './auth'
import { hayBase, q } from './db'
import { getCategoriasTodas, TALLAS } from './datos'
import { guardarFoto } from './fotos'
import type { ModeloEntrada } from './tipos'

export type Resultado = { ok: boolean; mensaje: string }

const SIN_BASE: Resultado = {
  ok: false,
  mensaje:
    'Modo demostración: todavía no hay base de datos conectada, así que los cambios no se guardan.',
}

async function exigirSesion() {
  if (!adminHabilitado) throw new Error('Panel deshabilitado')
  if (!(await haySesion())) redirect('/admin/entrar')
}

function refrescar() {
  // invalida catálogo, fichas y panel de una sola vez
  revalidatePath('/', 'layout')
}

const slug = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Traduce los errores de Postgres a algo que la clienta pueda resolver. */
function explicar(e: unknown, numero?: number): string {
  const err = e as { code?: string; constraint?: string; message?: string }
  const detalle = `${err?.constraint ?? ''} ${err?.message ?? ''}`
  if (err?.code === '23505' && /numero_modelo|slug/.test(detalle))
    return `Ya existe otro modelo con el número ${numero}. Usa un número distinto.`
  if (err?.code === '23505') return 'Hay un dato repetido que tiene que ser único.'
  if (err?.code === '23514') return 'Algún dato no es válido. Revisa precios, existencias y colores.'
  return err?.message ? `No se pudo guardar: ${err.message}` : 'No se pudo guardar.'
}

async function intentar(fn: () => Promise<void>, exito: string): Promise<Resultado> {
  await exigirSesion()
  if (!hayBase) return SIN_BASE
  try {
    await fn()
    refrescar()
    return { ok: true, mensaje: exito }
  } catch (e) {
    return { ok: false, mensaje: explicar(e) }
  }
}

/* ══════════════ Sesión ══════════════ */

export async function entrar(_previo: Resultado | null, datos: FormData): Promise<Resultado> {
  const clave = String(datos.get('clave') ?? '')
  if (!clave) return { ok: false, mensaje: 'Escribe la contraseña.' }
  if (!(await abrirSesion(clave))) return { ok: false, mensaje: 'Contraseña incorrecta.' }
  redirect('/admin')
}

export async function salir() {
  await cerrarSesion()
  redirect('/admin/entrar')
}

/* ══════════════ Modelos: crear y editar ══════════════ */

export type ResultadoModelo = Resultado & { slug?: string; campo?: string }

// lo que llega del navegador no se da por bueno: puede venir incompleto
const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

async function validar(m: ModeloEntrada): Promise<{ campo: string; mensaje: string } | null> {
  if (!Number.isInteger(m.numero) || m.numero <= 0)
    return { campo: 'numero', mensaje: 'Escribe el número de modelo, solo con números.' }
  if (!texto(m.nombre)) return { campo: 'nombre', mensaje: 'Escribe el nombre del modelo.' }
  if (texto(m.nombre).length > 60)
    return { campo: 'nombre', mensaje: 'El nombre es muy largo: máximo 60 letras.' }
  if (!(await getCategoriasTodas()).some((c) => c.slug === m.categoria))
    return { campo: 'categoria', mensaje: 'Elige la sección donde va el modelo.' }
  if (!texto(m.composicion))
    return { campo: 'composicion', mensaje: 'Escribe la composición de la tela: la pide la NOM-004-SCFI.' }
  if (!(Number.isFinite(m.precioLista) && m.precioLista > 0))
    return { campo: 'precioLista', mensaje: 'Escribe el precio de lista.' }
  if (m.precioOferta != null) {
    if (!(m.precioOferta > 0 && m.precioOferta < m.precioLista))
      return { campo: 'precioOferta', mensaje: 'El precio de oferta tiene que ser menor que el de lista.' }
    const fin = m.ofertaTermina ? new Date(m.ofertaTermina) : null
    if (!fin || Number.isNaN(fin.getTime()))
      return { campo: 'ofertaTermina', mensaje: 'Elige el día y la hora en que termina la oferta.' }
    if (fin.getTime() <= Date.now())
      return { campo: 'ofertaTermina', mensaje: 'La fecha de fin de la oferta ya pasó.' }
  }
  if (!Array.isArray(m.tallas) || !m.tallas.length || m.tallas.some((t) => !TALLAS.includes(t)))
    return { campo: 'tallas', mensaje: 'Marca al menos una talla.' }
  if (!Array.isArray(m.colores) || !m.colores.length)
    return { campo: 'colores', mensaje: 'Agrega al menos un color.' }

  const vistos = new Set<string>()
  for (const c of m.colores) {
    const nombre = texto(c.nombre)
    if (c.img && !/^(\/|https:\/\/)/.test(c.img))
      return { campo: 'colores', mensaje: `La foto de ${nombre || 'un color'} no es válida. Vuelve a subirla.` }
    if (!nombre) return { campo: 'colores', mensaje: 'Hay un color sin nombre.' }
    if (vistos.has(nombre.toLowerCase()))
      return { campo: 'colores', mensaje: `El color ${nombre} está repetido.` }
    vistos.add(nombre.toLowerCase())
    if (!/^#[0-9A-Fa-f]{6}$/.test(c.hex))
      return { campo: 'colores', mensaje: `El tono del color ${nombre} no es válido.` }
    if (!Number.isInteger(c.stock) || c.stock < 0)
      return {
        campo: 'colores',
        mensaje: `Las existencias de ${nombre} tienen que ser un número entero, de 0 en adelante.`,
      }
  }
  return null
}

// Guarda el modelo completo en una sola sentencia: o entra todo o no entra
// nada. Los colores se identifican por SKU; los que ya no vienen se borran
// (con sus fotos y tallas, en cascada).
const SQL_GUARDAR = `
with entrada as (select $1::jsonb as j),
prod as (
  insert into productos (id, numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
                         composicion, cuidados, precio_lista, precio_oferta, oferta_termina,
                         destacado, activo, color_portada)
  select coalesce(nullif(j->>'id', '')::uuid, gen_random_uuid()),
         (j->>'numero')::int, j->>'nombre', j->>'slug',
         (select id from categorias where slug = j->>'categoria'),
         j->>'descripcion', nullif(j->>'tipo', ''), j->>'composicion', j->>'cuidados',
         (j->>'precioLista')::numeric, nullif(j->>'precioOferta', '')::numeric,
         nullif(j->>'ofertaTermina', '')::timestamptz,
         (j->>'destacado')::boolean, (j->>'activo')::boolean, nullif(j->>'portada', '')
  from entrada
  on conflict (id) do update set
    numero_modelo = excluded.numero_modelo, nombre = excluded.nombre, slug = excluded.slug,
    categoria_id = excluded.categoria_id, descripcion = excluded.descripcion, tipo = excluded.tipo,
    composicion = excluded.composicion, cuidados = excluded.cuidados,
    precio_lista = excluded.precio_lista, precio_oferta = excluded.precio_oferta,
    oferta_termina = excluded.oferta_termina, destacado = excluded.destacado,
    activo = excluded.activo, color_portada = excluded.color_portada
  returning id, slug
),
colores as (
  select c.* from entrada,
    jsonb_to_recordset(entrada.j->'colores')
      as c(nombre text, hex text, sku text, stock int, img text, alt text, orden int)
),
fuera as (
  delete from variantes v using prod
  where v.producto_id = prod.id and v.sku not in (select sku from colores)
),
var as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden, activa)
  select prod.id, c.nombre, c.hex, c.sku, c.stock, c.orden, true from prod, colores c
  on conflict (sku) do update set
    producto_id = excluded.producto_id, color_nombre = excluded.color_nombre,
    color_hex = excluded.color_hex, stock = excluded.stock, orden = excluded.orden, activa = true
  returning id, sku
),
fotos_fuera as (
  delete from variante_imagenes i using var where i.variante_id = var.id
),
fotos as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select var.id, c.img, c.alt, 0 from var join colores c on c.sku = var.sku
  where coalesce(c.img, '') <> ''
),
tallas_fuera as (
  delete from variante_tallas vt using var, entrada
  where vt.variante_id = var.id
    and vt.talla_codigo not in (select jsonb_array_elements_text(entrada.j->'tallas'))
),
tallas_dentro as (
  insert into variante_tallas (variante_id, talla_codigo, disponible)
  select var.id, t.codigo, true
  from var, entrada, jsonb_array_elements_text(entrada.j->'tallas') as t(codigo)
  on conflict do nothing
)
select id, slug from prod`

export async function guardarModelo(m: ModeloEntrada): Promise<ResultadoModelo> {
  await exigirSesion()
  if (!hayBase) return SIN_BASE

  const error = await validar(m)
  if (error) return { ok: false, ...error }

  const numero = m.numero
  const nombre = texto(m.nombre)

  // SKU: cada color conserva el suyo. Los colores nuevos reciben uno que no
  // choque con este modelo ni con ningún otro.
  const deOtros = new Set(
    (
      await q<{ sku: string }>(
        `select sku from variantes
         where (sku like $1 or sku = any($2::text[])) and producto_id is distinct from $3::uuid`,
        [`RL-${numero}-%`, m.colores.map((c) => c.sku ?? ''), m.id]
      )
    ).map((r) => r.sku)
  )
  const usados = new Set<string>()
  const colores = m.colores.map((c, orden) => {
    let sku = c.sku && !deOtros.has(c.sku) && !usados.has(c.sku) ? c.sku : ''
    if (!sku) {
      const letras = slug(c.nombre).replace(/-/g, '').slice(0, 3).toUpperCase() || 'COL'
      sku = `RL-${numero}-${letras}`
      for (let k = 2; usados.has(sku) || deOtros.has(sku); k++) sku = `RL-${numero}-${letras}${k}`
    }
    usados.add(sku)
    const color = texto(c.nombre)
    return {
      nombre: color,
      hex: c.hex.toUpperCase(),
      sku,
      stock: c.stock,
      img: c.img || null,
      alt: `${nombre}, modelo ${numero}, color ${color}`,
      orden,
    }
  })

  const portada = colores.some((c) => c.nombre === m.portada && c.img) ? m.portada : null

  const entrada = {
    id: m.id,
    numero,
    nombre,
    slug: `${numero}-${slug(nombre)}`,
    categoria: m.categoria,
    tipo: texto(m.tipo),
    descripcion: texto(m.descripcion),
    composicion: texto(m.composicion),
    cuidados: texto(m.cuidados),
    precioLista: m.precioLista,
    precioOferta: m.precioOferta,
    ofertaTermina: m.precioOferta != null ? new Date(m.ofertaTermina!).toISOString() : null,
    destacado: m.destacado,
    activo: m.activo,
    portada,
    tallas: TALLAS.filter((t) => m.tallas.includes(t)),
    colores,
  }

  try {
    const [fila] = await q<{ id: string; slug: string }>(SQL_GUARDAR, [JSON.stringify(entrada)])
    refrescar()
    return { ok: true, mensaje: m.id ? 'Cambios guardados.' : 'Modelo creado.', slug: fila.slug }
  } catch (e) {
    return { ok: false, mensaje: explicar(e, numero) }
  }
}

/* ══════════════ Fotos ══════════════ */

export async function subirFoto(datos: FormData): Promise<Resultado & { url?: string }> {
  await exigirSesion()
  const archivo = datos.get('archivo')
  const base = slug(String(datos.get('base') ?? '')) || 'foto'
  if (!(archivo instanceof File) || archivo.size === 0)
    return { ok: false, mensaje: 'No llegó ninguna foto.' }
  try {
    return { ok: true, mensaje: 'Foto lista.', url: await guardarFoto(archivo, base) }
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : 'No se pudo subir la foto.' }
  }
}

/* ══════════════ Acciones rápidas de la lista ══════════════ */

export async function alternarBandera(
  numero: number,
  campo: 'activo' | 'destacado',
  valor: boolean
): Promise<Resultado> {
  // el nombre de la columna sale de esta lista, nunca de lo que manda el navegador
  const columna = campo === 'activo' ? 'activo' : 'destacado'
  return intentar(
    () => q(`update productos set ${columna} = $2 where numero_modelo = $1`, [numero, valor]).then(() => {}),
    campo === 'activo'
      ? valor ? 'Publicado: ya se ve en la tienda.' : 'Oculto: ya no se ve en la tienda.'
      : valor ? 'Ahora sale en Destacados.' : 'Ya no sale en Destacados.'
  )
}

/** Desde la ficha del modelo se pide `irALista`: la página que estaba abierta deja de existir. */
export async function borrarProducto(numero: number, irALista = false): Promise<Resultado> {
  const r = await intentar(
    () => q('delete from productos where numero_modelo = $1', [numero]).then(() => {}),
    `Modelo ${numero} eliminado.`
  )
  if (r.ok && irALista) redirect('/admin/productos')
  return r
}

export async function guardarStock(sku: string, stock: number): Promise<Resultado> {
  if (!Number.isInteger(stock) || stock < 0)
    return { ok: false, mensaje: 'Las existencias tienen que ser un número entero, de 0 en adelante.' }
  return intentar(
    () => q('update variantes set stock = $2 where sku = $1', [sku, stock]).then(() => {}),
    'Existencias actualizadas.'
  )
}

/* ══════════════ Reseñas ══════════════ */

export async function moderarResena(id: string, aprobar: boolean): Promise<Resultado> {
  return intentar(
    () =>
      (aprobar
        ? q('update resenas set aprobada = true where id = $1', [id])
        : q('delete from resenas where id = $1', [id])
      ).then(() => {}),
    aprobar ? 'Reseña publicada.' : 'Reseña descartada.'
  )
}

/* ══════════════ Configuración ══════════════ */

export async function guardarConfig(
  _previo: Resultado | null,
  datos: FormData
): Promise<Resultado> {
  const wa = String(datos.get('whatsapp') ?? '').replace(/\D/g, '')
  const gratis = Number(datos.get('envioGratis'))
  const costo = Number(datos.get('costoEnvio'))
  if (!wa.startsWith('52') || wa.length < 12 || wa.length > 13)
    return { ok: false, mensaje: 'El WhatsApp lleva 52 y los 10 dígitos, sin espacios ni signos.' }
  if (!(gratis > 0)) return { ok: false, mensaje: 'Escribe a partir de cuánto es el envío gratis.' }
  if (!(costo >= 0)) return { ok: false, mensaje: 'Escribe el costo de envío (0 si no cobras).' }

  const pares: [string, unknown][] = [
    ['whatsapp_numero', wa],
    ['envio_gratis_desde', gratis],
    ['costo_envio_base', costo],
    ['hora_corte_envio', String(datos.get('horaCorte') ?? '').trim()],
    ['banner_anuncio', String(datos.get('banner') ?? '').trim()],
    ['mercadopago_activo', datos.get('mp') === 'on'],
  ]
  return intentar(async () => {
    for (const [clave, valor] of pares)
      await q(
        `insert into config (clave, valor) values ($1, $2::jsonb)
         on conflict (clave) do update set valor = excluded.valor`,
        [clave, JSON.stringify(valor)]
      )
  }, 'Configuración guardada.')
}
