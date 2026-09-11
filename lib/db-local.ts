import 'server-only'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { prepararBase } from '../db/importar.mjs' // el mismo que carga Neon

type Global = typeof globalThis & { __rossyPglite?: Promise<PGlite> }

/**
 * Base de desarrollo: Postgres dentro de Node, guardado en .pglite/.
 * La primera vez se llena sola con el catálogo. Se guarda en globalThis para
 * que la recarga en caliente de Next no abra dos veces la misma carpeta.
 */
export function abrirLocal(): Promise<PGlite> {
  const g = globalThis as Global
  g.__rossyPglite ??= (async () => {
    const db = await PGlite.create(path.join(process.cwd(), '.pglite'))
    await prepararBase(
      (texto: string, params?: unknown[]) => db.query(texto, params),
      (script: string) => db.exec(script),
      { avisar: (m: string) => console.log('[base local]', m) }
    )
    return db
  })()
  return g.__rossyPglite
}
