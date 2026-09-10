import { z } from 'zod'

// 1. Roles válidos en el sistema
export const ROLES_LISTA = [
  'Administrador',
  'Veterinario',
  'Ordeñador',
  'Obrero',
  'Potreros',
  'Trabajador',
] as const

export type RolValido = (typeof ROLES_LISTA)[number]

// 2. Interfaz y Schema de Usuario (utilizado por useUsuarios.ts y UsuariosTable.tsx)
export interface Usuario {
  id: string
  nombre: string
  apellidos?: string | null
  telefono?: string | null
  email?: string | null
  rol: RolValido
  creado_en?: string
  actualizado_en?: string | null
}

export const usuarioSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .trim(),
  apellidos: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  telefono: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  email: z
    .string()
    .trim()
    .email('Correo electrónico no válido')
    .or(z.literal(''))
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  rol: z.enum(ROLES_LISTA, {
    errorMap: () => ({ message: 'Selecciona un rol válido' }),
  }),
})

// 3. Interfaz y Schema de Módulo (utilizado por MatrizPermisos.tsx)
export interface Modulo {
  id: string
  nombre: string
  etiqueta: string
  categoria: string
}

export const moduloSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  etiqueta: z.string(),
  categoria: z.string(),
})

// 4. Interfaz y Schema de PermisoRol (utilizado por MatrizPermisos.tsx)
export interface PermisoRol {
  id?: string
  rol: RolValido
  modulo_id: string
  puede_ver: boolean
  puede_crear: boolean
  puede_editar: boolean
  puede_eliminar: boolean
}

export const permisoRolSchema = z.object({
  id: z.string().uuid().optional(),
  rol: z.enum(ROLES_LISTA),
  modulo_id: z.string().uuid(),
  puede_ver: z.boolean(),
  puede_crear: z.boolean(),
  puede_editar: z.boolean(),
  puede_eliminar: z.boolean(),
})

// Tipos inferidos de Zod (opcionales para formularios)
export type UsuarioFormValues = z.infer<typeof usuarioSchema>
export type PermisoRolFormValues = z.infer<typeof permisoRolSchema>