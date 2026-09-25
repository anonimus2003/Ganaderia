// @/modules/usuarios/actions/userActions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Lista de respaldo en caso de que la tabla 'modulos' esté vacía
// NOTA: Para producción es ideal que la tabla 'modulos' en Supabase tenga estos registros creados con sus UUIDs
const MODULOS_SISTEMA_BASE = [
  { id: 'inventario', nombre: 'inventario', etiqueta: 'Ganado e Inventario', categoria: 'General' },
  { id: 'ordeno', nombre: 'ordeno', etiqueta: 'Control de Ordeño', categoria: 'Producción' },
  { id: 'pesaje', nombre: 'pesaje', etiqueta: 'Control de Pesaje', categoria: 'Producción' },
  { id: 'potreros', nombre: 'potreros', etiqueta: 'Rotación de Potreros', categoria: 'Campo' },
  { id: 'salud', nombre: 'salud', etiqueta: 'Salud y Vacunas', categoria: 'Sanidad' },
  { id: 'reproduccion', nombre: 'reproduccion', etiqueta: 'Reproducción', categoria: 'Sanidad' },
  { id: 'mantenimiento', nombre: 'mantenimiento', etiqueta: 'Mantenimiento', categoria: 'Operaciones' },
  { id: 'usuarios', nombre: 'usuarios', etiqueta: 'Gestión de Usuarios', categoria: 'Sistema' },
]

export type RolValido = 'Administrador' | 'Veterinario' | 'Ordeñador' | 'Obrero' | 'Potreros' | 'Trabajador'

export interface PermisoRolPayload {
  id?: string
  rol: RolValido
  modulo_id: string
  puede_ver: boolean
  puede_crear: boolean
  puede_editar: boolean
  puede_eliminar: boolean
}

// 1. Obtener la data para la matriz de permisos y el directorio
export async function getMatrizPermisosData() {
  try {
    const supabase = await createClient()

    // 1. Consultar módulos y permisos a la tabla 'permisos_roles' (plural)
    const { data: modulos, error: errModulos } = await supabase.from('modulos').select('*')
    const { data: permisos, error: errPermisos } = await supabase.from('permisos_roles').select('*')

    if (errModulos) console.error('Error al consultar módulos:', errModulos.message)
    if (errPermisos) console.error('Error al consultar permisos:', errPermisos.message)

    const modulosFinales = (modulos && modulos.length > 0) ? modulos : MODULOS_SISTEMA_BASE

    return {
      success: true,
      modulos: modulosFinales,
      permisos: permisos || []
    }
  } catch (error) {
    console.error('Error crítico al obtener matriz de permisos:', error)
    return { 
      success: false, 
      modulos: MODULOS_SISTEMA_BASE, 
      permisos: [] 
    }
  }
}

// 2. Obtener la lista de usuarios
export async function getUsuarios() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('usuarios').select('*')

    if (error) {
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, data: [], error: error.message }
  }
}

// 3. Guardar o actualizar la matriz de permisos masivamente
export async function guardarMatrizPermisos(nuevosPermisos: PermisoRolPayload[]) {
  try {
    const supabase = await createClient()

    // Limpiamos los IDs antes de hacer upsert si son ficticios o vacíos
    const payloadLimpio = nuevosPermisos.map(p => {
      const objeto: any = {
        rol: p.rol,
        modulo_id: p.modulo_id,
        puede_ver: p.puede_ver,
        puede_crear: p.puede_crear,
        puede_editar: p.puede_editar,
        puede_eliminar: p.puede_eliminar,
      }
      // Solo incluimos el id si existe y es un UUID válido
      if (p.id && p.id.length > 20) {
        objeto.id = p.id
      }
      return objeto
    })

    // Upsert aprovechando la restricción UNIQUE 'rol_modulo_unique' (rol, modulo_id)
    const { error } = await supabase
      .from('permisos_roles')
      .upsert(payloadLimpio, { onConflict: 'rol,modulo_id' })

    if (error) {
      console.error('Error al guardar matriz de permisos:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 4. Cambiar rol de un usuario individual
export async function cambiarRolUsuario(userId: string, nuevoRol: RolValido) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}