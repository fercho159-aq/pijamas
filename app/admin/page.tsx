import Link from 'next/link'
import { redirect } from 'next/navigation'
import { haySesion } from '@/lib/auth'
import { getProductos, getConfig, usaSupabase } from '@/lib/datos'
import { getResenas } from '@/lib/resenas'
import { pesos, existencias, precio } from '@/lib/formato'

export default async function Resumen() {
  if (!(await haySesion())) redirect('/admin/entrar')

  const [productos, resenas, config] = await Promise.all([
    getProductos(),
    getResenas(),
    getConfig(),
  ])

  const variantes = productos.flatMap((p) => p.colores)
  const agotadas = variantes.filter((v) => v.stock === 0)
  const escasas = variantes.filter((v) => v.stock > 0 && v.stock <= 5)
  const enOferta = productos.filter((p) => p.precioOferta)
  const inactivos = productos.filter((p) => existencias(p) === 0)
  const valorInventario = variantes.reduce((t, v) => {
    const p = productos.find((x) => x.colores.includes(v))!
    return t + v.stock * precio(p)
  }, 0)

  const tarjetas = [
    { n: productos.length, et: 'Modelos en catálogo', href: '/admin/productos' },
    { n: variantes.length, et: 'Variantes de color', href: '/admin/productos' },
    { n: agotadas.length, et: 'Agotadas', href: '/admin/productos', alerta: agotadas.length > 0 },
    { n: escasas.length, et: 'Con 5 piezas o menos', href: '/admin/productos', aviso: escasas.length > 0 },
  ]

  return (
    <>
      <h1 className="adm-h1">Resumen</h1>

      <div className="adm-tarjetas">
        {tarjetas.map((t) => (
          <Link
            key={t.et}
            href={t.href}
            className={`adm-tarjeta ${t.alerta ? 'alerta' : ''} ${t.aviso ? 'aviso' : ''}`}
          >
            <b>{t.n}</b>
            <span>{t.et}</span>
          </Link>
        ))}
      </div>

      <div className="adm-cols">
        <section className="adm-caja">
          <h2>Qué necesita atención</h2>
          <ul className="adm-lista">
            {agotadas.length > 0 && (
              <li>
                <b>{agotadas.length} variantes agotadas.</b> En la tienda el botón se apaga solo y
                ofrece avisar cuando regresen.
              </li>
            )}
            {escasas.length > 0 && (
              <li>
                <b>{escasas.length} variantes con 5 piezas o menos.</b> La ficha muestra «Últimas N
                piezas» — el aviso sale del stock, así que si el número no es real, la tienda miente
                por ti.
              </li>
            )}
            {inactivos.length > 0 && (
              <li>
                <b>{inactivos.length} modelos sin una sola pieza.</b> Considera desactivarlos para
                que no aparezcan en el catálogo.
              </li>
            )}
            {enOferta.length > 0 && (
              <li>
                <b>{enOferta.length} modelos en oferta.</b> Cada oferta necesita fecha de fin: al
                vencer, el precio vuelve solo al de lista.
              </li>
            )}
            {resenas.length === 0 && (
              <li>Todavía no hay reseñas. Llegan solas conforme se marquen pedidos como entregados.</li>
            )}
          </ul>
        </section>

        <section className="adm-caja">
          <h2>Estado</h2>
          <dl className="adm-datos">
            <div>
              <dt>Base de datos</dt>
              <dd>{usaSupabase ? 'Supabase conectada' : 'Respaldo local (demostración)'}</dd>
            </div>
            <div>
              <dt>Piezas en inventario</dt>
              <dd>{variantes.reduce((t, v) => t + v.stock, 0)}</dd>
            </div>
            <div>
              <dt>Valor del inventario</dt>
              <dd>{pesos(valorInventario)}</dd>
            </div>
            <div>
              <dt>Envío gratis desde</dt>
              <dd>{pesos(config.envioGratisDesde)}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{config.whatsapp}</dd>
            </div>
            <div>
              <dt>Reseñas publicadas</dt>
              <dd>{resenas.length}</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  )
}
