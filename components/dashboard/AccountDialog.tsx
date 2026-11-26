"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface AccountProfilePayload {
  id: string
  nombre: string
  apellidos: string
  telefono: string
  rol: string
  email: string
  fullName: string
}

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id?: string
    nombre?: string
    apellidos?: string
    telefono?: string
    rol?: string
    email?: string
  }
  onSaved?: (updated: AccountProfilePayload) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "US"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function formatRolLabel(rolValue: string) {
  const normalized = rolValue.trim().toLowerCase()
  if (normalized === "admin" || normalized === "administrador") {
    return "Administrador"
  }
  if (normalized === "trabajador") {
    return "Trabajador"
  }
  return rolValue.trim() || "Trabajador"
}

export function AccountDialog({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: AccountDialogProps) {
  const supabase = createClient()

  const [userId, setUserId] = useState(initialData?.id ?? "")
  const [email, setEmail] = useState(initialData?.email ?? "")
  const [nombre, setNombre] = useState(initialData?.nombre ?? "")
  const [apellidos, setApellidos] = useState(initialData?.apellidos ?? "")
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "")
  const [rol, setRol] = useState(initialData?.rol || "Trabajador")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    let active = true

    setUserId(initialData?.id ?? "")
    setEmail(initialData?.email ?? "")
    setNombre(initialData?.nombre ?? "")
    setApellidos(initialData?.apellidos ?? "")
    setTelefono(initialData?.telefono ?? "")
    setRol(initialData?.rol || "Trabajador")

    async function hydrateFromSupabase() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !active) return

      const meta = user.user_metadata ?? {}
      const appMeta = user.app_metadata ?? {}

      let nextNombre =
        initialData?.nombre?.trim() ||
        (typeof meta.nombre === "string" ? meta.nombre.trim() : "")
      let nextApellidos =
        initialData?.apellidos?.trim() ||
        (typeof meta.apellidos === "string" ? meta.apellidos.trim() : "")
      let nextTelefono =
        initialData?.telefono?.trim() ||
        (typeof meta.telefono === "string" ? meta.telefono.trim() : "")
      let nextRol =
        initialData?.rol?.trim() ||
        (typeof appMeta.role === "string" && appMeta.role.trim()
          ? appMeta.role.trim()
          : typeof meta.rol === "string" && meta.rol.trim()
            ? meta.rol.trim()
            : "Trabajador")

      const { data: perfil, error } = await supabase
        .from("perfiles")
        .select("nombre, apellidos, telefono, rol, email")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Error consultando perfil:", error.message)
      }

      if (perfil && active) {
        nextNombre = perfil.nombre?.trim() || nextNombre
        nextApellidos = perfil.apellidos?.trim() || nextApellidos
        nextTelefono = perfil.telefono?.trim() || nextTelefono
        nextRol = perfil.rol?.trim() || nextRol
      }

      if (!active) return

      setUserId(user.id)
      setEmail(user.email ?? initialData?.email ?? "")
      setNombre(nextNombre)
      setApellidos(nextApellidos)
      setTelefono(nextTelefono)
      setRol(nextRol)
    }

    void hydrateFromSupabase()

    return () => {
      active = false
    }
  }, [open, initialData, supabase])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    let currentId = userId
    let currentEmail = email

    if (!currentId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("No se encontró una sesión activa")
        return
      }
      currentId = user.id
      currentEmail = user.email ?? ""
    }

    setSaving(true)

    const cleanNombre = nombre.trim() || "Nuevo"
    const cleanApellidos = apellidos.trim() || "Usuario"
    const cleanTelefono = telefono.trim()
    const currentRol = rol.trim() || "Trabajador"
    const fullName = `${cleanNombre} ${cleanApellidos}`.trim()

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        nombre: cleanNombre,
        apellidos: cleanApellidos,
        telefono: cleanTelefono,
        full_name: fullName,
      },
    })

    if (authError) {
      setSaving(false)
      toast.error(authError.message || "No se pudo actualizar la sesión")
      return
    }

    const { error: perfilError } = await supabase
      .from("perfiles")
      .upsert(
        {
          id: currentId,
          email: currentEmail || null,
          nombre: cleanNombre,
          apellidos: cleanApellidos,
          telefono: cleanTelefono || null,
          rol: currentRol,
        },
        { onConflict: "id" }
      )

    if (perfilError) {
      setSaving(false)
      console.error("Error guardando en public.perfiles:", perfilError)
      toast.error(`No se guardó en perfiles: ${perfilError.message}`)
      return
    }

    setSaving(false)
    toast.success("Datos de cuenta guardados correctamente")

    onSaved?.({
      id: currentId,
      nombre: cleanNombre,
      apellidos: cleanApellidos,
      telefono: cleanTelefono,
      rol: currentRol,
      email: currentEmail,
      fullName,
    })

    onOpenChange(false)
  }

  const displayName =
    [nombre, apellidos].filter(Boolean).join(" ") ||
    (email ? email.split("@")[0] : "Usuario")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Información de la cuenta</DialogTitle>
          <DialogDescription>
            Datos de la persona que tiene la sesión iniciada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
          <Avatar className="size-12 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            {telefono && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Tel: {telefono}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="account-dialog-nombre">Nombre</Label>
              <Input
                id="account-dialog-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                disabled={saving}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-dialog-apellidos">Apellidos</Label>
              <Input
                id="account-dialog-apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Apellidos"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="account-dialog-telefono">Teléfono</Label>
              <Input
                id="account-dialog-telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 312 000 0000"
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-dialog-rol">Rol</Label>
              <Input
                id="account-dialog-rol"
                value={formatRolLabel(rol)}
                disabled
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-dialog-email">Correo electrónico</Label>
            <Input id="account-dialog-email" value={email} disabled />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cerrar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}