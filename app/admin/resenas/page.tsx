import { redirect } from 'next/navigation'
import { haySesion } from '@/lib/auth'
import { getResenas, resenasSonEjemplo, promedio } from '@/lib/resenas'
import { getProductos } from '@/lib/datos'

export default async function AdminResenas() {
  if (!(await haySesion())) redirect('/admin/entrar')
  const [rs, productos] = await Promise.all([getResenas(), getProductos()])
  const nombre = (n: number) => productos.find((p) => p.numero === n)?.nombre ?? `#${n}`

  return (
    <>
      <div className="adm-cabecera">
        <h1 className="adm-h1">Reseñas</h1>
        {rs.length > 0 && (
          <span className="adm-conteo">
            {rs.length} publicadas · promedio {promedio(rs).toFixed(1)}
          </span>
        )}
      </div>

      <div className="adm-caja" style={{ marginBottom: 18 }}>
        <h2>Cómo funcionan</h2>
        <p className="adm-pista" style={{ marginTop: 0 }}>
          En la base, <code>resenas.pedido_id</code> es <b>NOT NULL</b> con llave foránea a
          <code> pedidos</code>. Es imposible insertar una reseña que no venga de una compra real,
          incluso desde aquí. No es una política: es una restricción de la base de datos, y por eso
          la insignia de «compra verificada» se puede sostener.
        </p>
        <p className="adm-pista">
          A los 3 días de marcar un pedido como entregado se manda por WhatsApp un enlace único para
          reseñar. Lo que llegue aparece en esta cola para aprobarse.
        </p>
        <p className="adm-pista">
          Publica también las de 3 y 4 estrellas. Un catálogo con puro cinco estrellas se lee como
          falso y convierte peor que uno con críticas reales respondidas.
        </p>
      </div>

      {resenasSonEjemplo && (
        <p className="adm-aviso">
          Estas son reseñas de ejemplo del modo demostración. Al conectar Supabase desaparecen y solo
          quedan las reales.
        </p>
      )}

      {rs.length === 0 ? (
        <p className="adm-vacio">
          Todavía no hay reseñas. Llegarán solas conforme se marquen pedidos como entregados.
        </p>
      ) : (
        <div className="adm-scroll">
          <table className="adm-tabla">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Cliente</th>
                <th>Estrellas</th>
                <th>Comentario</th>
                <th>Ajuste</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rs.map((r, i) => (
                <tr key={i}>
                  <td>
                    <b>{nombre(r.modelo)}</b>
                    <span className="adm-sub">#{r.modelo}</span>
                  </td>
                  <td>
                    {r.nombre}
                    <span className="adm-sub">{r.ciudad}</span>
                  </td>
                  <td className="num">
                    <span className={r.estrellas <= 3 ? 'adm-ambar' : ''}>{r.estrellas} ★</span>
                  </td>
                  <td className="adm-texto">{r.texto}</td>
                  <td className="adm-sub">
                    {r.estatura ? `${(r.estatura / 100).toFixed(2)} m · ${r.talla}` : '—'}
                  </td>
                  <td className="num adm-sub">{r.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
