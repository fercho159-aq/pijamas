import { NextResponse } from 'next/server'
import { firmaValida, obtenerPago } from '@/lib/mp'
import { marcarPago } from '@/lib/pedidos'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

/**
 * Aviso de Mercado Pago cuando algo pasa con un pago.
 *
 * El aviso solo trae el id: el estado real se consulta a su API, porque el
 * cuerpo de la petición no es de fiar. Siempre se contesta 200, incluso si
 * algo falla de nuestro lado; si no, Mercado Pago reintenta en bucle.
 */
export async function POST(peticion: Request) {
  try {
    const url = new URL(peticion.url)
    const cuerpo = (await peticion.json().catch(() => ({}))) as {
      type?: string
      topic?: string
      action?: string
      data?: { id?: string | number }
    }

    const tipo = cuerpo.type ?? cuerpo.topic ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
    const idPago = String(cuerpo.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id') ?? '')

    if (tipo && tipo !== 'payment') return NextResponse.json({ ok: true, ignorado: tipo })
    if (!idPago) return NextResponse.json({ ok: true, ignorado: 'sin id' })

    const firma = firmaValida(
      peticion.headers.get('x-signature'),
      peticion.headers.get('x-request-id'),
      idPago
    )
    if (firma === false) {
      console.warn('[mp] firma inválida para el pago', idPago)
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const pago = await obtenerPago(idPago)
    const folio = pago.external_reference
    if (!folio) return NextResponse.json({ ok: true, ignorado: 'pago sin folio' })

    const aprobado = await marcarPago(folio, String(pago.id), pago.status)
    if (aprobado) revalidatePath('/', 'layout') // las existencias bajaron
    console.log('[mp]', folio, pago.status)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[mp] webhook', e)
    return NextResponse.json({ ok: true, error: true })
  }
}

/** Mercado Pago a veces verifica la URL con un GET. */
export function GET() {
  return NextResponse.json({ ok: true })
}
