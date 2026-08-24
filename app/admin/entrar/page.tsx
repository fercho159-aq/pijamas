import { redirect } from 'next/navigation'
import { haySesion } from '@/lib/auth'
import FormaEntrar from '@/components/admin/FormaEntrar'

export default async function Entrar() {
  if (await haySesion()) redirect('/admin')
  return (
    <div className="adm-entrar">
      <h1>Panel de Rossy Lady</h1>
      <p>Entra con la contraseña del panel.</p>
      <FormaEntrar />
    </div>
  )
}
