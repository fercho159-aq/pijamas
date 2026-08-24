'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { LineaCarrito } from '@/lib/tipos'

const LLAVE = 'rossy.carrito.v1'

type Ctx = {
  lineas: LineaCarrito[]
  piezas: number
  agregar: (l: LineaCarrito) => void
  cambiarCantidad: (i: number, delta: number) => void
  quitar: (i: number) => void
  vaciar: () => void
  listo: boolean
}

const CarritoCtx = createContext<Ctx | null>(null)

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<LineaCarrito[]>([])
  // `listo` evita el parpadeo entre el HTML del servidor y lo que hay guardado
  const [listo, setListo] = useState(false)

  useEffect(() => {
    try {
      const g = localStorage.getItem(LLAVE)
      if (g) setLineas(JSON.parse(g))
    } catch {
      /* localStorage bloqueado: el carrito vive solo en memoria */
    }
    setListo(true)
  }, [])

  useEffect(() => {
    if (!listo) return
    try {
      localStorage.setItem(LLAVE, JSON.stringify(lineas))
    } catch {
      /* sin persistencia, pero la sesión sigue funcionando */
    }
  }, [lineas, listo])

  const api = useMemo<Ctx>(
    () => ({
      lineas,
      listo,
      piezas: lineas.reduce((t, l) => t + l.cantidad, 0),
      agregar: (nueva) =>
        setLineas((prev) => {
          const i = prev.findIndex(
            (l) =>
              l.numero === nueva.numero && l.color === nueva.color && l.talla === nueva.talla
          )
          if (i === -1) return [...prev, nueva]
          const copia = [...prev]
          copia[i] = { ...copia[i], cantidad: copia[i].cantidad + nueva.cantidad }
          return copia
        }),
      cambiarCantidad: (i, delta) =>
        setLineas((prev) =>
          prev
            .map((l, k) => (k === i ? { ...l, cantidad: l.cantidad + delta } : l))
            .filter((l) => l.cantidad > 0)
        ),
      quitar: (i) => setLineas((prev) => prev.filter((_, k) => k !== i)),
      vaciar: () => setLineas([]),
    }),
    [lineas, listo]
  )

  return <CarritoCtx.Provider value={api}>{children}</CarritoCtx.Provider>
}

export function useCarrito() {
  const c = useContext(CarritoCtx)
  if (!c) throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  return c
}
