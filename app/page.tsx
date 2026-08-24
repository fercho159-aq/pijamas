import Image from 'next/image'
import Link from 'next/link'
import TarjetaProducto from '@/components/TarjetaProducto'
import {
  getDestacados,
  getOfertas,
  getCategorias,
  getProductos,
  getConfig,
} from '@/lib/datos'
import { pesos } from '@/lib/formato'

export default async function Inicio() {
  const [destacados, ofertas, categorias, todos, config] = await Promise.all([
    getDestacados(),
    getOfertas(),
    getCategorias(),
    getProductos(),
    getConfig(),
  ])

  const heroe = todos.find((p) => p.numero === 161) ?? todos[0]
  const portadaDe = (slug: string) =>
    todos.find((p) => p.categoria === slug)?.colores[0].img ?? '/logo.png'

  const faq: [string, string][] = [
    [
      '¿Qué talla pido?',
      'Manejamos CH a 2XG con medidas en centímetros, no solo letras. Si quedas entre dos tallas, pide la mayor: nuestros modelos son de corte holgado.',
    ],
    [
      '¿Y si no me queda?',
      'Cambio de talla sin costo dentro de los primeros 15 días, siempre que la prenda no se haya usado y conserve su etiqueta.',
    ],
    [
      '¿La tela se transparenta?',
      'No. Trabajamos punto de 165 a 180 gramos por metro. En cada ficha viene el gramaje exacto del modelo.',
    ],
    [
      '¿Se despinta el diseño?',
      'Los modelos bordados llevan hilo, no estampado: no se cuartean ni se despintan. En cada ficha se indica cuál es cuál.',
    ],
    [
      '¿Cuánto tarda en llegar?',
      `Si pides antes de las ${config.horaCorte}, tu pedido sale el mismo día. De 2 a 4 días hábiles según tu estado.`,
    ],
    [
      '¿Cómo pago?',
      'Por ahora cerramos el pedido por WhatsApp: transferencia, depósito o efectivo contra entrega. Pronto, pago con tarjeta y meses sin intereses.',
    ],
  ]

  return (
    <>
      {/* Hero: una sola foto, sin carrusel. El carrusel arruina el LCP en móvil. */}
      <section className="hero">
        <Image
          src={heroe.colores[0].img}
          alt={`Pijama ${heroe.nombre}, modelo ${heroe.numero}`}
          width={600}
          height={800}
          priority
          sizes="100vw"
        />
        <div className="hero-ov">
          <div className="envoltura">
            <h1>Pijamas que aguantan lavada tras lavada.</h1>
            <p>
              {todos.length} modelos en algodón, para dama y caballero. Hechos en México desde
              2019.
            </p>
            <div className="hero-btns">
              <Link className="btn btn-pri" href="/dama">
                Ver catálogo
              </Link>
              <Link className="btn hero-gho" href={`/producto/${heroe.slug}`}>
                Ver este modelo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion envoltura">
        <div className="categorias">
          {categorias.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="cat">
              <Image src={portadaDe(c.slug)} alt={c.nombre} width={600} height={800} sizes="33vw" />
              <span>
                {c.nombre}
                <small>
                  {todos.filter((p) => p.categoria === c.slug).length} modelos · {c.sub}
                </small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="seccion envoltura">
        <div className="seccion-t">
          <h2>Los más pedidos</h2>
          <Link href="/dama">Ver todo</Link>
        </div>
        <div className="riel">
          {destacados.map((p) => (
            <TarjetaProducto key={p.numero} p={p} />
          ))}
        </div>
      </section>

      <section className="confianza">
        <div className="envoltura confianza-g">
          <div>
            <b>Hechos en México</b>
            <span>Taller propio desde 2019.</span>
          </div>
          <div>
            <b>Cambio de talla</b>
            <span>Sin costo los primeros 15 días.</span>
          </div>
          <div>
            <b>Envío a todo el país</b>
            <span>Gratis desde {pesos(config.envioGratisDesde)}.</span>
          </div>
          <div>
            <b>Te atiende una persona</b>
            <span>Cerramos tu pedido por WhatsApp.</span>
          </div>
        </div>
      </section>

      {ofertas.length >= 3 && (
        <section className="seccion envoltura">
          <div className="seccion-t">
            <h2>Ofertas</h2>
            <Link href="/ofertas">Ver todas</Link>
          </div>
          <div className="rejilla">
            {ofertas.map((p) => (
              <TarjetaProducto key={p.numero} p={p} />
            ))}
          </div>
        </section>
      )}

      <section className="seccion envoltura faq">
        <div className="seccion-t">
          <h2>Preguntas frecuentes</h2>
        </div>
        {faq.map(([q, a]) => (
          <details className="acc" key={q}>
            <summary>{q}</summary>
            <div className="cuerpo">{a}</div>
          </details>
        ))}
      </section>
    </>
  )
}
