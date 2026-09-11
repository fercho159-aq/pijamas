import 'server-only'

export type Fila = Record<string, unknown>

/**
 * De dónde salen los datos:
 * - neon:    hay DATABASE_URL. Producción, o quien quiera probar contra la base real.
 * - local:   desarrollo sin DATABASE_URL. PGlite: un Postgres dentro de Node, en .pglite/.
 * - ninguna: producción sin DATABASE_URL. La tienda lee data/catalogo.json y el panel no guarda.
 */
export const modoBase: 'neon' | 'local' | 'ninguna' = process.env.DATABASE_URL
  ? 'neon'
  : process.env.NODE_ENV === 'development'
    ? 'local'
    : 'ninguna'

export const hayBase = modoBase !== 'ninguna'

type Consultar = (texto: string, params: unknown[]) => Promise<Fila[]>
let conexion: Promise<Consultar> | null = null

async function conectar(): Promise<Consultar> {
  if (modoBase === 'neon') {
    const url = process.env.DATABASE_URL!
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(url)
    // Base recién creada en Vercel: se arma sola con el esquema y el catálogo.
    const lista = await sql
      .query("select exists(select 1 from config where clave = 'catalogo_importado') as si")
      .then((r) => Boolean((r as Fila[])[0]?.si))
      .catch(() => false) // todavía no existen las tablas
    if (!lista) {
      const { prepararNeon } = await import('../db/importar.mjs')
      await prepararNeon(url, { avisar: (m) => console.log('[neon]', m) })
    }
    return async (texto, params) => (await sql.query(texto, params)) as Fila[]
  }
  if (modoBase === 'local') {
    const { abrirLocal } = await import('./db-local')
    const db = await abrirLocal()
    return async (texto, params) => (await db.query<Fila>(texto, params)).rows
  }
  throw new Error('No hay base de datos conectada.')
}

/** Una consulta con parámetros $1, $2… Nunca se arma SQL pegando texto del usuario. */
export async function q<T = Fila>(texto: string, params: unknown[] = []): Promise<T[]> {
  if (!conexion) {
    conexion = conectar()
    // si la conexión falla, el siguiente intento vuelve a probar en vez de quedarse con el error
    conexion.catch(() => {
      conexion = null
    })
  }
  const consultar = await conexion
  return (await consultar(texto, params)) as T[]
}
