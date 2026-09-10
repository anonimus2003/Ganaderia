'use client'

import { useState, useTransition } from 'react'
import { cambiarRolUsuario } from '../actions/userActions'
import { Usuario, ROLES_LISTA, RolValido } from '../schemas'

// Componentes UI de shadcn
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Phone, Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Re-exportamos Usuario por si algún componente antiguo lo importa desde aquí
export type { Usuario }

// 1. Célula independiente para selector de Rol
export function RolCell({ usuario }: { usuario: Usuario }) {
  const [isPending, startTransition] = useTransition()
  const [rolActual, setRolActual] = useState<RolValido>(usuario.rol)

  const handleRolChange = (nuevoRol: RolValido) => {
    const rolAnterior = rolActual
    setRolActual(nuevoRol)

    startTransition(async () => {
      const res = await cambiarRolUsuario(usuario.id, nuevoRol)
      if (res.success) {
        toast.success(`Rol de ${usuario.nombre} actualizado a "${nuevoRol}"`)
      } else {
        setRolActual(rolAnterior)
        toast.error(res.error || 'Error al actualizar el rol')
      }
    })
  }

  const badgeColor = {
    Administrador: 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
    Veterinario: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    Ordeñador: 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    Obrero: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    Potreros: 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    Trabajador: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  }[rolActual]

  return (
    <Select
      value={rolActual}
      onValueChange={(val) => handleRolChange(val as RolValido)}
      disabled={isPending}
    >
      <SelectTrigger className={`h-8 text-xs font-semibold w-[140px] border ${badgeColor}`}>
        {isPending ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Guardando...</span>
          </div>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {ROLES_LISTA.map((rol) => (
          <SelectItem key={rol} value={rol} className="text-xs font-medium">
            {rol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// 2. Célula para el Usuario (Avatar + Nombre + Email)
export function UsuarioCell({ usuario }: { usuario: Usuario }) {
  const nombreCompleto = `${usuario.nombre} ${usuario.apellidos || ''}`.trim()
  const iniciales = `${usuario.nombre?.[0] || ''}${usuario.apellidos?.[0] || ''}`.toUpperCase() || 'U'

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 border border-border">
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
          {iniciales}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-foreground">{nombreCompleto}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3 inline" />
          {usuario.email || 'Sin correo'}
        </span>
      </div>
    </div>
  )
}

// 3. Célula para Acciones
export function AccionesCell({ usuario, onEdit }: { usuario: Usuario; onEdit: (u: Usuario) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors outline-none focus:ring-1 focus:ring-ring">
        <span className="sr-only">Abrir menú</span>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Gestión</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onEdit(usuario)}
          className="gap-2 cursor-pointer text-xs font-medium"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar Usuario
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}