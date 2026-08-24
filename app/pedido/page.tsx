import type { Metadata } from 'next'
import PedidoCliente from '@/components/PedidoCliente'
import { getProductos, getConfig } from '@/lib/datos'

export const metadata: Metadata = { title: 'Confirmar pedido', robots: { index: false } }

export default async function Pedido() {
  const [productos, config] = await Promise.all([getProductos(), getConfig()])
  return <PedidoCliente productos={productos} config={config} />
}
