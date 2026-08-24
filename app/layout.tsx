import type { Metadata, Viewport } from 'next'
import { Fraunces, Karla } from 'next/font/google'
import './globals.css'
import { CarritoProvider } from '@/components/CarritoProvider'
import Encabezado from '@/components/Encabezado'
import Pie from '@/components/Pie'
import BotonWhatsApp from '@/components/BotonWhatsApp'
import { getConfig, usaSupabase } from '@/lib/datos'
import { getMenu } from '@/lib/menu'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-fraunces',
  display: 'swap',
})
const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-karla',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pijamas-woad.vercel.app'),
  title: {
    default: 'Rossy Lady · Pijamas hechas en México',
    template: '%s · Rossy Lady',
  },
  description:
    'Pijamas y camisones de algodón para dama y caballero. 26 modelos, tallas CH a 2XG. Hechos en México desde 2019. Envío a todo el país.',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Rossy Lady',
  },
}

export const viewport: Viewport = {
  themeColor: '#5E1F47',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [config, menu] = await Promise.all([getConfig(), getMenu()])
  return (
    <html lang="es" className={`${fraunces.variable} ${karla.variable}`}>
      <body>
        <CarritoProvider>
          <Encabezado config={config} menu={menu} />
          <main id="contenido">{children}</main>
          <Pie demo={!usaSupabase} />
          <BotonWhatsApp numero={config.whatsapp} />
        </CarritoProvider>
      </body>
    </html>
  )
}
