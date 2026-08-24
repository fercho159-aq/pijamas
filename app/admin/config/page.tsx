import { redirect } from 'next/navigation'
import { haySesion } from '@/lib/auth'
import { getConfig } from '@/lib/datos'
import FormaConfig from '@/components/admin/FormaConfig'

export default async function Config() {
  if (!(await haySesion())) redirect('/admin/entrar')
  const config = await getConfig()
  return (
    <>
      <h1 className="adm-h1">Configuración</h1>
      <FormaConfig config={config} />
    </>
  )
}
