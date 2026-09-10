'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export interface PermisoModulo {
  moduloNombre: string
  puedeVer: boolean
  puedeCrear: boolean
  puedeEditar: boolean
  puedeEliminar: boolean
}

export type AccionPermiso = 'ver' | 'crear' | 'editar' | 'eliminar'

export function usePermissions() {
  const [role, setRole] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Record<string, PermisoModulo>>({})
  const [loading, setLoading] = useState<boolean>(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchUserPermissions() {
      try {
        setLoading(true)

        // 1. Obtener usuario autenticado actual
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // 2. Obtener el rol del usuario desde public.usuarios
        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single()

        if (!usuarioData?.rol) {
          setLoading(false)
          return
        }

        const userRol = usuarioData.rol
        setRole(userRol)

        // Si es Administrador, tiene permiso total por defecto
        if (userRol === 'Administrador') {
          setLoading(false)
          return
        }

        // 3. Cargar la matriz de permisos para su rol uniendo con public.modulos
        const { data: permisosData, error } = await supabase
          .from('permisos_roles')
          .select(`
            puede_ver,
            puede_crear,
            puede_editar,
            puede_eliminar,
            modulos!inner (
              nombre
            )
          `)
          .eq('rol', userRol)

        if (error) throw error

        // Mapear los permisos usando el nombre del módulo como clave para acceso directo O(1)
        const mapaPermisos: Record<string, PermisoModulo> = {}

        permisosData?.forEach((item: any) => {
          const nombreModulo = item.modulos?.nombre
          if (nombreModulo) {
            mapaPermisos[nombreModulo] = {
              moduloNombre: nombreModulo,
              puedeVer: Boolean(item.puede_ver),
              puedeCrear: Boolean(item.puede_crear),
              puedeEditar: Boolean(item.puede_editar),
              puedeEliminar: Boolean(item.puede_eliminar),
            }
          }
        })

        setPermissions(mapaPermisos)
      } catch (err) {
        console.error('Error cargando los permisos del usuario:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPermissions()
  }, [])

  // Función principal para evaluar un permiso
  const can = useCallback(
    (moduloNombre: string, accion: AccionPermiso): boolean => {
      // El Administrador siempre tiene acceso total
      if (role === 'Administrador') return true

      const perm = permissions[moduloNombre]
      if (!perm) return false

      switch (accion) {
        case 'ver':
          return perm.puedeVer
        case 'crear':
          return perm.puedeCrear
        case 'editar':
          return perm.puedeEditar
        case 'eliminar':
          return perm.puedeEliminar
        default:
          return false
      }
    },
    [role, permissions]
  )

  return {
    role,
    loading,
    isAdmin: role === 'Administrador',
    can,
    puedeVer: (modulo: string) => can(modulo, 'ver'),
    puedeCrear: (modulo: string) => can(modulo, 'crear'),
    puedeEditar: (modulo: string) => can(modulo, 'editar'),
    puedeEliminar: (modulo: string) => can(modulo, 'eliminar'),
  }
}