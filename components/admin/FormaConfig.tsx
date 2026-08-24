'use client'

import { useActionState } from 'react'
import { guardarConfig } from '@/lib/acciones'
import type { Config } from '@/lib/tipos'

export default function FormaConfig({ config }: { config: Config }) {
  const [estado, accion, guardando] = useActionState(guardarConfig, null)
  return (
    <form action={accion} className="adm-caja" style={{ maxWidth: 620 }}>
      <h2>Tienda</h2>

      <div className="campo">
        <label htmlFor="whatsapp">WhatsApp del negocio</label>
        <input id="whatsapp" name="whatsapp" defaultValue={config.whatsapp} inputMode="numeric" />
        <p className="adm-pista">Con lada de país y sin signos. México: 52 + 10 dígitos.</p>
      </div>

      <div className="dosCol">
        <div className="campo">
          <label htmlFor="envioGratis">Envío gratis desde</label>
          <input id="envioGratis" name="envioGratis" defaultValue={config.envioGratisDesde} inputMode="numeric" />
        </div>
        <div className="campo">
          <label htmlFor="costoEnvio">Costo de envío</label>
          <input id="costoEnvio" name="costoEnvio" defaultValue={config.costoEnvio} inputMode="numeric" />
        </div>
      </div>
      <p className="adm-pista">
        El umbral conviene arriba del ticket promedio: obliga a un segundo artículo y es la palanca
        más eficiente que hay sin presionar a nadie.
      </p>

      <div className="campo">
        <label htmlFor="horaCorte">Hora de corte de envíos</label>
        <input id="horaCorte" name="horaCorte" defaultValue={config.horaCorte} />
        <p className="adm-pista">
          «Pide antes de las X y sale hoy» se calcula contra esta hora y la del servidor. Después del
          corte cambia solo a «sale mañana».
        </p>
      </div>

      <div className="campo">
        <label htmlFor="banner">Texto de la barra de anuncio</label>
        <input id="banner" name="banner" defaultValue={`Envío gratis en pedidos desde $${config.envioGratisDesde}`} />
      </div>

      <h2>Pagos</h2>
      <label className="acepto">
        <input type="checkbox" name="mp" />
        <span>
          Activar pago con Mercado Pago. Requiere cargar las credenciales en las variables de
          entorno; mientras esté apagado, los pedidos se cierran solo por WhatsApp.
        </span>
      </label>

      {estado && <p className={estado.ok ? 'adm-ok' : 'adm-error'}>{estado.mensaje}</p>}
      <button className="btn btn-pri" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </form>
  )
}
