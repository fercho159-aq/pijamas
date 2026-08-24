import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { haySesion } from '@/lib/auth'
import { getProducto } from '@/lib/datos'
import FormaProducto from '@/components/admin/FormaProducto'

export default async function EditarProducto({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  if (!(await haySesion())) redirect('/admin/entrar')
  const { slug } = await params
  const p = await getProducto(slug)
  if (!p) notFound()

  return (
    <>
      <div className="adm-cabecera">
        <div>
          <Link href="/admin/productos" className="adm-volver">
            ← Productos
          </Link>
          <h1 className="adm-h1">
            {p.nombre} <span className="adm-mod">#{p.numero}</span>
          </h1>
        </div>
        <Link href={`/producto/${p.slug}`} target="_blank" className="adm-ver">
          Ver en la tienda ↗
        </Link>
      </div>
      <FormaProducto p={p} />
    </>
  )
}
