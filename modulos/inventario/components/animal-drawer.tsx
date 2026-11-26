"use client"

import * as React from "react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export const bovinoSchema = z.object({
  id: z.string().uuid(),
  arete: z.string().min(1, "El arete es obligatorio"),
  nombre: z.string().nullable().optional(),
  raza: z.string().min(1, "La raza es obligatoria"),
  genero: z.enum(["Macho", "Hembra"]),
  fecha_nacimiento: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  registrado_por: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
  condicion: z.enum(["Activo", "Inactivo"]),
  motivo_baja: z
    .enum([
      "Venta",
      "Muerte",
      "Sacrificio / Consumo",
      "Descarte por infertilidad",
      "Robo / Pérdida",
    ])
    .nullable()
    .optional(),
  observacion_baja: z.string().nullable().optional(),
  proposito: z.string().nullable().optional(),
  madre_id: z.string().uuid().nullable().optional(),
  padre_id: z.string().uuid().nullable().optional(),
  fecha_baja: z.string().nullable().optional(),
  origen: z.string().nullable().optional(),
  categoria: z.string().nullable().optional(),
})

export type Bovino = z.infer<typeof bovinoSchema>
export type BovinoPayload = Omit<Bovino, "id" | "created_at" | "registrado_por">
export type BovinoDrawerMode = "create" | "view" | "edit" | "filter" | null

export interface BovinoFilterState {
  search: string
  condicion: string
  genero: string
  raza: string
  categoria: string
  proposito: string
}

const GENERO_OPTIONS = [
  { label: "Hembra", value: "Hembra" },
  { label: "Macho", value: "Macho" },
]

const CONDICION_OPTIONS = [
  { label: "Activo", value: "Activo" },
  { label: "Inactivo", value: "Inactivo" },
]

const MOTIVO_BAJA_OPTIONS = [
  { label: "Venta", value: "Venta" },
  { label: "Muerte", value: "Muerte" },
  { label: "Sacrificio / Consumo", value: "Sacrificio / Consumo" },
  { label: "Descarte por infertilidad", value: "Descarte por infertilidad" },
  { label: "Robo / Pérdida", value: "Robo / Pérdida" },
]

const PROPOSITO_OPTIONS = [
  { label: "Doble Propósito", value: "Doble Propósito" },
  { label: "Lechería", value: "Lechería" },
  { label: "Cría / Carne", value: "Cría / Carne" },
  { label: "Reproducción", value: "Reproducción" },
]

const CATEGORIA_OPTIONS = [
  { label: "Ternero / Ternera", value: "Ternero" },
  { label: "Novillo / Novilla", value: "Novilla" },
  { label: "Vaca en producción", value: "Vaca en producción" },
  { label: "Vaca seca", value: "Vaca seca" },
  { label: "Toro reproductor", value: "Toro reproductor" },
]

const ORIGEN_OPTIONS = [
  { label: "Nacimiento en finca", value: "Nacimiento en finca" },
  { label: "Compra", value: "Compra" },
  { label: "Traslado / Donación", value: "Traslado" },
]

const EMPTY_BOVINO: BovinoPayload = {
  arete: "",
  nombre: "",
  raza: "",
  genero: "Hembra",
  fecha_nacimiento: null,
  observaciones: "",
  condicion: "Activo",
  motivo_baja: null,
  observacion_baja: "",
  proposito: "Doble Propósito",
  madre_id: null,
  padre_id: null,
  fecha_baja: null,
  origen: "Nacimiento en finca",
  categoria: "",
}

interface BovinoDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: BovinoDrawerMode
  item: Bovino | null
  bovinosList: Bovino[]
  isSubmitting?: boolean
  onSave: (
    values: BovinoPayload,
    mode: "create" | "edit",
    existingId?: string
  ) => Promise<void> | void
  filters: BovinoFilterState
  onApplyFilters: (nextFilters: BovinoFilterState) => void
  onClearFilters: () => void
}

