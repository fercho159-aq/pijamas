type Opciones = { avisar?: (m: string) => void }

export function prepararBase(
  consultar: (texto: string, params?: unknown[]) => Promise<{ rows: any[] }>,
  ejecutar: (script: string) => Promise<unknown>,
  opciones?: Opciones
): Promise<{ importados: number }>

export function prepararNeon(url: string, opciones?: Opciones): Promise<{ importados: number }>
