import type { Metadata } from 'next'
import CarritoCliente from '@/components/CarritoCliente'
import { getProductos, getConfig } from '@/lib/datos'

export const metadata: Metadata = { title: 'Tu carrito', robots: { index: false } }

export default async function Carrito() {
  const [productos, config] = await Promise.all([getProductos(), getConfig()])
  return <CarritoCliente productos={productos} config={config} />
}
