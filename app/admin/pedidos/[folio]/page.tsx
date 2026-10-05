import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { haySesion } from '@/lib/auth'
import { getPedido } from '@/lib/pedidos'
import FichaPedido from '@/components/admin/FichaPedido'

export default async function PedidoDetalle({ params }: { params: Promise<{ folio: string }> }) {
  if (!(await haySesion())) redirect('/admin/entrar')
  const { folio } = await params
  const pedido = await getPedido(decodeURIComponent(folio))
  if (!pedido) notFound()

  return (
    <>
      <div className="adm-cabecera">
        <div>
          <Link href="/admin/pedidos" className="adm-volver">
            ← Pedidos
          </Link>
          <h1 className="adm-h1">
            Pedido <span className="adm-mod">{pedido.folio}</span>
          </h1>
        </div>
      </div>
      <FichaPedido pedido={pedido} />
    </>
  )
}
