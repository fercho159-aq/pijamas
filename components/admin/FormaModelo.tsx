'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import TarjetaProducto from '../TarjetaProducto'
import { borrarProducto, guardarModelo, subirFoto } from '@/lib/acciones'
import type { Resultado } from '@/lib/acciones'
import { pesos } from '@/lib/formato'
import type { ModeloEntrada, OpcionesForma, Producto } from '@/lib/tipos'

type ColorForma = {
  clave: string
  nombre: string
  hex: string
  sku?: string
  stock: number
  img: string | null
  subiendo?: boolean
  error?: string
}

type Forma = Omit<
  ModeloEntrada,
  'numero' | 'precioLista' | 'precioOferta' | 'ofertaTermina' | 'colores'
> & {
  numero: string
  precioLista: string
  enOferta: boolean
  precioOferta: string
  /** Hora local del navegador, como la pide <input type="datetime-local">. */
  ofertaTermina: string
  colores: ColorForma[]
}

let consecutivo = 0
const nuevaClave = () => `c${++consecutivo}`

const soloDigitos = (s: string) => s.replace(/\D/g, '')
const soloPrecio = (s: string) => s.replace(/[^\d.]/g, '')

const slugDe = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** ISO → "2026-09-18T23:59" en la hora del navegador. */
function aLocal(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function enDias(dias: number) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  d.setHours(23, 59, 0, 0)
  return aLocal(d.toISOString())
}

// La hora se convierte solo en el navegador: el servidor no sabe en qué zona está la clienta.
function aForma(m: ModeloEntrada, conHora: boolean): Forma {
  return {
    ...m,
    numero: m.numero ? String(m.numero) : '',
    precioLista: m.precioLista ? String(m.precioLista) : '',
    enOferta: m.precioOferta != null,
    precioOferta: m.precioOferta != null ? String(m.precioOferta) : '',
    ofertaTermina: conHora && m.ofertaTermina ? aLocal(m.ofertaTermina) : '',
    colores: m.colores.map((c) => ({ ...c, clave: nuevaClave() })),
  }
}

/** Huella de lo capturado, para saber si hay cambios sin guardar. */
const firma = (f: Forma) =>
  JSON.stringify({
    ...f,
    colores: f.colores.map((c) => [c.nombre, c.hex, c.sku, c.stock, c.img]),
  })

function aEntrada(f: Forma): ModeloEntrada {
  const fin = f.enOferta && f.ofertaTermina ? new Date(f.ofertaTermina) : null
  return {
    id: f.id,
    numero: Number(f.numero) || 0,
    nombre: f.nombre,
    categoria: f.categoria,
    tipo: f.tipo,
    descripcion: f.descripcion,
    composicion: f.composicion,
    cuidados: f.cuidados,
    precioLista: Number(f.precioLista) || 0,
    precioOferta: f.enOferta ? Number(f.precioOferta) || 0 : null,
    ofertaTermina: fin && !Number.isNaN(fin.getTime()) ? fin.toISOString() : null,
    destacado: f.destacado,
    activo: f.activo,
    portada: f.portada,
    tallas: f.tallas,
    colores: f.colores.map(({ nombre, hex, sku, stock, img }) => ({ nombre, hex, sku, stock, img })),
  }
}

/**
 * Las fotos del celular pesan 4–8 MB. Se reducen aquí antes de subirlas:
 * suben en segundos con datos móviles y caben en el límite del servidor.
 * El recorte fino a 3:4 lo hace el servidor.
 */
async function reducir(archivo: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(archivo)
    const escala = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(bmp.width * escala)
    lienzo.height = Math.round(bmp.height * escala)
    const ctx = lienzo.getContext('2d')!
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, lienzo.width, lienzo.height)
    ctx.drawImage(bmp, 0, 0, lienzo.width, lienzo.height)
    bmp.close()
    const blob = await new Promise<Blob | null>((listo) => lienzo.toBlob(listo, 'image/jpeg', 0.92))
    return blob ?? archivo
  } catch {
    return archivo // el navegador no la pudo abrir: que lo intente el servidor
  }
}

