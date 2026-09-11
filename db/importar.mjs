// Prepara una base Postgres con el esquema y el catálogo de data/catalogo.json.
//
// No hace falta correrlo a mano: la app lo hace sola la primera vez que se
// conecta (Neon en Vercel, PGlite en desarrollo). Queda para quien prefiera:
//
//   DATABASE_URL=... node db/importar.mjs
//
// El catálogo se importa una sola vez. Después manda el panel: aunque la
// clienta borre todos los modelos, no se vuelve a importar nada.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Desde la raíz del proyecto, no desde este archivo: dentro de Next el módulo
// se empaqueta en .next/ y su propia ruta ya no apunta aquí.
const RAIZ = process.cwd()

/**
 * Todas las consultas tienen que ir por la MISMA conexión: la importación
 * corre dentro de una transacción.
 * @param {(texto: string, params?: unknown[]) => Promise<{ rows: any[] }>} consultar
 * @param {(script: string) => Promise<unknown>} ejecutar  corre varias sentencias seguidas
 * @param {{ avisar?: (m: string) => void }} [opciones]
 */
export async function prepararBase(consultar, ejecutar, { avisar = () => {} } = {}) {
  await ejecutar(fs.readFileSync(path.join(RAIZ, 'db', 'schema.sql'), 'utf8'))

  const {
    rows: [estado],
  } = await consultar(
    `select exists(select 1 from config where clave = 'catalogo_importado') as hecho,
            (select count(*)::int from productos) as modelos`
  )
  if (estado.hecho) return { importados: 0 }

  const marcar = () =>
    consultar(
      `insert into config (clave, valor) values ('catalogo_importado', to_jsonb(now()))
       on conflict (clave) do nothing`
    )

  if (estado.modelos > 0) {
    await marcar()
    avisar(`La base ya tenía ${estado.modelos} modelos: no se importa nada.`)
    return { importados: 0 }
  }

  const cat = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'catalogo.json'), 'utf8'))

  await consultar('begin')
  try {
    for (const [i, t] of cat.tallas.entries())
      await consultar('insert into tallas (codigo, orden) values ($1, $2) on conflict (codigo) do nothing', [t, i])

    for (const [i, c] of cat.categorias.entries())
      await consultar(
        'insert into categorias (slug, nombre, orden) values ($1, $2, $3) on conflict (slug) do nothing',
        [c.slug, c.nombre, i + 1]
      )

    const cfg = cat.config
    const pares = [
      ['whatsapp_numero', cfg.whatsapp],
      ['envio_gratis_desde', cfg.envioGratisDesde],
      ['costo_envio_base', cfg.costoEnvio],
      ['hora_corte_envio', cfg.horaCorte],
      ['mercadopago_activo', false],
    ]
    for (const [clave, valor] of pares)
      await consultar(
        'insert into config (clave, valor) values ($1, $2::jsonb) on conflict (clave) do nothing',
        [clave, JSON.stringify(valor)]
      )

    for (const p of cat.productos) {
      const {
        rows: [{ id }],
      } = await consultar(
        `insert into productos
           (numero_modelo, nombre, slug, categoria_id, descripcion, tipo, composicion, cuidados,
            precio_lista, destacado, activo, color_portada)
         values ($1, $2, $3, (select id from categorias where slug = $4), $5, $6, $7, $8, $9, $10, $11, $12)
         returning id`,
        [
          p.numero, p.nombre, p.slug, p.categoria, p.descripcion, p.tipo || null, p.composicion,
          p.cuidados, p.precioLista, Boolean(p.destacado), p.activo !== false, p.portada ?? null,
        ]
      )

      for (const [orden, c] of p.colores.entries()) {
        const {
          rows: [v],
        } = await consultar(
          `insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
           values ($1, $2, $3, $4, $5, $6) returning id`,
          [id, c.nombre, c.hex, c.sku, c.stock, orden]
        )
        if (c.img)
          await consultar(
            'insert into variante_imagenes (variante_id, url, alt, orden) values ($1, $2, $3, 0)',
            [v.id, c.img, `${p.nombre}, modelo ${p.numero}, color ${c.nombre}`]
          )
        for (const t of p.tallas)
          await consultar('insert into variante_tallas (variante_id, talla_codigo) values ($1, $2)', [v.id, t])
      }
    }

    await marcar()
    await consultar('commit')
  } catch (e) {
    await consultar('rollback')
    throw e
  }

  avisar(`Catálogo importado: ${cat.productos.length} modelos.`)
  return { importados: cat.productos.length }
}

/**
 * Neon: una sola conexión y un candado, para que los varios procesos del
 * build de Vercel no importen el catálogo al mismo tiempo.
 * @param {string} url
 */
export async function prepararNeon(url, opciones) {
  const { Pool, neonConfig } = await import('@neondatabase/serverless')
  if (!globalThis.WebSocket) throw new Error('Preparar la base necesita Node 22 o superior.')
  neonConfig.webSocketConstructor = globalThis.WebSocket
  // Conexión directa, sin el pooler: el candado y la transacción tienen que
  // vivir en la misma sesión de Postgres de principio a fin.
  const pool = new Pool({ connectionString: url.replace('-pooler.', '.') })
  const cliente = await pool.connect()
  try {
    await cliente.query('select pg_advisory_lock(7171999)')
    return await prepararBase((t, p) => cliente.query(t, p), (s) => cliente.query(s), opciones)
  } finally {
    await cliente.query('select pg_advisory_unlock(7171999)').catch(() => {})
    cliente.release()
    await pool.end()
  }
}

// ── Uso directo: node db/importar.mjs ──────────────────────────
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('Falta DATABASE_URL: la cadena de conexión de Neon.')
    process.exit(1)
  }
  const r = await prepararNeon(url, { avisar: console.log })
  if (!r.importados) console.log('Sin cambios: la base ya estaba lista.')
}
