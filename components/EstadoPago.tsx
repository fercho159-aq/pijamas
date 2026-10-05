'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrito } from './CarritoProvider'

/**
 * Dos cosas al volver de Mercado Pago:
 * 1. Si el pago quedó, se vacía el carrito.
 * 2. Si todavía no llega el aviso de Mercado Pago, se vuelve a consultar
 *    unas cuantas veces: el webhook suele tardar unos segundos.
 */
export default function EstadoPago({ pagado, esperando }: { pagado: boolean; esperando: boolean }) {
  const { vaciar, listo } = useCarrito()
  const router = useRouter()
  const intentos = useRef(0)

  useEffect(() => {
    if (pagado && listo) vaciar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagado, listo])

  useEffect(() => {
    if (!esperando) return
    const t = setInterval(() => {
      if (intentos.current++ >= 6) return clearInterval(t)
      router.refresh()
    }, 4000)
    return () => clearInterval(t)
  }, [esperando, router])

  return null
}
