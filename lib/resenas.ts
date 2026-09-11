import 'server-only'
import respaldo from '@/data/catalogo.json'
import { hayBase, q } from './db'

export type Resena = {
  modelo: number
  nombre: string
  ciudad: string
  estrellas: number
  estatura: number
  talla: string
  fecha: string
  texto: string
}

const local = respaldo as unknown as { resenas?: Resena[]; _resenasSonEjemplo?: boolean }

/**
 * Con base de datos se leen de `resenas`, donde pedido_id es NOT NULL:
 * sin una compra real no puede existir la fila. Mientras tanto se muestran
 * ejemplos y la interfaz los marca como tales.
 */
export const resenasSonEjemplo = !hayBase && Boolean(local._resenasSonEjemplo)

export async function getResenas(): Promise<Resena[]> {
  if (!hayBase) return local.resenas ?? []
  return q<Resena>(
    `select p.numero_modelo as modelo, r.nombre, coalesce(r.ciudad, '') as ciudad,
            r.calificacion as estrellas, coalesce(r.estatura_cm, 0) as estatura,
            coalesce(r.talla_pedida, '') as talla, to_char(r.creada_en, 'YYYY-MM-DD') as fecha,
            coalesce(r.texto, '') as texto
     from resenas r join productos p on p.id = r.producto_id
     where r.aprobada
     order by r.creada_en desc`
  )
}

export async function getResenasDe(modelo: number): Promise<Resena[]> {
  return (await getResenas()).filter((r) => r.modelo === modelo)
}

export function promedio(rs: Resena[]) {
  if (!rs.length) return 0
  return Math.round((rs.reduce((t, r) => t + r.estrellas, 0) / rs.length) * 10) / 10
}
