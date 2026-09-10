import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guía de tallas',
  description: 'Medidas en centímetros para dama y caballero. Cada modelo indica su escala, de CH a XXX.',
}

const DAMA = [
  ['CH', '30 – 32', '84 – 89', '66 – 71', '90 – 95'],
  ['M', '34 – 36', '90 – 95', '72 – 77', '96 – 101'],
  ['G', '38 – 40', '96 – 101', '78 – 84', '102 – 107'],
  ['XG', '42 – 44', '102 – 108', '85 – 92', '108 – 114'],
  ['XX', '46 – 48', '109 – 116', '93 – 100', '115 – 122'],
  ['XXX', '50 – 52', '117 – 124', '101 – 108', '123 – 130'],
]
const CAB = [
  ['CH', '89 – 94', '76 – 81', '89 – 94'],
  ['M', '95 – 100', '82 – 87', '95 – 100'],
  ['G', '101 – 107', '88 – 94', '101 – 106'],
  ['XG', '108 – 114', '95 – 102', '107 – 113'],
]

export default function GuiaTallas() {
  return (
    <section className="seccion envoltura" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 'clamp(25px,4.6vw,34px)' }}>Guía de tallas</h1>
      <p className="apunte" style={{ margin: '10px 0 6px' }}>
        Mide sobre tu cuerpo, no sobre la ropa, y con la cinta sin apretar.
      </p>
      <div className="nota">
        Cada modelo trae su propia escala: unos van de CH a XG, otros de M a XX o de M a XXX, y
        los petite de CH a G. La ficha de cada modelo indica cuáles tiene.
      </div>

      <h2 style={{ fontSize: 20, marginTop: 30, marginBottom: 12 }}>Dama</h2>
      <div className="tablaScroll">
        <table>
          <thead>
            <tr><th>Talla</th><th>Equiv. MX</th><th>Busto</th><th>Cintura</th><th>Cadera</th></tr>
          </thead>
          <tbody>
            {DAMA.map((f) => (
              <tr key={f[0]}>
                <td><b>{f[0]}</b></td>
                {f.slice(1).map((v, i) => <td key={i} className="num">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 20, marginTop: 30, marginBottom: 12 }}>Caballero</h2>
      <div className="tablaScroll">
        <table>
          <thead><tr><th>Talla</th><th>Pecho</th><th>Cintura</th><th>Cadera</th></tr></thead>
          <tbody>
            {CAB.map((f) => (
              <tr key={f[0]}>
                <td><b>{f[0]}</b></td>
                {f.slice(1).map((v, i) => <td key={i} className="num">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="apunte" style={{ marginTop: 22, fontSize: 13.5 }}>
        Todas las medidas están en centímetros y corresponden al cuerpo, no a la prenda.
        ¿Sigues con duda? Escríbenos por WhatsApp con tu estatura y peso y te decimos qué pedir.
      </p>
    </section>
  )
}