const ATAJOS_TALLAS = [
  { et: 'CH a XG', de: 'CH', a: 'XG' },
  { et: 'M a XX', de: 'M', a: 'XX' },
  { et: 'M a XXX', de: 'M', a: 'XXX' },
  { et: 'Todas', de: 'CH', a: 'XXX' },
]

const PLAZOS = [
  { dias: 3, et: '3 días' },
  { dias: 7, et: '1 semana' },
  { dias: 14, et: '2 semanas' },
  { dias: 30, et: '1 mes' },
]

export default function FormaModelo({
  inicial,
  slug,
  opciones,
  editando,
  recienCreado = false,
}: {
  inicial: ModeloEntrada
  slug?: string
  opciones: OpcionesForma
  editando: boolean
  recienCreado?: boolean
}) {
  const router = useRouter()
  const [forma, setForma] = useState(() => aForma(inicial, false))
  const [aviso, setAviso] = useState<Resultado | null>(
    recienCreado ? { ok: true, mensaje: 'Modelo creado. Ya puedes seguir editándolo.' } : null
  )
  const [campoMal, setCampoMal] = useState<string | null>(null)
  const [paletaAbierta, setPaletaAbierta] = useState(false)
  const [otro, setOtro] = useState({ nombre: '', hex: '#E8B4C8' })
  const [arrastre, setArrastre] = useState<string | null>(null)
  const [guardando, empezar] = useTransition()
  const [yendo, setYendo] = useState(false)

  const base = useRef<string | null>(null)
  const actual = useRef(forma)
  actual.current = forma
  const archivos = useRef(new Map<string, HTMLInputElement>())

  // Al abrir, y cada vez que el servidor devuelve lo recién guardado (ya con sus SKU).
  // Si hay cambios sin guardar no se pisan.
  const llegada = JSON.stringify(inicial)
  useEffect(() => {
    if (base.current !== null && firma(actual.current) !== base.current) return
    const f = aForma(inicial, true)
    setForma(f)
    base.current = firma(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llegada])

  useEffect(() => {
    if (recienCreado) window.history.replaceState(null, '', window.location.pathname)
  }, [recienCreado])

  const sucio = base.current !== null && firma(forma) !== base.current
  const subiendo = forma.colores.some((c) => c.subiendo)

  // Avisar antes de perder cambios: al cerrar la pestaña o al tocar otro enlace del panel.
  useEffect(() => {
    if (!sucio) return
    const alCerrar = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    const alTocar = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || e.ctrlKey || e.metaKey) return
      if (!confirm('Tienes cambios sin guardar. ¿Salir sin guardarlos?')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', alCerrar)
    document.addEventListener('click', alTocar, true)
    return () => {
      window.removeEventListener('beforeunload', alCerrar)
      document.removeEventListener('click', alTocar, true)
    }
  }, [sucio])

  /* ── cambios ── */

  function limpiar() {
    setCampoMal(null)
    setAviso(null)
  }

  function cambiar(cambios: Partial<Forma>) {
    setForma((f) => ({ ...f, ...cambios }))
    limpiar()
  }

  function cambiarColor(clave: string, cambios: Partial<ColorForma>) {
    setForma((f) => ({
      ...f,
      colores: f.colores.map((c) => (c.clave === clave ? { ...c, ...cambios } : c)),
    }))
  }

  function editarColor(clave: string, cambios: Partial<ColorForma>) {
    cambiarColor(clave, cambios)
    limpiar()
  }

  function renombrar(clave: string, nombre: string) {
    setForma((f) => {
      const viejo = f.colores.find((c) => c.clave === clave)?.nombre
      return {
        ...f,
        portada: f.portada && f.portada === viejo ? nombre : f.portada,
        colores: f.colores.map((c) => (c.clave === clave ? { ...c, nombre } : c)),
      }
    })
    limpiar()
  }

  function agregarColor(nombre: string, hex: string) {
    const limpio = nombre.trim()
    if (!limpio || forma.colores.some((c) => c.nombre.toLowerCase() === limpio.toLowerCase())) return
    setForma((f) => ({
      ...f,
      colores: [...f.colores, { clave: nuevaClave(), nombre: limpio, hex, stock: 0, img: null }],
    }))
    limpiar()
  }

  function quitarColor(c: ColorForma) {
    const detalle = c.stock ? ` y sus ${c.stock} piezas` : ''
    if ((c.img || c.stock > 0) && !confirm(`¿Quitar el color ${c.nombre}${detalle}?`)) return
    setForma((f) => ({
      ...f,
      portada: f.portada === c.nombre ? null : f.portada,
      colores: f.colores.filter((x) => x.clave !== c.clave),
    }))
    limpiar()
  }

  function mover(clave: string, paso: -1 | 1) {
    setForma((f) => {
      const i = f.colores.findIndex((c) => c.clave === clave)
      const j = i + paso
      if (i < 0 || j < 0 || j >= f.colores.length) return f
      const colores = [...f.colores]
      ;[colores[i], colores[j]] = [colores[j], colores[i]]
      return { ...f, colores }
    })
    limpiar()
  }

  async function subir(clave: string, archivo: File | undefined) {
    if (!archivo) return
    if (!archivo.type.startsWith('image/') && !/\.(heic|heif)$/i.test(archivo.name)) {
      cambiarColor(clave, { error: 'Ese archivo no es una foto.' })
      return
    }
    cambiarColor(clave, { subiendo: true, error: undefined })
    const f = actual.current
    const color = f.colores.find((c) => c.clave === clave)
    const datos = new FormData()
    datos.append('archivo', await reducir(archivo), 'foto.jpg')
    datos.append('base', `${f.numero} ${f.nombre} ${color?.nombre ?? ''}`)
    try {
      const r = await subirFoto(datos)
      if (!r.ok || !r.url) {
        cambiarColor(clave, { subiendo: false, error: r.mensaje })
        return
      }
      const url = r.url
      setForma((g) => {
        const nombre = g.colores.find((c) => c.clave === clave)?.nombre ?? null
        const portadaConFoto = g.colores.some((c) => c.nombre === g.portada && c.img)
        return {
          ...g,
          portada: portadaConFoto ? g.portada : nombre,
          colores: g.colores.map((c) =>
            c.clave === clave ? { ...c, img: url, subiendo: false, error: undefined } : c
          ),
        }
      })
      setAviso(null)
    } catch {
      cambiarColor(clave, {
        subiendo: false,
        error: 'No se pudo subir. Revisa tu conexión e inténtalo de nuevo.',
      })
    }
  }

  /* ── guardar ── */

  function marcar(campo: string, mensaje: string) {
    setAviso({ ok: false, mensaje })
    setCampoMal(campo)
    const el = document.querySelector<HTMLElement>(`[data-campo="${campo}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.querySelector<HTMLElement>('input, select, textarea, button')?.focus({ preventScroll: true })
  }

  function guardar() {
    if (subiendo) return setAviso({ ok: false, mensaje: 'Espera a que termine de subir la foto.' })
    if (forma.enOferta && !forma.precioOferta)
      return marcar('precioOferta', 'Escribe el precio de oferta o apaga «Poner en oferta».')
    const enviada = forma
    empezar(async () => {
      const r = await guardarModelo(aEntrada(enviada))
      if (!r.ok) {
        if (r.campo) marcar(r.campo, r.mensaje)
        else setAviso(r)
        return
      }
      base.current = firma(enviada)
      setAviso(r)
      if (!editando || r.slug !== slug) {
        setYendo(true)
        router.replace(`/admin/productos/${r.slug}${editando ? '' : '?listo=1'}`)
      }
    })
  }

  function descartar() {
    if (!confirm('¿Descartar los cambios y volver a lo que estaba guardado?')) return
    const f = aForma(inicial, true)
    setForma(f)
    base.current = firma(f)
    limpiar()
  }

  function eliminar() {
    const n = inicial.colores.length
    if (
      !confirm(
        `¿Eliminar el modelo ${inicial.numero} ${inicial.nombre}? Se borra con sus ${n} ${n === 1 ? 'color' : 'colores'} y no se puede deshacer.`
      )
    )
      return
    base.current = firma(actual.current) // ya se confirmó: que no pregunte otra vez por los cambios
    empezar(async () => {
      const r = await borrarProducto(inicial.numero, true)
      if (r && !r.ok) setAviso(r)
    })
  }

  /* ── lo que se pinta ── */

  const numero = Number(forma.numero) || 0
  const sugerido = Math.max(100, ...opciones.modelos.map((x) => x.numero)) + 1
  const repetido = numero
    ? opciones.modelos.find((x) => x.numero === numero && !(editando && x.numero === inicial.numero))
    : undefined
  const direccion = numero && forma.nombre.trim() ? `/producto/${numero}-${slugDe(forma.nombre)}` : null

  const lista = Number(forma.precioLista) || 0
  const oferta = Number(forma.precioOferta) || 0
  const ofertaOk = forma.enOferta && oferta > 0 && oferta < lista
  const off = ofertaOk ? Math.round((1 - oferta / lista) * 100) : 0
  const fin = forma.ofertaTermina ? new Date(forma.ofertaTermina) : null
  const finTexto =
    fin && !Number.isNaN(fin.getTime())
      ? fin.toLocaleString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: 'numeric',
          minute: '2-digit',
        })
      : null

  const usados = new Set(forma.colores.map((c) => c.nombre.trim().toLowerCase()))
  const piezas = forma.colores.reduce((t, c) => t + c.stock, 0)
  const sinFoto = forma.colores.filter((c) => !c.img).length
  const mal = (campo: string) => (campoMal === campo ? ' fm-mal' : '')

  const vista: Producto = {
    numero,
    nombre: forma.nombre.trim() || 'Nombre del modelo',
    slug: '',
    categoria: forma.categoria,
    tipo: forma.tipo,
    descripcion: '',
    composicion: '',
    cuidados: '',
    precioLista: lista,
    precioOferta: ofertaOk ? oferta : null,
    destacado: forma.destacado,
    activo: forma.activo,
    portada: forma.portada,
    tallas: forma.tallas,
    colores: forma.colores.length
      ? forma.colores.map((c) => ({ nombre: c.nombre, hex: c.hex, sku: c.clave, stock: c.stock, img: c.img }))
      : [{ nombre: '', hex: '#EFE6EA', sku: 'vacio', stock: 1, img: null }],
  }

  const estado = yendo
    ? { cls: '', txt: 'Abriendo el modelo…' }
    : aviso && !aviso.ok
      ? { cls: 'mal', txt: aviso.mensaje }
      : subiendo
        ? { cls: '', txt: 'Subiendo foto…' }
        : sucio
          ? { cls: 'sucio', txt: editando ? 'Tienes cambios sin guardar.' : 'Cuando esté listo, créalo.' }
          : aviso?.ok
            ? { cls: 'ok', txt: `✓ ${aviso.mensaje}` }
            : { cls: '', txt: editando ? 'Todo guardado.' : 'Llena los datos y crea el modelo.' }

  const rango = (de: string, a: string) =>
    opciones.tallas.slice(opciones.tallas.indexOf(de), opciones.tallas.indexOf(a) + 1)

  return (
    <div className="fm-envoltura">
      <div className="fm">
        <div className="fm-main">
          {/* ── 1. Lo básico ── */}
          <section className="adm-caja">
            <h2 className="fm-tit">
              <i>1</i> Lo básico
            </h2>
            <div className="fm-rej-num">
              <div className={`fm-campo${mal('numero')}`} data-campo="numero">
                <label htmlFor="fm-numero">Número</label>
                <input
                  id="fm-numero"
                  className="fm-in"
                  inputMode="numeric"
                  placeholder={`Ej. ${sugerido}`}
                  value={forma.numero}
                  onChange={(e) => cambiar({ numero: soloDigitos(e.target.value).slice(0, 5) })}
                />
              </div>
              <div className={`fm-campo${mal('nombre')}`} data-campo="nombre">
                <label htmlFor="fm-nombre">Nombre</label>
                <input
                  id="fm-nombre"
                  className="fm-in"
                  maxLength={60}
                  placeholder="Ej. Jazmín"
                  value={forma.nombre}
                  onChange={(e) => cambiar({ nombre: e.target.value })}
                />
              </div>
            </div>
            {repetido ? (
              <p className="fm-nota mal fm-debajo">
                Ya existe el modelo {repetido.numero} ({repetido.nombre}). Usa otro número.
              </p>
            ) : (
              direccion && <p className="fm-nota fm-debajo">Dirección en la tienda: {direccion}</p>
            )}

            <div className="fm-rej2">
              <div className={`fm-campo${mal('categoria')}`} data-campo="categoria">
                <label htmlFor="fm-categoria">Sección de la tienda</label>
                <select
                  id="fm-categoria"
                  className="fm-in"
                  value={forma.categoria}
                  onChange={(e) => cambiar({ categoria: e.target.value })}
                >
                  <option value="" disabled>
                    Elige una sección
                  </option>
                  {opciones.categorias.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fm-campo">
                <label htmlFor="fm-tipo">
                  Tipo <small>(opcional)</small>
                </label>
                <input
                  id="fm-tipo"
                  className="fm-in"
                  list="fm-tipos"
                  placeholder="Ej. Manga corta + short"
                  value={forma.tipo}
                  onChange={(e) => cambiar({ tipo: e.target.value })}
                />
                <datalist id="fm-tipos">
                  {opciones.tipos.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>
          </section>

          {/* ── 2. Precio ── */}
          <section className="adm-caja">
            <h2 className="fm-tit">
              <i>2</i> Precio
            </h2>
            <div className="fm-rej2">
              <div className={`fm-campo${mal('precioLista')}`} data-campo="precioLista">
                <label htmlFor="fm-lista">Precio normal</label>
                <div className="fm-peso">
                  <span>$</span>
                  <input
                    id="fm-lista"
                    className="fm-in"
                    inputMode="decimal"
                    placeholder="0"
                    value={forma.precioLista}
                    onChange={(e) => cambiar({ precioLista: soloPrecio(e.target.value).slice(0, 7) })}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="fm-interruptor"
              aria-pressed={forma.enOferta}
              onClick={() =>
                cambiar({
                  enOferta: !forma.enOferta,
                  ofertaTermina: !forma.enOferta && !forma.ofertaTermina ? enDias(7) : forma.ofertaTermina,
                })
              }
            >
              <span className="fm-int-txt">
                <b>Poner en oferta</b>
                <small>Muestra el precio tachado y una cuenta regresiva.</small>
              </span>
              <span className={`adm-toggle${forma.enOferta ? ' on' : ''}`}>
                <i />
              </span>
            </button>

            {forma.enOferta && (
              <div className="fm-oferta">
                <div className="fm-rej2">
                  <div className={`fm-campo${mal('precioOferta')}`} data-campo="precioOferta">
                    <label htmlFor="fm-oferta">Precio de oferta</label>
                    <div className="fm-peso">
                      <span>$</span>
                      <input
                        id="fm-oferta"
                        className="fm-in"
                        inputMode="decimal"
                        placeholder="0"
                        value={forma.precioOferta}
                        onChange={(e) => cambiar({ precioOferta: soloPrecio(e.target.value).slice(0, 7) })}
                      />
                    </div>
                  </div>
                  <div className={`fm-campo${mal('ofertaTermina')}`} data-campo="ofertaTermina">
                    <label htmlFor="fm-fin">Termina</label>
                    <input
                      id="fm-fin"
                      type="datetime-local"
                      className="fm-in"
                      value={forma.ofertaTermina}
                      onChange={(e) => cambiar({ ofertaTermina: e.target.value })}
                    />
                  </div>
                </div>
                <div className="fm-atajos">
                  <span>Que dure:</span>
                  {PLAZOS.map((p) => (
                    <button key={p.dias} type="button" onClick={() => cambiar({ ofertaTermina: enDias(p.dias) })}>
                      {p.et}
                    </button>
                  ))}
                </div>
                {ofertaOk ? (
                  <p className="adm-previo">
                    Se verá <b>{pesos(oferta)}</b> en lugar de <s>{pesos(lista)}</s> · <b>−{off}%</b>
                    {finTexto && <> · hasta el {finTexto}</>}
                  </p>
                ) : (
                  oferta > 0 &&
                  lista > 0 && <p className="fm-nota mal">La oferta tiene que ser menor que el precio normal.</p>
                )}
                <p className="fm-nota">Cuando termina, el precio vuelve solo al normal.</p>
              </div>
            )}
          </section>

          {/* ── 3. Colores y fotos ── */}
          <section className={`adm-caja${mal('colores')}`} data-campo="colores">
            <h2 className="fm-tit">
              <i>3</i> Colores y fotos
            </h2>
            <p className="fm-intro">
              Cada color lleva su foto y sus <b>existencias</b> (las piezas que tienes). Toca el
              recuadro o arrastra la foto encima; se recorta sola en vertical. La que tenga{' '}
              <b>★ Portada</b> es la que se ve en el catálogo.
            </p>

            <div className="fm-colores">
              {forma.colores.map((c, i) => {
                const esPortada = forma.portada === c.nombre && Boolean(c.img)
                return (
                  <div key={c.clave} className={`fm-color${esPortada ? ' portada' : ''}`}>
                    <div
                      className={`fm-foto${arrastre === c.clave ? ' arrastrando' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setArrastre(c.clave)
                      }}
                      onDragLeave={() => setArrastre(null)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setArrastre(null)
                        subir(c.clave, e.dataTransfer.files[0])
                      }}
                    >
                      {c.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.img} alt={`Foto del color ${c.nombre}`} />
                      ) : (
                        <div className="fm-foto-vacia" style={{ background: c.hex }}>
                          <span>
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                              <path
                                d="M4 8h3l2-3h6l2 3h3v11H4z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Subir foto
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="fm-foto-btn"
                        disabled={c.subiendo}
                        aria-label={c.img ? `Cambiar la foto de ${c.nombre}` : `Subir la foto de ${c.nombre}`}
                        onClick={() => archivos.current.get(c.clave)?.click()}
                      />
                      {c.img && <span className="fm-foto-cambiar">Cambiar foto</span>}
                      {c.img && (
                        <button
                          type="button"
                          className={`fm-estrella${esPortada ? ' on' : ''}`}
                          aria-pressed={esPortada}
                          onClick={() => cambiar({ portada: c.nombre })}
                        >
                          {esPortada ? '★ Portada' : '☆ Portada'}
                        </button>
                      )}
                      {c.img && (
                        <button
                          type="button"
                          className="fm-quitar-foto"
                          aria-label={`Quitar la foto de ${c.nombre}`}
                          onClick={() => editarColor(c.clave, { img: null })}
                        >
                          ×
                        </button>
                      )}
                      {c.subiendo && <div className="fm-subiendo">Subiendo…</div>}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={(el) => {
                          if (el) archivos.current.set(c.clave, el)
                          else archivos.current.delete(c.clave)
                        }}
                        onChange={(e) => {
                          subir(c.clave, e.target.files?.[0])
                          e.target.value = ''
                        }}
                      />
                    </div>

                    <div className="fm-color-cuerpo">
                      <div className="fm-color-nombre">
                        <label className="fm-muestra" style={{ background: c.hex }} title="Cambiar el tono">
                          <input
                            type="color"
                            value={c.hex.toLowerCase()}
                            aria-label={`Tono de ${c.nombre}`}
                            onChange={(e) => editarColor(c.clave, { hex: e.target.value.toUpperCase() })}
                          />
                        </label>
                        <input
                          className="fm-in"
                          value={c.nombre}
                          maxLength={30}
                          aria-label="Nombre del color"
                          onChange={(e) => renombrar(c.clave, e.target.value)}
                        />
                      </div>

                      <div className="fm-piezas-etq">
                        <span>Existencias</span>
                        {c.stock === 0 ? (
                          <em className="agotado">Agotado</em>
                        ) : (
                          c.stock <= 5 && <em>Últimas {c.stock}</em>
                        )}
                      </div>
                      <div className="fm-stepper">
                        <button
                          type="button"
                          aria-label={`Una pieza menos de ${c.nombre}`}
                          onClick={() => editarColor(c.clave, { stock: Math.max(0, c.stock - 1) })}
                        >
                          −
                        </button>
                        <input
                          inputMode="numeric"
                          value={c.stock}
                          aria-label={`Existencias de ${c.nombre}`}
                          onChange={(e) =>
                            editarColor(c.clave, { stock: Number(soloDigitos(e.target.value).slice(0, 5)) || 0 })
                          }
                          onFocus={(e) => e.target.select()}
                        />
                        <button
                          type="button"
                          aria-label={`Una pieza más de ${c.nombre}`}
                          onClick={() => editarColor(c.clave, { stock: c.stock + 1 })}
                        >
                          +
                        </button>
                      </div>

                      {c.error && <p className="fm-error-foto">{c.error}</p>}

                      <div className="fm-color-pie">
                        <span>
                          <button
                            type="button"
                            disabled={i === 0}
                            aria-label={`Mover ${c.nombre} antes`}
                            onClick={() => mover(c.clave, -1)}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={i === forma.colores.length - 1}
                            aria-label={`Mover ${c.nombre} después`}
                            onClick={() => mover(c.clave, 1)}
                          >
                            →
                          </button>
                        </span>
                        <button type="button" className="quitar" onClick={() => quitarColor(c)}>
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                className="fm-agregar"
                aria-expanded={paletaAbierta}
                onClick={() => setPaletaAbierta((v) => !v)}
              >
                <span>+</span>
                Agregar color
              </button>
            </div>

            {paletaAbierta && (
              <div className="fm-paleta">
                <div className="fm-paleta-cab">
                  <b>Toca los colores que lleva este modelo</b>
                  <button type="button" onClick={() => setPaletaAbierta(false)}>
                    Listo
                  </button>
                </div>
                <div className="fm-paleta-rej">
                  {opciones.paleta.map((p) => {
                    const ya = usados.has(p.nombre.toLowerCase())
                    return (
                      <button key={p.nombre} type="button" disabled={ya} onClick={() => agregarColor(p.nombre, p.hex)}>
                        <i style={{ background: p.hex }} />
                        {p.nombre}
                        {ya && ' ✓'}
                      </button>
                    )
                  })}
                </div>
                <div className="fm-otro">
                  <span>¿Otro color?</span>
                  <input
                    type="color"
                    value={otro.hex.toLowerCase()}
                    aria-label="Tono del color nuevo"
                    onChange={(e) => setOtro({ ...otro, hex: e.target.value })}
                  />
                  <input
                    className="fm-in"
                    placeholder="Nombre, ej. Lila"
                    maxLength={30}
                    value={otro.nombre}
                    onChange={(e) => setOtro({ ...otro, nombre: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      agregarColor(otro.nombre, otro.hex.toUpperCase())
                      setOtro({ ...otro, nombre: '' })
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-out"
                    disabled={!otro.nombre.trim() || usados.has(otro.nombre.trim().toLowerCase())}
                    onClick={() => {
                      agregarColor(otro.nombre, otro.hex.toUpperCase())
                      setOtro({ ...otro, nombre: '' })
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {forma.colores.length > 0 && (
              <p className="fm-nota fm-resumen">
                {forma.colores.length} {forma.colores.length === 1 ? 'color' : 'colores'} · {piezas}{' '}
                {piezas === 1 ? 'pieza' : 'piezas'} en existencia
                {sinFoto > 0 && ` · ${sinFoto} sin foto: en la tienda se ve el tono liso con «Foto en camino»`}
              </p>
            )}
          </section>

          {/* ── 4. Tallas ── */}
          <section className={`adm-caja${mal('tallas')}`} data-campo="tallas">
            <h2 className="fm-tit">
              <i>4</i> Tallas
            </h2>
            <p className="fm-intro">Toca las tallas que maneja este modelo.</p>
            <div className="fm-tallas">
              {opciones.tallas.map((t) => {
                const on = forma.tallas.includes(t)
                return (
                  <button
                    key={t}
                    type="button"
                    className="fm-talla"
                    aria-pressed={on}
                    onClick={() =>
                      cambiar({
                        tallas: on
                          ? forma.tallas.filter((x) => x !== t)
                          : opciones.tallas.filter((x) => x === t || forma.tallas.includes(x)),
                      })
                    }
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <div className="fm-atajos">
              <span>Atajos:</span>
              {ATAJOS_TALLAS.map((a) => (
                <button key={a.et} type="button" onClick={() => cambiar({ tallas: rango(a.de, a.a) })}>
                  {a.et}
                </button>
              ))}
            </div>
          </section>

          {/* ── 5. Descripción ── */}
          <section className="adm-caja">
            <h2 className="fm-tit">
              <i>5</i> Descripción y etiqueta
            </h2>
            <div className="fm-campo">
              <label htmlFor="fm-desc">
                Descripción <small>(opcional)</small>
              </label>
              <textarea
                id="fm-desc"
                className="fm-in"
                rows={4}
                maxLength={600}
                placeholder="Dos o tres frases: la tela, cómo se siente, para qué ocasión."
                value={forma.descripcion}
                onChange={(e) => cambiar({ descripcion: e.target.value })}
              />
              <span className="fm-nota fm-derecha">{forma.descripcion.length}/600</span>
            </div>
            <div className={`fm-campo${mal('composicion')}`} data-campo="composicion">
              <label htmlFor="fm-comp">Composición de la tela</label>
              <input
                id="fm-comp"
                className="fm-in"
                list="fm-comps"
                placeholder="Ej. 100% algodón"
                value={forma.composicion}
                onChange={(e) => cambiar({ composicion: e.target.value })}
              />
              <datalist id="fm-comps">
                {opciones.composiciones.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <span className="fm-nota">Tal como dice la etiqueta cosida. La pide la NOM-004.</span>
            </div>
            <div className="fm-campo">
              <label htmlFor="fm-cuid">
                Cuidados <small>(opcional)</small>
              </label>
              <textarea
                id="fm-cuid"
                className="fm-in"
                rows={2}
                value={forma.cuidados}
                onChange={(e) => cambiar({ cuidados: e.target.value })}
              />
            </div>
          </section>

          {editando && (
            <section className="adm-caja fm-peligro">
              <p>
                <b>Eliminar este modelo</b>
                Se borra con todos sus colores. Si solo quieres dejar de venderlo un tiempo, mejor apaga
                «Publicado».
              </p>
              <button type="button" onClick={eliminar} disabled={guardando}>
                Eliminar modelo
              </button>
            </section>
          )}
        </div>

        <aside className="fm-lado">
          <section className="adm-caja">
            <h2 className="fm-tit">En la tienda</h2>
            <button
              type="button"
              className="fm-interruptor"
              aria-pressed={forma.activo}
              onClick={() => cambiar({ activo: !forma.activo })}
            >
              <span className="fm-int-txt">
                <b>Publicado</b>
                <small>{forma.activo ? 'Se ve en la tienda.' : 'Oculto: nadie lo ve.'}</small>
              </span>
              <span className={`adm-toggle${forma.activo ? ' on' : ''}`}>
                <i />
              </span>
            </button>
            <button
              type="button"
              className="fm-interruptor"
              aria-pressed={forma.destacado}
              onClick={() => cambiar({ destacado: !forma.destacado })}
            >
              <span className="fm-int-txt">
                <b>Destacado</b>
                <small>{forma.destacado ? 'Sale en el inicio.' : 'No sale en el inicio.'}</small>
              </span>
              <span className={`adm-toggle${forma.destacado ? ' on' : ''}`}>
                <i />
              </span>
            </button>
          </section>

          <section className="adm-caja">
            <p className="fm-vista-etq">Así se verá en el catálogo</p>
            <div className="fm-vista" inert>
              <TarjetaProducto p={vista} />
            </div>
          </section>
        </aside>
      </div>

      <div className="fm-barra">
        <p className={`fm-estado ${estado.cls}`} role="status">
          {estado.txt}
        </p>
        {editando && sucio && !guardando && (
          <button type="button" className="btn btn-out" onClick={descartar}>
            Descartar
          </button>
        )}
        <button
          type="button"
          className="btn btn-pri"
          onClick={guardar}
          disabled={guardando || yendo || subiendo || (editando && !sucio)}
        >
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear modelo'}
        </button>
      </div>
    </div>
  )
}
