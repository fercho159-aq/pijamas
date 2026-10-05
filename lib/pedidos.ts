import 'server-only'
import { hayBase, q } from './db'
import { getConfig, getProductos } from './datos'
import { precio } from './formato'

/**
 * Pedidos.
 *
 * El carrito vive en el navegador, así que aquí no se da nada por bueno: los
 * precios, el envío y las existencias se vuelven a calcular contra la base
 * antes de guardar o de cobrar.
 */
export type LineaPedido = { numero: number; color: string; talla: string; cantidad: number }

export type DatosEnvio = {
  nombre: string
  telefono: string
  email?: string
  calle: string
  colonia?: string
  ciudad?: string
  estado?: string
  cp?: string
  referencias?: string
}

export type ItemPedido = {
  sku: string
  numero: number
  nombre: string
  color: string
  talla: string
  cantidad: number
  precio: number
  importe: number
  img: string | null
}

export type Armado = { items: ItemPedido[]; subtotal: number; envio: number; total: number }

const TOPE_PIEZAS = 20

export class ErrorPedido extends Error {}

const texto = (v: unknown, max = 160) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function armarPedido(lineas: LineaPedido[]): Promise<Armado> {
  if (!Array.isArray(lineas) || lineas.length === 0) throw new ErrorPedido('Tu carrito está vacío.')
  if (lineas.length > 30) throw new ErrorPedido('Son demasiadas líneas en un mismo pedido.')

  const [productos, config] = await Promise.all([getProductos(), getConfig()])
  const items: ItemPedido[] = []

  for (const l of lineas) {
    const p = productos.find((x) => x.numero === Number(l.numero))
    if (!p) throw new ErrorPedido('Uno de los modelos de tu carrito ya no está disponible.')
    const c = p.colores.find((x) => x.nombre === l.color)
    if (!c) throw new ErrorPedido(`El color ${texto(l.color, 30)} de ${p.nombre} ya no está disponible.`)
    if (!p.tallas.includes(l.talla))
      throw new ErrorPedido(`La talla ${texto(l.talla, 6)} ya no está en ${p.nombre}.`)

    const cantidad = Math.trunc(Number(l.cantidad))
    if (!(cantidad > 0 && cantidad <= TOPE_PIEZAS))
      throw new ErrorPedido('Revisa las cantidades de tu carrito.')
    if (c.stock < cantidad)
      throw new ErrorPedido(
        c.stock === 0
          ? `${p.nombre} en ${c.nombre} se acaba de agotar.`
          : `De ${p.nombre} en ${c.nombre} solo quedan ${c.stock}.`
      )

    const unidad = precio(p)
    items.push({
      sku: c.sku,
      numero: p.numero,
      nombre: p.nombre,
      color: c.nombre,
      talla: l.talla,
      cantidad,
      precio: unidad,
      importe: unidad * cantidad,
      img: c.img,
    })
  }

  const subtotal = items.reduce((t, i) => t + i.importe, 0)
  const envio = subtotal >= config.envioGratisDesde ? 0 : config.costoEnvio
  return { items, subtotal, envio, total: subtotal + envio }
}

// El pedido y sus líneas entran en una sola sentencia: o se guarda todo o nada.
const SQL_GUARDAR = `
with nuevo as (
  insert into pedidos (canal, cliente_nombre, cliente_telefono, cliente_email,
                       envio_calle, envio_colonia, envio_ciudad, envio_estado, envio_cp,
                       envio_referencias, subtotal, envio, total)
  values ($1, $2, $3, nullif($4, ''), $5, $6, $7, $8, $9, $10, $11, $12, $13)
  returning id, folio
),
lineas as (
  insert into pedido_items (pedido_id, variante_id, talla_codigo, cantidad, precio_unitario, nombre_snapshot)
  select nuevo.id, v.id, x.talla, x.cantidad, x.precio, x.nombre
  from nuevo
  cross join jsonb_to_recordset($14::jsonb)
    as x(sku text, talla text, cantidad int, precio numeric, nombre text)
  join variantes v on v.sku = x.sku
  returning 1
)
select id, folio from nuevo`

export async function guardarPedido(
  canal: 'whatsapp' | 'mercadopago',
  datos: DatosEnvio,
  armado: Armado
): Promise<{ id: string; folio: string }> {
  const lineas = armado.items.map((i) => ({
    sku: i.sku,
    talla: i.talla,
    cantidad: i.cantidad,
    precio: i.precio,
    nombre: `${i.nombre} · modelo ${i.numero} · ${i.color} · talla ${i.talla}`,
  }))
  const [fila] = await q<{ id: string; folio: string }>(SQL_GUARDAR, [
    canal,
    texto(datos.nombre),
    texto(datos.telefono, 20),
    texto(datos.email, 120),
    texto(datos.calle),
    texto(datos.colonia),
    texto(datos.ciudad),
    texto(datos.estado),
    texto(datos.cp, 10),
    texto(datos.referencias, 300),
    armado.subtotal,
    armado.envio,
    armado.total,
    JSON.stringify(lineas),
  ])
  return fila
}

