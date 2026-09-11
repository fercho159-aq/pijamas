'use client'

import { usePathname } from 'next/navigation'

/** El encabezado, el pie y el botón de WhatsApp son de la tienda: el panel no los lleva. */
export default function SoloTienda({ children }: { children: React.ReactNode }) {
  const ruta = usePathname()
  if (ruta.startsWith('/admin')) return null
  return <>{children}</>
}
