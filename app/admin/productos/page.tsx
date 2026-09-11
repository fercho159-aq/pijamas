import { redirect } from 'next/navigation'
import Link from 'next/link'
import { haySesion } from '@/lib/auth'
import { getProductos } from '@/lib/datos'
import TablaProductos from '@/components/admin/TablaProductos'

export default async function Productos() {
  if (!(await haySesion())) redirect('/admin/entrar')
  const productos = await getProductos({ incluirOcultos: true })
  return (
    <>
      <div className="adm-cabecera">
        <div>
          <h1 className="adm-h1">Productos</h1>
          <span className="adm-conteo">
            {productos.length} modelos ·{' '}
            {productos.reduce((t, p) => t + p.colores.length, 0)} variantes
          </span>
        </div>
        <Link href="/admin/productos/nuevo" className="adm-nuevo">
          + Nuevo modelo
        </Link>
      </div>
      <TablaProductos productos={productos} />
    </>
  )
}
