'use client'

import { useEffect, useState, useTransition } from 'react'
import { RolValido } from '../actions/userActions'
import { Usuario } from '../schemas'

// Componentes UI de shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, User, Phone, Mail, ShieldCheck, Save } from 'lucide-react'

const ROLES_LISTA: RolValido[] = [
  'Administrador',
  'Veterinario',
  'Ordeñador',
  'Obrero',
  'Potreros',
  'Trabajador',
]

interface UsuarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: Usuario | null
}

export default function UsuarioModal({ open, onOpenChange, usuario }: UsuarioModalProps) {
  const [isPending, startTransition] = useTransition()

  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState<RolValido>('Trabajador')

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '')
      setApellidos(usuario.apellidos || '')
      setTelefono(usuario.telefono || '')
      setEmail(usuario.email || '')
      setRol(usuario.rol || 'Trabajador')
    } else {
      setNombre('')
      setApellidos('')
      setTelefono('')
      setEmail('')
      setRol('Trabajador')
    }
  }, [usuario, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      toast.error('El nombre del usuario es obligatorio')
      return
    }

    startTransition(async () => {
      const payload = {
        id: usuario?.id,
        nombre: nombre.trim(),
        apellidos: apellidos.trim() || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        rol,
      }

    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {usuario ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {usuario
                ? 'Modifica la información general y el rol asignado a este trabajador.'
                : 'Diligencia los datos para dar de alta a un nuevo miembro del personal.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-xs font-semibold">
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej. Juan"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apellidos" className="text-xs font-semibold">
                  Apellidos
                </Label>
                <Input
                  id="apellidos"
                  placeholder="Ej. Pérez"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Teléfono y Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="telefono" className="text-xs font-semibold flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" /> Teléfono
                </Label>
                <Input
                  id="telefono"
                  placeholder="Ej. 3101234567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Rol Asignado */}
            <div className="space-y-1.5">
              <Label htmlFor="rol" className="text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-muted-foreground" /> Rol Asignado *
              </Label>
              <Select value={rol} onValueChange={(val) => setRol(val as RolValido)}>
                <SelectTrigger className="h-9 text-xs font-medium">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES_LISTA.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="h-9 text-xs gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {usuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}