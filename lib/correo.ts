import 'server-only'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { pesos } from './formato'
import type { Armado, DatosEnvio } from './pedidos'

/**
 * Correos de la tienda, por SMTP del propio dominio (Hostinger).
 *
 * Nunca tumban un pedido: si el correo falla, se registra en el log y la
 * compra sigue su camino. Sin SMTP configurado, simplemente no se manda nada.
 */
const HOST = process.env.SMTP_HOST
const USUARIO = process.env.SMTP_USER
const CLAVE = process.env.SMTP_PASS
const PUERTO = Number(process.env.SMTP_PORT || 465)
const TIENDA = process.env.CORREO_TIENDA || USUARIO

export const correoConfigurado = Boolean(HOST && USUARIO && CLAVE)

let transporte: Transporter | null = null
function conectar() {
  if (!correoConfigurado) return null
  transporte ??= nodemailer.createTransport({
    host: HOST,
    port: PUERTO,
    secure: PUERTO === 465,
    auth: { user: USUARIO, pass: CLAVE },
  })
  return transporte
}

async function enviar(para: string, asunto: string, html: string, texto: string) {
  const t = conectar()
  if (!t || !para) return false
  try {
    await t.sendMail({
      from: `Rossy Lady <${USUARIO}>`,
      to: para,
      subject: asunto,
      text: texto,
      html,
    })
    return true
  } catch (e) {
    console.error('[correo]', asunto, e)
    return false
  }
}

/* ══════════════ Plantilla ══════════════ */

const E = (s: unknown) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

function plantilla(titulo: string, intro: string, cuerpo: string, pie = '') {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f8f2f6;padding:24px 12px;
  font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2a1f26">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="max-width:560px;background:#fdfafc;border:1px solid #e7d8e2;border-radius:14px;overflow:hidden">
      <tr><td style="background:#5e1f47;padding:18px 24px;color:#fff;font-weight:700;letter-spacing:.04em">
        ROSSY LADY</td></tr>
      <tr><td style="padding:24px">
        <h1 style="margin:0 0 8px;font-size:21px;line-height:1.25">${E(titulo)}</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#6c5c66">${intro}</p>
        ${cuerpo}
        ${pie ? `<p style="margin:18px 0 0;font-size:13px;color:#9a8a94;line-height:1.5">${pie}</p>` : ''}
      </td></tr>
      <tr><td style="padding:14px 24px;background:#f8f2f6;font-size:12px;color:#9a8a94">
        Rossy Lady · Pijamas hechas en México desde 1999</td></tr>
    </table>
  </td></tr></table></body></html>`
}

function tablaItems(armado: Armado) {
  const filas = armado.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #e7d8e2;font-size:14px">
          ${E(i.nombre)} · modelo ${i.numero}<br>
          <span style="color:#9a8a94;font-size:12.5px">${E(i.color)} · talla ${E(i.talla)} · ${i.cantidad} ${
            i.cantidad === 1 ? 'pieza' : 'piezas'
          }</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e7d8e2;font-size:14px;text-align:right;white-space:nowrap">
          ${pesos(i.importe)}</td>
      </tr>`
    )
    .join('')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${filas}
    <tr><td style="padding:8px 0;font-size:14px;color:#6c5c66">Envío</td>
        <td style="padding:8px 0;font-size:14px;text-align:right">${
          armado.envio ? pesos(armado.envio) : 'Gratis'
        }</td></tr>
    <tr><td style="padding:6px 0;font-size:16px;font-weight:700">Total</td>
        <td style="padding:6px 0;font-size:16px;font-weight:700;text-align:right">${pesos(armado.total)}</td></tr>
  </table>`
}

const enTexto = (folio: string, armado: Armado) =>
  [
    `Pedido ${folio}`,
    ...armado.items.map((i) => `- ${i.nombre} (modelo ${i.numero}), ${i.color}, talla ${i.talla} x ${i.cantidad}: ${pesos(i.importe)}`),
    `Envío: ${armado.envio ? pesos(armado.envio) : 'Gratis'}`,
    `Total: ${pesos(armado.total)}`,
  ].join('\n')

/* ══════════════ Los tres correos ══════════════ */

/** A la clienta, en cuanto cierra el pedido. */
export async function correoPedidoNuevo(
  folio: string,
  datos: DatosEnvio,
  armado: Armado,
  canal: 'whatsapp' | 'mercadopago'
) {
  if (!datos.email) return false
  const intro =
    canal === 'mercadopago'
      ? 'Recibimos tu pedido. En cuanto se confirme el pago te volvemos a escribir.'
      : 'Recibimos tu pedido. Te escribimos por WhatsApp para confirmarlo y acordar el envío.'
  return enviar(
    datos.email,
    `Tu pedido ${folio} · Rossy Lady`,
    plantilla(
      `¡Gracias, ${E(datos.nombre.split(' ')[0])}!`,
      intro,
      tablaItems(armado),
      `Guarda tu folio <b>${E(folio)}</b> para cualquier aclaración.`
    ),
    `${intro}\n\n${enTexto(folio, armado)}`
  )
}

/** A la clienta, cuando Mercado Pago aprueba el cobro. */
export async function correoPagoConfirmado(folio: string, correo: string, nombre: string, total: number) {
  if (!correo) return false
  return enviar(
    correo,
    `Pago confirmado · pedido ${folio}`,
    plantilla(
      'Tu pago quedó confirmado',
      `Recibimos ${pesos(total)} de tu pedido <b>${E(folio)}</b>. Ya lo estamos preparando.`,
      '',
      'Te avisamos por WhatsApp cuando salga tu paquete, con el número de guía.'
    ),
    `Pago confirmado del pedido ${folio} por ${pesos(total)}. Ya lo estamos preparando.`
  )
}

/** Al negocio, para que no dependa de revisar el panel. */
export async function correoAvisoTienda(
  folio: string,
  datos: DatosEnvio,
  armado: Armado,
  canal: 'whatsapp' | 'mercadopago',
  urlPanel: string
) {
  if (!TIENDA) return false
  const direccion = [datos.calle, datos.colonia, datos.ciudad, datos.estado, datos.cp && `CP ${datos.cp}`]
    .filter(Boolean)
    .join(', ')
  const datosHtml = `<p style="margin:0 0 14px;font-size:14px;line-height:1.6">
      <b>${E(datos.nombre)}</b><br>${E(datos.telefono)}${datos.email ? `<br>${E(datos.email)}` : ''}<br>
      ${E(direccion)}${datos.referencias ? `<br><span style="color:#9a8a94">${E(datos.referencias)}</span>` : ''}
    </p>`
  return enviar(
    TIENDA,
    `Pedido nuevo ${folio} · ${pesos(armado.total)}`,
    plantilla(
      `Pedido ${E(folio)}`,
      canal === 'mercadopago'
        ? 'Entró por la tienda con pago en Mercado Pago. Revisa si ya quedó pagado.'
        : 'Entró por la tienda para cerrarse por WhatsApp.',
      datosHtml + tablaItems(armado),
      `Ábrelo en el panel: <a href="${E(urlPanel)}" style="color:#d6007f">${E(urlPanel)}</a>`
    ),
    `Pedido ${folio}\n${datos.nombre} · ${datos.telefono}\n${direccion}\n\n${enTexto(folio, armado)}\n\n${urlPanel}`
  )
}
