import 'server-only'
import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

const CLAVE = process.env.ADMIN_CLAVE
const COOKIE = 'rossy_admin'

/**
 * Sin ADMIN_CLAVE definida el panel no existe: las rutas devuelven 404.
 * Así nadie lo encuentra por accidente en un despliegue.
 * Al conectar Supabase esto se reemplaza por Supabase Auth con roles.
 */
export const adminHabilitado = Boolean(CLAVE && CLAVE.length >= 8)

const testigo = () => createHmac('sha256', CLAVE!).update('sesion-admin-v1').digest('hex')

function igualesSinFuga(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function haySesion() {
  if (!adminHabilitado) return false
  const valor = (await cookies()).get(COOKIE)?.value
  return Boolean(valor && igualesSinFuga(valor, testigo()))
}

export async function abrirSesion(clave: string) {
  if (!adminHabilitado || !igualesSinFuga(clave, CLAVE!)) return false
  ;(await cookies()).set(COOKIE, testigo(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 12,
  })
  return true
}

export async function cerrarSesion() {
  ;(await cookies()).delete({ name: COOKIE, path: '/admin' })
}
