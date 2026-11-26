"use client"

import * as React from "react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import type {
  BovinoOpcionReproduccion,
  ReproduccionRegistro,
} from "../actions/actions"
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

export const TIPO_REPRODUCCION_OPTIONS = [
  { label: "I.Artificial", value: "I.Artificial" },
  { label: "Monta Natural", value: "Monta Natural" },
] as const

export const ESTADO_INSEMINACION_OPTIONS = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "Preñada", value: "Preñada" },
  { label: "Vacía", value: "Vacía" },
  { label: "Aborto", value: "Aborto" },
  { label: "Parida", value: "Parida" },
] as const

export const reproduccionSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string().uuid("Debes seleccionar un bovino válido"),
  toro_pajilla: z.string().min(1, "El toro o pajilla es obligatorio").max(100),
  raza_toro: z.string().max(100).nullable().optional(),
  numero_servicios: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser al menos 1 servicio")
    .nullable()
    .optional(),
  tipo: z.string().nullable().optional(),
  fecha_inseminacion: z.string().min(1, "La fecha es obligatoria"),
  fecha_chequeo: z.string().nullable().optional(),
  fecha_probable_parto: z.string().nullable().optional(),
  fecha_secado: z.string().nullable().optional(),
  fecha_parto: z.string().nullable().optional(),
  tecnico: z.string().min(1, "El técnico es obligatorio").max(100),
  estado: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  registrado_por: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
})

export interface ReproduccionPayload {
  bovino_id: string
  toro_pajilla: string
  raza_toro?: string | null
  numero_servicios?: number | null
  tipo?: string | null
  fecha_inseminacion: string
  fecha_chequeo?: string | null
  fecha_probable_parto?: string | null
  fecha_secado?: string | null
  fecha_parto?: string | null
  tecnico: string
  estado?: string | null
  observaciones?: string | null
}

export type ReproduccionDrawerMode = "create" | "view" | "edit" | "filter" | null

export interface ReproduccionFilterState {
  search: string
  tipo: string
  estado: string
  tecnico: string
  fechaDesde: string
  fechaHasta: string
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function createEmptyReproduccion(): ReproduccionPayload {
  return {
    bovino_id: "",
    toro_pajilla: "",
    raza_toro: "",
    numero_servicios: 1,
    tipo: "I.Artificial",
    fecha_inseminacion: getTodayDateString(),
    fecha_chequeo: null,
    fecha_probable_parto: null,
    fecha_secado: null,
    fecha_parto: null,
    tecnico: "",
    estado: "Pendiente",
    observaciones: "",
  }
}

interface ReproduccionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ReproduccionDrawerMode
  item: ReproduccionRegistro | null
  bovinosList: BovinoOpcionReproduccion[]
  isSubmitting?: boolean
  onSave: (
    values: ReproduccionPayload,
    mode: "create" | "edit",
    existingId?: string
  ) => Promise<void> | void
  filters: ReproduccionFilterState
  onApplyFilters: (nextFilters: ReproduccionFilterState) => void
  onClearFilters: () => void
}

