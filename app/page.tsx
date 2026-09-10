import Image from 'next/image'
import Link from 'next/link'
import TarjetaProducto from '@/components/TarjetaProducto'
import Resenas from '@/components/Resenas'
import { getResenas, resenasSonEjemplo } from '@/lib/resenas'
import {
  getDestacados,
  getOfertas,
  getCategorias,
  getProductos,
  getConfig,
} from '@/lib/datos'
import { pesos, portada } from '@/lib/formato'

export default async function Inicio() {
  const [destacados, ofertas, categorias, todos, config, resenas] = await Promise.all([
    getDestacados(),
    getOfertas(),
    getCategorias(),
    getProductos(),
    getConfig(),
    getResenas(),
  ])
  // en el inicio, las mejores y mas recientes
  const mejores = [...resenas]
    .sort((a, b) => b.estrellas - a.estrellas || b.fecha.localeCompare(a.fecha))
    .slice(0, 6)

  const portadaDe = (slug: string) =>
    todos.filter((p) => p.categoria === slug).map(portada).find((c) => c.img)?.img ?? '/logo.png'

  const faq: [string, string][] = [
    [
      '¿Qué talla pido?',
      'Cada modelo indica sus tallas disponibles, de CH a XXX según el modelo, y en la guía están las medidas en centímetros. Si dudas entre dos tallas, escríbenos por WhatsApp y te orientamos.',
    ],
    [
      '¿Y si no me queda?',
      'Cambio de talla sin costo dentro de los primeros 15 días, siempre que la prenda no se haya usado y conserve su etiqueta.',
    ],
    [
      '¿De qué tela son?',
      'Todas nuestras prendas son 100 % algodón, con materiales nacionales: chifón, piqué o franela según el modelo. La composición exacta viene en cada ficha.',
    ],
    [
      '¿Cómo las cuido?',
      'Lávalas a máquina en agua fría, del revés y con colores similares, sin cloro, y sécalas a la sombra. Así los estampados y bordados duran mucho más.',
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
      {/*
        Hero partido. Antes era una foto retrato estirada a 21:9 a todo lo
        ancho: 600 px de origen sobre 1400 px de pantalla, de ahi lo borroso.
        Ahora la columna de la foto nunca pasa de 500 px, y el origen tiene
        1005 px nativos: nitida incluso en pantallas de doble densidad.
      */}
      <section className="hero">
        <div className="hero-in envoltura">
          <div className="hero-foto">
            <Image
              src="/hero/hero-163.jpg"
              alt="Modelo con el conjunto Nelly, blusa de tirantes blanca y short rojo con alcatraces"
              width={1005}
              height={1335}
              priority
              sizes="(min-width: 900px) 500px, 100vw"
            />
          </div>

          <div className="hero-txt">
            <span className="hero-eyebrow">Hechas en México desde 1999</span>
            <h1>Pijamas que aguantan lavada tras lavada.</h1>
            <p>
              Pijamas y batas para dama y pijamas para caballero, diseñadas y confeccionadas en nuestro propio taller.
            </p>
            <div className="hero-btns">
              <Link className="btn btn-pri" href="/catalogo">
                Ver catálogo
              </Link>
              <Link className="btn hero-gho" href="/producto/163-nelly">
                Ver este modelo
              </Link>
            </div>
            <ul className="hero-puntos">
              <li>Envío gratis desde {pesos(config.envioGratisDesde)}</li>
              <li>Cambio de talla sin costo</li>
            </ul>
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
                  {c.sub}
                </small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="seccion envoltura">
        <div className="seccion-t">
          <h2>Destacados</h2>
          <Link href="/catalogo">Ver todo</Link>
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
            <span>Taller propio desde 1999.</span>
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

      <section className="historia">
        <div className="historia-in envoltura">
          <div className="historia-txt">
            <span className="historia-eyebrow">Desde 1999</span>
            <h2>Una marca hecha por quien conoce el oficio</h2>
            <p>
              Rossy Lady nació en 1999. La fundó la señora Rossy Espejel Morales, que después de
              varios años como jefa de producción para diferentes marcas decidió crear la suya.
            </p>
            <p>
              Desde entonces nos especializamos en pijamas y batas para dama, y en pijamas para
              caballero y niños. Todo se diseña y se confecciona en nuestro propio taller, con
              materiales 100 % nacionales, cuidando que las tallas sean exactas y que los modelos
              estén a la moda.
            </p>
            <p className="historia-impi">Rossy Lady es una marca registrada ante el IMPI.</p>
          </div>
          <div className="historia-foto">
            <Image
              src="/hero/hero-161.jpg"
              alt="Pijama Mara de Rossy Lady, camiseta blanca con girasoles"
              width={856}
              height={1137}
              sizes="(min-width: 900px) 380px, 100vw"
            />
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

      <Resenas rs={mejores} ejemplo={resenasSonEjemplo} titulo="Clientas que ya la tienen" />

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
