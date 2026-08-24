import 'server-only'
import respaldo from '@/data/catalogo.json'
import { usaSupabase } from './datos'

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
 * Con Supabase conectado se leen de `resenas`, donde pedido_id es NOT NULL:
 * sin una compra real no puede existir la fila. Mientras tanto se muestran
 * ejemplos y la interfaz los marca como tales.
 */
export const resenasSonEjemplo = !usaSupabase && Boolean(local._resenasSonEjemplo)

type FilaResena = {
  calificacion: number
  nombre: string
  ciudad: string | null
  texto: string
  estatura_cm: number | null
  talla_pedida: string | null
  creada_en: string
  productos: { numero_modelo: number } | null
}

async function desdeSupabase(): Promise<Resena[]> {
  const url =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/resenas` +
    `?aprobada=eq.true&select=*,productos(numero_modelo)&order=creada_en.desc`
  const r = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    next: { revalidate: 120, tags: ['resenas'] },
  })
  if (!r.ok) return []
  const filas: FilaResena[] = await r.json()
  return filas.map((f) => ({
    modelo: f.productos?.numero_modelo ?? 0,
    nombre: f.nombre,
    ciudad: f.ciudad ?? '',
    estrellas: f.calificacion,
    estatura: f.estatura_cm ?? 0,
    talla: f.talla_pedida ?? '',
    fecha: f.creada_en.slice(0, 10),
    texto: f.texto,
  }))
}

export async function getResenas(): Promise<Resena[]> {
  if (usaSupabase) return desdeSupabase()
  return local.resenas ?? []
}

export async function getResenasDe(modelo: number): Promise<Resena[]> {
  return (await getResenas()).filter((r) => r.modelo === modelo)
}

export function promedio(rs: Resena[]) {
  if (!rs.length) return 0
  return Math.round((rs.reduce((t, r) => t + r.estrellas, 0) / rs.length) * 10) / 10
}