export function BovinoDrawer({
  open,
  onOpenChange,
  mode,
  item,
  bovinosList,
  isSubmitting = false,
  onSave,
  filters,
  onApplyFilters,
  onClearFilters,
}: BovinoDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"

  const [formValues, setFormValues] = React.useState<BovinoPayload>(EMPTY_BOVINO)
  const [draftFilters, setDraftFilters] = React.useState<BovinoFilterState>(filters)

  const posiblesMadres = React.useMemo(
    () =>
      bovinosList
        .filter((b) => b.genero === "Hembra" && b.id !== item?.id)
        .map((b) => ({
          label: `${b.arete}${b.nombre ? ` - ${b.nombre}` : ""}`,
          value: b.id,
        })),
    [bovinosList, item?.id]
  )

  const posiblesPadres = React.useMemo(
    () =>
      bovinosList
        .filter((b) => b.genero === "Macho" && b.id !== item?.id)
        .map((b) => ({
          label: `${b.arete}${b.nombre ? ` - ${b.nombre}` : ""}`,
          value: b.id,
        })),
    [bovinosList, item?.id]
  )

  React.useEffect(() => {
    if (!open) return

    if ((mode === "edit" || mode === "view") && item) {
      setFormValues({
        arete: item.arete,
        nombre: item.nombre ?? "",
        raza: item.raza,
        genero: item.genero,
        fecha_nacimiento: item.fecha_nacimiento ?? null,
        observaciones: item.observaciones ?? "",
        condicion: item.condicion,
        motivo_baja: item.motivo_baja ?? null,
        observacion_baja: item.observacion_baja ?? "",
        proposito: item.proposito ?? "Doble Propósito",
        madre_id: item.madre_id ?? null,
        padre_id: item.padre_id ?? null,
        fecha_baja: item.fecha_baja ?? null,
        origen: item.origen ?? "",
        categoria: item.categoria ?? "",
      })
    } else if (mode === "create") {
      setFormValues(EMPTY_BOVINO)
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
  }, [open, mode, item, filters])

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault()

    const cleanPayload: BovinoPayload = {
      ...formValues,
      arete: formValues.arete.trim(),
      nombre: formValues.nombre?.trim() ? formValues.nombre.trim() : null,
      raza: formValues.raza.trim(),
      fecha_nacimiento: formValues.fecha_nacimiento || null,
      observaciones: formValues.observaciones?.trim()
        ? formValues.observaciones.trim()
        : null,
      proposito: formValues.proposito || "Doble Propósito",
      madre_id: formValues.madre_id || null,
      padre_id: formValues.padre_id || null,
      origen: formValues.origen?.trim() ? formValues.origen.trim() : null,
      categoria: formValues.categoria?.trim() ? formValues.categoria.trim() : null,
      motivo_baja:
        formValues.condicion === "Inactivo" ? (formValues.motivo_baja ?? null) : null,
      fecha_baja:
        formValues.condicion === "Inactivo" ? (formValues.fecha_baja || null) : null,
      observacion_baja:
        formValues.condicion === "Inactivo" && formValues.observacion_baja?.trim()
          ? formValues.observacion_baja.trim()
          : null,
    }

    try {
      if (mode === "create") {
        await onSave(cleanPayload, "create")
        onOpenChange(false)
      } else if (mode === "edit" && item) {
        await onSave(cleanPayload, "edit", item.id)
        onOpenChange(false)
      }
    } catch {
      // El error ya se notifica con toast en handleSaveBovino
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    onApplyFilters(draftFilters)
    onOpenChange(false)
  }

  function handleResetFilters() {
    const empty: BovinoFilterState = {
      search: "",
      condicion: "ALL",
      genero: "ALL",
      raza: "",
      categoria: "",
      proposito: "ALL",
    }
    setDraftFilters(empty)
    onClearFilters()
    onOpenChange(false)
  }

  const drawerTitle =
    mode === "create"
      ? "Registrar nuevo bovino"
      : mode === "edit"
        ? `Editar bovino: ${item?.arete ?? ""}`
        : mode === "filter"
          ? "Filtrar bovinos"
          : `Ficha técnica: ${item?.arete ?? ""}${item?.nombre ? ` (${item.nombre})` : ""}`

  const drawerDescription =
    mode === "create"
      ? "Ingresa los datos generales, genealógicos y productivos del animal."
      : mode === "edit"
        ? "Modifica la información del animal en el inventario."
        : mode === "filter"
          ? "Filtra el inventario por arete, nombre, condición, género, raza o categoría."
          : "Consulta todos los campos registrados del animal."

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className={isMobile ? "max-h-[92vh]" : undefined}>
        {mode && (
          <>
            <DrawerHeader className="gap-1">
              <DrawerTitle>{drawerTitle}</DrawerTitle>
              <DrawerDescription>{drawerDescription}</DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
              {mode === "filter" ? (
                <form
                  id="bovino-filter-form"
                  onSubmit={handleFilterSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-search">Buscar (Arete o Nombre)</Label>
                    <Input
                      id="filter-search"
                      placeholder="Ej. 1042 o Lucero..."
                      value={draftFilters.search}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-condicion">Condición</Label>
                      <Select
                        value={draftFilters.condicion}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            condicion: value ?? "ALL",
                          }))
                        }
                        items={[
                          { label: "Todas", value: "ALL" },
                          ...CONDICION_OPTIONS,
                        ]}
                      >
                        <SelectTrigger id="filter-condicion" className="w-full">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todas</SelectItem>
                            {CONDICION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-genero">Género</Label>
                      <Select
                        value={draftFilters.genero}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            genero: value ?? "ALL",
                          }))
                        }
                        items={[{ label: "Todos", value: "ALL" }, ...GENERO_OPTIONS]}
                      >
                        <SelectTrigger id="filter-genero" className="w-full">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {GENERO_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-raza">Raza</Label>
                      <Input
                        id="filter-raza"
                        placeholder="Ej. Holstein, Gyrolando..."
                        value={draftFilters.raza}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            raza: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-categoria">Categoría</Label>
                      <Input
                        id="filter-categoria"
                        placeholder="Ej. Vaca en producción..."
                        value={draftFilters.categoria}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            categoria: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-proposito">Propósito</Label>
                    <Select
                      value={draftFilters.proposito}
                      onValueChange={(value) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          proposito: value ?? "ALL",
                        }))
                      }
                      items={[{ label: "Todos", value: "ALL" }, ...PROPOSITO_OPTIONS]}
                    >
                      <SelectTrigger id="filter-proposito" className="w-full">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="ALL">Todos</SelectItem>
                          {PROPOSITO_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              ) : (
                <form
                  id="bovino-record-form"
                  onSubmit={handleSaveSubmit}
                  className="flex flex-col gap-4"
                >
                  {/* BLOQUE 1: Identificación */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="arete">Arete *</Label>
                      <Input
                        id="arete"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. BOV-001"
                        value={formValues.arete}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            arete: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. Mariposa"
                        value={formValues.nombre ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            nombre: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="raza">Raza *</Label>
                      <Input
                        id="raza"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. Holstein / Gyrolando"
                        value={formValues.raza}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            raza: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="genero">Género *</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.genero}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            genero: (value as "Macho" | "Hembra") ?? "Hembra",
                          }))
                        }
                        items={GENERO_OPTIONS}
                      >
                        <SelectTrigger id="genero" className="w-full">
                          <SelectValue placeholder="Selecciona género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {GENERO_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* BLOQUE 2: Clasificación productiva */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                      <Input
                        id="fecha_nacimiento"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha_nacimiento ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha_nacimiento: e.target.value || null,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="categoria">Categoría</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.categoria || "NONE"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            categoria: value === "NONE" ? "" : (value ?? ""),
                          }))
                        }
                        items={[
                          { label: "Sin categoría", value: "NONE" },
                          ...CATEGORIA_OPTIONS,
                        ]}
                      >
                        <SelectTrigger id="categoria" className="w-full">
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="NONE">Sin categoría</SelectItem>
                            {CATEGORIA_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="proposito">Propósito</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.proposito ?? "Doble Propósito"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            proposito: value ?? "Doble Propósito",
                          }))
                        }
                        items={PROPOSITO_OPTIONS}
                      >
                        <SelectTrigger id="proposito" className="w-full">
                          <SelectValue placeholder="Selecciona propósito" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {PROPOSITO_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="origen">Origen</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.origen || "NONE"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            origen: value === "NONE" ? "" : (value ?? ""),
                          }))
                        }
                        items={[
                          { label: "No especificado", value: "NONE" },
                          ...ORIGEN_OPTIONS,
                        ]}
                      >
                        <SelectTrigger id="origen" className="w-full">
                          <SelectValue placeholder="Selecciona origen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="NONE">No especificado</SelectItem>
                            {ORIGEN_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* BLOQUE 3: Genealogía */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="madre_id">Madre</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.madre_id ?? "NONE"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            madre_id: value === "NONE" ? null : (value ?? null),
                          }))
                        }
                        items={[
                          { label: "Sin madre registrada", value: "NONE" },
                          ...posiblesMadres,
                        ]}
                      >
                        <SelectTrigger id="madre_id" className="w-full">
                          <SelectValue placeholder="Seleccionar madre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="NONE">Sin madre registrada</SelectItem>
                            {posiblesMadres.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="padre_id">Padre</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.padre_id ?? "NONE"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            padre_id: value === "NONE" ? null : (value ?? null),
                          }))
                        }
                        items={[
                          { label: "Sin padre registrado", value: "NONE" },
                          ...posiblesPadres,
                        ]}
                      >
                        <SelectTrigger id="padre_id" className="w-full">
                          <SelectValue placeholder="Seleccionar padre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="NONE">Sin padre registrado</SelectItem>
                            {posiblesPadres.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* BLOQUE 4: Estado / Condición y Baja */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="condicion">Condición *</Label>
                    <Select
                      disabled={isReadOnly || isSubmitting}
                      value={formValues.condicion}
                      onValueChange={(value) =>
                        setFormValues((prev) => ({
                          ...prev,
                          condicion:
                            (value as "Activo" | "Inactivo") ?? "Activo",
                        }))
                      }
                      items={CONDICION_OPTIONS}
                    >
                      <SelectTrigger id="condicion" className="w-full">
                        <SelectValue placeholder="Selecciona condición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {CONDICION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {formValues.condicion === "Inactivo" && (
                    <div className="grid grid-cols-2 gap-4 rounded-md border bg-muted/40 p-3">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="motivo_baja">Motivo de baja</Label>
                        <Select
                          disabled={isReadOnly || isSubmitting}
                          value={formValues.motivo_baja ?? "NONE"}
                          onValueChange={(value) =>
                            setFormValues((prev) => ({
                              ...prev,
                              motivo_baja:
                                value === "NONE"
                                  ? null
                                  : ((value as Bovino["motivo_baja"]) ?? null),
                            }))
                          }
                          items={[
                            { label: "Seleccionar motivo", value: "NONE" },
                            ...MOTIVO_BAJA_OPTIONS,
                          ]}
                        >
                          <SelectTrigger id="motivo_baja" className="w-full">
                            <SelectValue placeholder="Selecciona motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="NONE">Seleccionar motivo</SelectItem>
                              {MOTIVO_BAJA_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="fecha_baja">Fecha de baja</Label>
                        <Input
                          id="fecha_baja"
                          type="date"
                          disabled={isReadOnly || isSubmitting}
                          value={formValues.fecha_baja ?? ""}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              fecha_baja: e.target.value || null,
                            }))
                          }
                        />
                      </div>

                      <div className="col-span-2 flex flex-col gap-2">
                        <Label htmlFor="observacion_baja">Observación de baja</Label>
                        <Input
                          id="observacion_baja"
                          disabled={isReadOnly || isSubmitting}
                          placeholder="Detalle adicional sobre la baja..."
                          value={formValues.observacion_baja ?? ""}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              observacion_baja: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* BLOQUE 5: Observaciones generales */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Input
                      id="observaciones"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Notas clínicas, fenotipo, manejo..."
                      value={formValues.observaciones ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          observaciones: e.target.value,
                        }))
                      }
                    />
                  </div>
                </form>
              )}
            </div>

            <DrawerFooter className="gap-2">
              {mode === "filter" ? (
                <>
                  <Button type="submit" form="bovino-filter-form">
                    Aplicar filtros
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetFilters}
                  >
                    Limpiar filtros
                  </Button>
                </>
              ) : isReadOnly ? (
                <DrawerClose render={<Button variant="outline" />}>
                  Cerrar
                </DrawerClose>
              ) : (
                <>
                  <Button
                    type="submit"
                    form="bovino-record-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : mode === "create"
                        ? "Guardar bovino"
                        : "Guardar cambios"}
                  </Button>
                  <DrawerClose
                    render={<Button variant="outline" disabled={isSubmitting} />}
                  >
                    Cancelar
                  </DrawerClose>
                </>
              )}
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}