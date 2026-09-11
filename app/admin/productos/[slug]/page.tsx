import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { haySesion } from '@/lib/auth'
import { getProducto } from '@/lib/datos'
import { getOpcionesForma, aEntrada } from '@/lib/panel'
import FormaModelo from '@/components/admin/FormaModelo'

export default async function EditarModelo({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ listo?: string }>
}) {
  if (!(await haySesion())) redirect('/admin/entrar')
  const [{ slug }, { listo }] = await Promise.all([params, searchParams])
  const [p, opciones] = await Promise.all([getProducto(slug, { incluirOcultos: true }), getOpcionesForma()])
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
        <div className="adm-cabecera-fin">
          <Link href={`/admin/productos/nuevo?copiar=${p.slug}`} className="adm-ver">
            Duplicar
          </Link>
          {p.activo !== false && (
            <Link href={`/producto/${p.slug}`} target="_blank" className="adm-ver">
              Ver en la tienda ↗
            </Link>
          )}
        </div>
      </div>
      <FormaModelo
        key={p.id ?? p.slug}
        inicial={aEntrada(p)}
        slug={p.slug}
        opciones={opciones}
        editando
        recienCreado={listo === '1'}
      />
    </>
  )
}
