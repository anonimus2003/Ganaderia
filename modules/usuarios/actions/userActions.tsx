// @/modules/usuarios/actions/userActions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Lista de respaldo por si la tabla 'modulos' en Supabase está vacía o no existe
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

    // Consulta a Supabase / DB
    const { data: modulos, error: errModulos } = await supabase.from('modulos').select('*')
    const { data: permisos, error: errPermisos } = await supabase.from('permisos_rol').select('*')

    // Si hay error o la tabla de módulos viene vacía, usamos el respaldo base
    const modulosFinales = (modulos && modulos.length > 0) ? modulos : MODULOS_SISTEMA_BASE

    return {
      success: true,
      modulos: modulosFinales,
      permisos: permisos || []
    }
  } catch (error) {
    console.error('Error al obtener matriz de permisos:', error)
    // En caso de catch crítico, retornamos al menos los módulos base para que pinte la tabla
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

    // Usamos upsert para actualizar o insertar dependiendo de si ya existe la llave (rol + modulo_id)
    // Asegúrate de tener un UNIQUE constraint en tu tabla de Supabase para (rol, modulo_id)
    const { error } = await supabase
      .from('permisos_roles')
      .upsert(nuevosPermisos, { onConflict: 'rol,modulo_id' })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/usuarios') // Ajusta la ruta de tu página si es diferente
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