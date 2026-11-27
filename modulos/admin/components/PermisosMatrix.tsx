"use client"

import * as React from "react"
import { toast } from "sonner"
import type { ModuloSistema } from "@/lib/permisos"
import { guardarPermisoUsuarioAction } from "../actions/permisos-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export interface UsuarioOption {
  id: string
  nombre: string
  email: string
  rol?: string | null
}

export interface PermisoRow {
  user_id: string
  modulo: ModuloSistema
  puede_ver: boolean
  puede_crear: boolean
  puede_editar: boolean
  puede_eliminar: boolean
}

const MODULOS_SISTEMA: { key: ModuloSistema; label: string; descripcion: string }[] = [
  { key: "inventario", label: "Inventario", descripcion: "Registro y gestión de bovinos" },
  { key: "ordeno", label: "Ordeño", descripcion: "Control de producción lechera" },
  { key: "potreros", label: "Potreros", descripcion: "Mapa, pastoreo y ocupaciones" },
  { key: "medicamentos", label: "Medicamentos", descripcion: "Tratamientos y tiempos de retiro" },
  { key: "reproduccion", label: "Reproducción", descripcion: "Servicios, palpaciones y partos" },
  { key: "finanzas", label: "Finanzas", descripcion: "Ingresos, egresos y reportes" },
  { key: "pesajes", label: "Pesajes", descripcion: "Pesaje animales" },
]

export function PermisosMatrix({
  usuarios,
  permisosIniciales,
}: {
  usuarios: UsuarioOption[]
  permisosIniciales: PermisoRow[]
}) {
  const [selectedUserId, setSelectedUserId] = React.useState<string>(
    usuarios[0]?.id ?? ""
  )
  const [permisos, setPermisos] = React.useState<PermisoRow[]>(permisosIniciales)
  const [savingKey, setSavingKey] = React.useState<string | null>(null)

  const usuarioActual = React.useMemo(
    () => usuarios.find((u) => u.id === selectedUserId),
    [usuarios, selectedUserId]
  )

  const getPermisoModulo = React.useCallback(
    (modulo: ModuloSistema): PermisoRow => {
      const found = permisos.find(
        (p) => p.user_id === selectedUserId && p.modulo === modulo
      )
      return (
        found ?? {
          user_id: selectedUserId,
          modulo,
          puede_ver: false,
          puede_crear: false,
          puede_editar: false,
          puede_eliminar: false,
        }
      )
    },
    [permisos, selectedUserId]
  )

  async function handleToggle(
    modulo: ModuloSistema,
    campo: "puede_ver" | "puede_crear" | "puede_editar" | "puede_eliminar",
    checked: boolean
  ) {
    if (!selectedUserId) return

    const actual = getPermisoModulo(modulo)
    const actualizado: PermisoRow = {
      ...actual,
      [campo]: checked,
    }

    // Regla lógica: si se activa crear/editar/eliminar, activar "ver"; si se quita "ver", quitar todo
    if (campo !== "puede_ver" && checked) {
      actualizado.puede_ver = true
    }
    if (campo === "puede_ver" && !checked) {
      actualizado.puede_crear = false
      actualizado.puede_editar = false
      actualizado.puede_eliminar = false
    }

    // Actualización optimista en UI
    setPermisos((prev) => {
      const others = prev.filter(
        (p) => !(p.user_id === selectedUserId && p.modulo === modulo)
      )
      return [...others, actualizado]
    })

    const key = `${selectedUserId}-${modulo}`
    setSavingKey(key)

    const res = await guardarPermisoUsuarioAction(actualizado)
    setSavingKey(null)

    if (!res.ok) {
      toast.error(res.error ?? "Error al guardar permiso")
      setPermisos(permisosIniciales)
      return
    }

    toast.success(`Permisos actualizados para ${modulo}`)
  }

  if (!usuarios.length) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No hay usuarios registrados en la tabla de perfiles.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:max-w-md">
        <Label htmlFor="select-usuario">Seleccionar usuario</Label>
        <Select
          value={selectedUserId}
          onValueChange={(value) => value && setSelectedUserId(value)}
          items={usuarios.map((u) => ({
            label: `${u.nombre} (${u.email})`,
            value: u.id,
          }))}
        >
          <SelectTrigger id="select-usuario" className="w-full">
            <SelectValue placeholder="Selecciona un usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre} — {u.email}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {usuarioActual?.rol && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Rol base: <Badge variant="outline">{usuarioActual.rol}</Badge>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Módulo</TableHead>
              <TableHead className="w-24 text-center">Ver</TableHead>
              <TableHead className="w-24 text-center">Crear</TableHead>
              <TableHead className="w-24 text-center">Editar</TableHead>
              <TableHead className="w-24 text-center">Eliminar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODULOS_SISTEMA.map((mod) => {
              const perm = getPermisoModulo(mod.key)
              const isSaving = savingKey === `${selectedUserId}-${mod.key}`

              return (
                <TableRow key={mod.key} className={isSaving ? "opacity-70" : ""}>
                  <TableCell>
                    <div className="font-medium">{mod.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {mod.descripcion}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm.puede_ver}
                      onCheckedChange={(v) =>
                        handleToggle(mod.key, "puede_ver", !!v)
                      }
                      aria-label={`Ver ${mod.label}`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm.puede_crear}
                      onCheckedChange={(v) =>
                        handleToggle(mod.key, "puede_crear", !!v)
                      }
                      aria-label={`Crear en ${mod.label}`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm.puede_editar}
                      onCheckedChange={(v) =>
                        handleToggle(mod.key, "puede_editar", !!v)
                      }
                      aria-label={`Editar en ${mod.label}`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm.puede_eliminar}
                      onCheckedChange={(v) =>
                        handleToggle(mod.key, "puede_eliminar", !!v)
                      }
                      aria-label={`Eliminar en ${mod.label}`}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}