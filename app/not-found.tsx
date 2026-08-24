import Link from 'next/link'

export default function NoEncontrado() {
  return (
    <div className="vacio">
      <h2>No encontramos esa página</h2>
      <p>Puede que el modelo ya no esté disponible o que la dirección esté mal escrita.</p>
      <Link className="btn btn-pri" href="/">Ir al inicio</Link>
    </div>
  )
}