export function ReproduccionDrawer({
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
}: ReproduccionDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"

  const [formValues, setFormValues] = React.useState<ReproduccionPayload>(() =>
    createEmptyReproduccion()
  )
  const [draftFilters, setDraftFilters] =
    React.useState<ReproduccionFilterState>(filters)

  const bovinoSelectItems = React.useMemo(() => {
    const base = bovinosList.map((b) => ({
      label: `${b.arete}${b.nombre ? ` — ${b.nombre}` : ""}`,
      value: b.id,
    }))

    if (item?.bovino_id && !base.some((opt) => opt.value === item.bovino_id)) {
      base.unshift({
        label: item.bovino_label || item.bovino_id,
        value: item.bovino_id,
      })
    }

    return base
  }, [bovinosList, item])

  React.useEffect(() => {
    if (!open) return

    if ((mode === "edit" || mode === "view") && item) {
      const serviciosNum =
        item.numero_servicios === null || item.numero_servicios === undefined
          ? 1
          : Number(item.numero_servicios)

      setFormValues({
        bovino_id: item.bovino_id,
        toro_pajilla: item.toro_pajilla ?? "",
        raza_toro: item.raza_toro ?? "",
        numero_servicios:
          Number.isNaN(serviciosNum) || serviciosNum < 1 ? 1 : serviciosNum,
        tipo: item.tipo || "I.Artificial",
        fecha_inseminacion: item.fecha_inseminacion || getTodayDateString(),
        fecha_chequeo: item.fecha_chequeo ?? null,
        fecha_probable_parto: item.fecha_probable_parto ?? null,
        fecha_secado: item.fecha_secado ?? null,
        fecha_parto: item.fecha_parto ?? null,
        tecnico: item.tecnico ?? "",
        estado: item.estado || "Pendiente",
        observaciones: item.observaciones ?? "",
      })
    } else if (mode === "create") {
      setFormValues(createEmptyReproduccion())
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
  }, [open, mode, item, filters])

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault()

    const serviciosLimpiados = Number.isFinite(Number(formValues.numero_servicios))
      ? Math.max(1, Math.trunc(Number(formValues.numero_servicios)))
      : 1

    const cleanPayload: ReproduccionPayload = {
      bovino_id: formValues.bovino_id.trim(),
      toro_pajilla: formValues.toro_pajilla.trim(),
      raza_toro: formValues.raza_toro?.trim()
        ? formValues.raza_toro.trim()
        : null,
      numero_servicios: serviciosLimpiados,
      tipo: formValues.tipo?.trim() || "I.Artificial",
      fecha_inseminacion:
        formValues.fecha_inseminacion.trim() || getTodayDateString(),
      fecha_chequeo: formValues.fecha_chequeo || null,
      fecha_probable_parto: formValues.fecha_probable_parto || null,
      fecha_secado: formValues.fecha_secado || null,
      fecha_parto: formValues.fecha_parto || null,
      tecnico: formValues.tecnico.trim(),
      estado: formValues.estado?.trim() || "Pendiente",
      observaciones: formValues.observaciones?.trim()
        ? formValues.observaciones.trim()
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
      // El error ya se notifica con toast en handleSaveReproduccion
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    onApplyFilters(draftFilters)
    onOpenChange(false)
  }

  function handleResetFilters() {
    const empty: ReproduccionFilterState = {
      search: "",
      tipo: "ALL",
      estado: "ALL",
      tecnico: "",
      fechaDesde: "",
      fechaHasta: "",
    }
    setDraftFilters(empty)
    onClearFilters()
    onOpenChange(false)
  }

  const drawerTitle =
    mode === "create"
      ? "Registrar servicio reproductivo"
      : mode === "edit"
        ? `Editar reproducción · ${item?.toro_pajilla ?? ""}`
        : mode === "filter"
          ? "Filtrar reproducciones"
          : `Detalle reproductivo · ${item?.toro_pajilla ?? ""}`

  const drawerDescription =
    mode === "create"
      ? "Registra la inseminación o monta, toro/pajilla, técnico y fechas de seguimiento."
      : mode === "edit"
        ? "Modifica los datos y fechas del registro reproductivo seleccionado."
        : mode === "filter"
          ? "Filtra por bovino, toro/pajilla, tipo, estado, técnico o rango de fechas."
          : item?.bovino_label
            ? `Animal: ${item.bovino_label}`
            : "Consulta la información reproductiva registrada."

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
                  id="reproduccion-filter-form"
                  onSubmit={handleFilterSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-rep-search">
                      Buscar (Arete, Nombre o Toro/Pajilla)
                    </Label>
                    <Input
                      id="filter-rep-search"
                      placeholder="Ej. BOV-001, Lucero o Pajilla 402..."
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
                      <Label htmlFor="filter-rep-tipo">Tipo</Label>
                      <Select
                        value={draftFilters.tipo}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            tipo: value ?? "ALL",
                          }))
                        }
                        items={[
                          { label: "Todos", value: "ALL" },
                          ...TIPO_REPRODUCCION_OPTIONS,
                        ]}
                      >
                        <SelectTrigger id="filter-rep-tipo" className="w-full">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {TIPO_REPRODUCCION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-rep-estado">Estado</Label>
                      <Select
                        value={draftFilters.estado}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            estado: value ?? "ALL",
                          }))
                        }
                        items={[
                          { label: "Todos", value: "ALL" },
                          ...ESTADO_INSEMINACION_OPTIONS,
                        ]}
                      >
                        <SelectTrigger id="filter-rep-estado" className="w-full">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {ESTADO_INSEMINACION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-rep-tecnico">Técnico</Label>
                    <Input
                      id="filter-rep-tecnico"
                      placeholder="Nombre del técnico..."
                      value={draftFilters.tecnico}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          tecnico: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-rep-desde">Desde</Label>
                      <Input
                        id="filter-rep-desde"
                        type="date"
                        value={draftFilters.fechaDesde}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            fechaDesde: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-rep-hasta">Hasta</Label>
                      <Input
                        id="filter-rep-hasta"
                        type="date"
                        value={draftFilters.fechaHasta}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            fechaHasta: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <form
                  id="reproduccion-record-form"
                  onSubmit={handleSaveSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="rep-bovino">Hembra / Bovino *</Label>
                    <Select
                      disabled={isReadOnly || isSubmitting}
                      value={formValues.bovino_id || undefined}
                      onValueChange={(value) =>
                        setFormValues((prev) => ({
                          ...prev,
                          bovino_id: value ?? "",
                        }))
                      }
                      items={bovinoSelectItems}
                    >
                      <SelectTrigger id="rep-bovino" className="w-full">
                        <SelectValue placeholder="Selecciona un bovino" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {bovinoSelectItems.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-toro">Toro / Pajilla *</Label>
                      <Input
                        id="rep-toro"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. Pajilla 0045 / Don Ramiro"
                        value={formValues.toro_pajilla}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            toro_pajilla: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-raza-toro">Raza del toro</Label>
                      <Input
                        id="rep-raza-toro"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. Gyr, Holstein, Jersey..."
                        value={formValues.raza_toro ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            raza_toro: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-tipo">Tipo</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.tipo || "I.Artificial"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            tipo: value ?? "I.Artificial",
                          }))
                        }
                        items={TIPO_REPRODUCCION_OPTIONS}
                      >
                        <SelectTrigger id="rep-tipo" className="w-full">
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {TIPO_REPRODUCCION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-servicios">N° servicios</Label>
                      <Input
                        id="rep-servicios"
                        type="number"
                        min="1"
                        step="1"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.numero_servicios ?? 1}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            numero_servicios:
                              e.target.value === ""
                                ? 1
                                : Math.max(1, Math.trunc(Number(e.target.value))),
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-estado">Estado</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.estado || "Pendiente"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            estado: value ?? "Pendiente",
                          }))
                        }
                        items={ESTADO_INSEMINACION_OPTIONS}
                      >
                        <SelectTrigger id="rep-estado" className="w-full">
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {ESTADO_INSEMINACION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="rep-tecnico">Técnico *</Label>
                    <Input
                      id="rep-tecnico"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Nombre del inseminador o responsable"
                      value={formValues.tecnico}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          tecnico: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-fecha-insem">
                        Fecha inseminación / servicio *
                      </Label>
                      <Input
                        id="rep-fecha-insem"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha_inseminacion}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha_inseminacion: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-fecha-chequeo">Fecha chequeo</Label>
                      <Input
                        id="rep-fecha-chequeo"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha_chequeo ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha_chequeo: e.target.value || null,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-fecha-prob-parto">
                        Probable parto
                      </Label>
                      <Input
                        id="rep-fecha-prob-parto"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha_probable_parto ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha_probable_parto: e.target.value || null,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-fecha-secado">Fecha secado</Label>
                      <Input
                        id="rep-fecha-secado"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha_secado ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha_secado: e.target.value || null,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rep-fecha-parto">Fecha parto</Label>
                      <Input
                        id="rep-fecha-parto"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha_parto ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha_parto: e.target.value || null,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="rep-observaciones">Observaciones</Label>
                    <Input
                      id="rep-observaciones"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Notas de celo, protocolo, palpación..."
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
                  <Button type="submit" form="reproduccion-filter-form">
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
                    form="reproduccion-record-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : mode === "create"
                        ? "Guardar registro"
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