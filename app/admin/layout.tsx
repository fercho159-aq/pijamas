import type { Metadata } from 'next'
import Link from 'next/link'
import './admin.css'
import { notFound } from 'next/navigation'
import { adminHabilitado, haySesion } from '@/lib/auth'
import { usaSupabase } from '@/lib/datos'
import { salir } from '@/lib/acciones'

export const metadata: Metadata = { title: 'Panel', robots: { index: false, follow: false } }

// Nunca prerenderizar: el panel depende de la cookie de sesion y de que
// ADMIN_CLAVE exista en tiempo de ejecucion, no en tiempo de build.
export const dynamic = 'force-dynamic'

const SECCIONES = [
  { href: '/admin', et: 'Resumen' },
  { href: '/admin/productos', et: 'Productos' },
  { href: '/admin/resenas', et: 'Reseñas' },
  { href: '/admin/config', et: 'Configuración' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!adminHabilitado) notFound()
  const dentro = await haySesion()

  return (
    <div className="adm">
      {dentro && (
        <header className="adm-top">
          <div className="adm-top-in">
            <Link href="/admin" className="adm-marca">
              Rossy Lady <span>Panel</span>
            </Link>
            <nav>
              {SECCIONES.map((s) => (
                <Link key={s.href} href={s.href}>
                  {s.et}
                </Link>
              ))}
            </nav>
            <div className="adm-top-fin">
              <Link href="/" target="_blank" className="adm-ver">
                Ver tienda ↗
              </Link>
              <form action={salir}>
                <button type="submit">Salir</button>
              </form>
            </div>
          </div>
        </header>
      )}

      {dentro && !usaSupabase && (
        <div className="adm-demo">
          <b>Modo demostración.</b> No hay base de datos conectada: puedes recorrer el panel, pero
          los cambios no se guardan. Configura las variables de Supabase para escribir de verdad.
        </div>
      )}

      <main className="adm-cuerpo">{children}</main>
    </div>
  )
}
