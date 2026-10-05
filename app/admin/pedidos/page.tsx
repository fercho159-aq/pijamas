import { redirect } from 'next/navigation'
import { haySesion } from '@/lib/auth'
import { getPedidos } from '@/lib/pedidos'
import { hayBase } from '@/lib/db'
import TablaPedidos from '@/components/admin/TablaPedidos'

export default async function Pedidos() {
  if (!(await haySesion())) redirect('/admin/entrar')
  const pedidos = await getPedidos()
  const porAtender = pedidos.filter((p) => p.estado === 'nuevo' || p.estado === 'pagado').length

  return (
    <>
      <div className="adm-cabecera">
        <div>
          <h1 className="adm-h1">Pedidos</h1>
          <span className="adm-conteo">
            {pedidos.length} en total · {porAtender} por atender
          </span>
        </div>
      </div>

      {!hayBase ? (
        <p className="adm-vacio">
          Sin base de datos conectada no se guardan pedidos. Aquí aparecerán en cuanto lo esté.
        </p>
      ) : pedidos.length === 0 ? (
        <p className="adm-vacio">
          Todavía no hay pedidos. Aparecen solos en cuanto una clienta cierra su compra, por
          WhatsApp o con tarjeta.
        </p>
      ) : (
        <TablaPedidos pedidos={pedidos} />
      )}
    </>
  )
}
