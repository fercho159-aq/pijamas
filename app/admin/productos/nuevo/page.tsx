import { redirect } from 'next/navigation'
import Link from 'next/link'
import { haySesion } from '@/lib/auth'
import { getProducto } from '@/lib/datos'
import { getOpcionesForma, modeloVacio, copiaDe } from '@/lib/panel'
import FormaModelo from '@/components/admin/FormaModelo'

export default async function NuevoModelo({
  searchParams,
}: {
  searchParams: Promise<{ copiar?: string }>
}) {
  if (!(await haySesion())) redirect('/admin/entrar')
  const { copiar } = await searchParams
  const [opciones, origen] = await Promise.all([
    getOpcionesForma(),
    copiar ? getProducto(copiar, { incluirOcultos: true }) : undefined,
  ])

  return (
    <>
      <div className="adm-cabecera">
        <div>
          <Link href="/admin/productos" className="adm-volver">
            ← Productos
          </Link>
          <h1 className="adm-h1">Nuevo modelo</h1>
          {origen && (
            <p className="adm-conteo">
              Con los datos de {origen.nombre} #{origen.numero}. Ponle número, nombre, fotos y piezas.
            </p>
          )}
        </div>
      </div>
      <FormaModelo
        key={copiar ?? 'nuevo'}
        inicial={origen ? copiaDe(origen) : modeloVacio(opciones)}
        opciones={opciones}
        editando={false}
      />
    </>
  )
}