/* ══════════════ Lectura ══════════════ */

export type PedidoFila = {
  id: string
  folio: string
  canal: 'whatsapp' | 'mercadopago'
  estado: string
  cliente_nombre: string | null
  cliente_telefono: string | null
  cliente_email: string | null
  envio_calle: string | null
  envio_colonia: string | null
  envio_ciudad: string | null
  envio_estado: string | null
  envio_cp: string | null
  envio_referencias: string | null
  subtotal: number
  envio: number
  total: number
  mp_payment_id: string | null
  mp_estado: string | null
  guia_paqueteria: string | null
  notas: string | null
  creado_en: string
  piezas?: number
}

const CAMPOS = `p.id, p.folio, p.canal, p.estado, p.cliente_nombre, p.cliente_telefono, p.cliente_email,
  p.envio_calle, p.envio_colonia, p.envio_ciudad, p.envio_estado, p.envio_cp, p.envio_referencias,
  p.subtotal::float8 as subtotal, p.envio::float8 as envio, p.total::float8 as total,
  p.mp_payment_id, p.mp_estado, p.guia_paqueteria, p.notas,
  to_json(p.creado_en) #>> '{}' as creado_en`

export async function getPedidos(limite = 200): Promise<PedidoFila[]> {
  if (!hayBase) return []
  return q<PedidoFila>(
    `select ${CAMPOS},
            (select coalesce(sum(i.cantidad), 0) from pedido_items i where i.pedido_id = p.id)::int as piezas
     from pedidos p order by p.creado_en desc limit $1`,
    [limite]
  )
}

export type ItemGuardado = {
  nombre_snapshot: string
  talla_codigo: string | null
  cantidad: number
  precio_unitario: number
  sku: string | null
  img: string | null
}

export async function getPedido(folio: string) {
  if (!hayBase) return null
  const [pedido] = await q<PedidoFila>(`select ${CAMPOS} from pedidos p where p.folio = $1`, [folio])
  if (!pedido) return null
  const items = await q<ItemGuardado>(
    `select i.nombre_snapshot, i.talla_codigo, i.cantidad, i.precio_unitario::float8 as precio_unitario,
            v.sku,
            (select im.url from variante_imagenes im where im.variante_id = v.id order by im.orden limit 1) as img
     from pedido_items i left join variantes v on v.id = i.variante_id
     where i.pedido_id = $1 order by i.nombre_snapshot`,
    [pedido.id]
  )
  return { ...pedido, items }
}

/* ══════════════ Pago ══════════════ */

const APROBADO = ['approved', 'authorized']
const DEVUELTO = ['refunded', 'charged_back', 'cancelled']

/**
 * Guarda el resultado del pago. Es idempotente: Mercado Pago avisa varias
 * veces del mismo pago, y el aviso puede llegar antes o después de que la
 * clienta regrese a la tienda.
 */
export async function marcarPago(folio: string, pagoId: string, estadoMp: string) {
  const aprobado = APROBADO.includes(estadoMp)
  const devuelto = DEVUELTO.includes(estadoMp)
  await q(
    `update pedidos set
       mp_payment_id = $2,
       mp_estado = $3,
       pagado_en = case when $4 and pagado_en is null then now() else pagado_en end,
       estado = case when $4 then 'pagado'
                     when $5 and estado in ('nuevo', 'pagado') then 'cancelado'
                     else estado end
     where folio = $1 and (mp_payment_id is null or mp_payment_id = $2)`,
    [folio, pagoId, estadoMp, aprobado, devuelto]
  )
  if (aprobado) await descontarExistencias(folio)
  return aprobado
}

/** Al pagarse, las piezas salen del inventario. Una sola vez por pedido. */
async function descontarExistencias(folio: string) {
  await q(
    `with p as (
       select id from pedidos
       where folio = $1 and estado = 'pagado' and not coalesce(existencias_descontadas, false)
     ),
     baja as (
       update variantes v set stock = greatest(0, v.stock - i.cantidad)
       from pedido_items i join p on i.pedido_id = p.id
       where v.id = i.variante_id
       returning 1
     )
     update pedidos set existencias_descontadas = true where id in (select id from p)`,
    [folio]
  )
}

/** Guarda el id de la preferencia, para rastrear el intento de cobro. */
export async function guardarPreferencia(folio: string, preferenciaId: string) {
  await q('update pedidos set mp_preference_id = $2 where folio = $1', [folio, preferenciaId])
}
