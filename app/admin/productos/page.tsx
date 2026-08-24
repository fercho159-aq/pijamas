import { redirect } from 'next/navigation'
import { haySesion } from '@/lib/auth'
import { getProductos } from '@/lib/datos'
import TablaProductos from '@/components/admin/TablaProductos'

export default async function Productos() {
  if (!(await haySesion())) redirect('/admin/entrar')
  const productos = await getProductos()
  return (
    <>
      <div className="adm-cabecera">
        <h1 className="adm-h1">Productos</h1>
        <span className="adm-conteo">
          {productos.length} modelos ·{' '}
          {productos.reduce((t, p) => t + p.colores.length, 0)} variantes
        </span>
      </div>
      <TablaProductos productos={productos} />
    </>
  )
}
