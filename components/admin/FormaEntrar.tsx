'use client'

import { useActionState } from 'react'
import { entrar } from '@/lib/acciones'

export default function FormaEntrar() {
  const [estado, accion, pendiente] = useActionState(entrar, null)
  return (
    <form action={accion}>
      <div className="campo">
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" name="clave" type="password" autoComplete="current-password" autoFocus />
      </div>
      {estado && !estado.ok && <p className="adm-error">{estado.mensaje}</p>}
      <button className="btn btn-pri btn-full" disabled={pendiente}>
        {pendiente ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
