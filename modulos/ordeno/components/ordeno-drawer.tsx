"use client"

import * as React from "react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import type { BovinoOpcionOrdeno, OrdenoRegistro } from "../actions/actions"
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

export const ordenoSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string().uuid("Debes seleccionar un bovino válido"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  litros: z.coerce.number().min(0, "Los litros no pueden ser negativos"),
  jornada: z.enum(["Mañana", "Tarde"]),
  concentrado_kg: z.coerce
    .number()
    .min(0, "El concentrado no puede ser negativo")
    .nullable()
    .optional(),
  observaciones: z.string().nullable().optional(),
  registrado_por: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
})

export interface OrdenoPayload {
  bovino_id: string
  fecha: string
  litros: number
  jornada: "Mañana" | "Tarde"
  concentrado_kg?: number | null
  observaciones?: string | null
}

export type OrdenoDrawerMode = "create" | "view" | "edit" | "filter" | null

export interface OrdenoFilterState {
  search: string
  jornada: string
  fechaDesde: string
  fechaHasta: string
}

const JORNADA_OPTIONS = [
  { label: "Mañana", value: "Mañana" },
  { label: "Tarde", value: "Tarde" },
]

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function createEmptyOrdeno(): OrdenoPayload {
  return {
    bovino_id: "",
    fecha: getTodayDateString(),
    litros: 0,
    jornada: "Mañana",
    concentrado_kg: 0,
    observaciones: "",
  }
}

interface OrdenoDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: OrdenoDrawerMode
  item: OrdenoRegistro | null
  bovinosList: BovinoOpcionOrdeno[]
  isSubmitting?: boolean
  onSave: (
    values: OrdenoPayload,
    mode: "create" | "edit",
    existingId?: string
  ) => Promise<void> | void
  filters: OrdenoFilterState
  onApplyFilters: (nextFilters: OrdenoFilterState) => void
  onClearFilters: () => void
}

export function OrdenoDrawer({
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
}: OrdenoDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"

  const [formValues, setFormValues] = React.useState<OrdenoPayload>(() =>
    createEmptyOrdeno()
  )
  const [draftFilters, setDraftFilters] = React.useState<OrdenoFilterState>(filters)

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
      const litrosNum =
        typeof item.litros === "number" ? item.litros : Number(item.litros ?? 0)
      const concentradoNum =
        item.concentrado_kg === null || item.concentrado_kg === undefined
          ? 0
          : typeof item.concentrado_kg === "number"
            ? item.concentrado_kg
            : Number(item.concentrado_kg)

      setFormValues({
        bovino_id: item.bovino_id,
        fecha: item.fecha || getTodayDateString(),
        litros: Number.isNaN(litrosNum) ? 0 : litrosNum,
        jornada: item.jornada === "Tarde" ? "Tarde" : "Mañana",
        concentrado_kg: Number.isNaN(concentradoNum) ? 0 : concentradoNum,
        observaciones: item.observaciones ?? "",
      })
    } else if (mode === "create") {
      setFormValues(createEmptyOrdeno())
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
  }, [open, mode, item, filters])

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault()

    const cleanPayload: OrdenoPayload = {
      bovino_id: formValues.bovino_id.trim(),
      fecha: formValues.fecha.trim() || getTodayDateString(),
      litros: Number.isFinite(Number(formValues.litros))
        ? Number(formValues.litros)
        : 0,
      jornada: formValues.jornada === "Tarde" ? "Tarde" : "Mañana",
      concentrado_kg: Number.isFinite(Number(formValues.concentrado_kg))
        ? Number(formValues.concentrado_kg)
        : 0,
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
      // El error ya se muestra mediante toast en handleSaveOrdeno
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    onApplyFilters(draftFilters)
    onOpenChange(false)
  }

  function handleResetFilters() {
    const empty: OrdenoFilterState = {
      search: "",
      jornada: "ALL",
      fechaDesde: "",
      fechaHasta: "",
    }
    setDraftFilters(empty)
    onClearFilters()
    onOpenChange(false)
  }

  const drawerTitle =
    mode === "create"
      ? "Registrar ordeño"
      : mode === "edit"
        ? `Editar ordeño · ${item?.fecha ?? ""}`
        : mode === "filter"
          ? "Filtrar registros de ordeño"
          : `Detalle de ordeño · ${item?.fecha ?? ""}`

  const drawerDescription =
    mode === "create"
      ? "Registra la producción de leche, jornada y concentrado suministrado."
      : mode === "edit"
        ? "Modifica los datos del registro de ordeño seleccionado."
        : mode === "filter"
          ? "Filtra por arete/nombre del bovino, jornada o rango de fechas."
          : item?.bovino_label
            ? `Animal: ${item.bovino_label}`
            : "Consulta la información registrada del ordeño."

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
                  id="ordeno-filter-form"
                  onSubmit={handleFilterSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-ordeno-search">
                      Buscar bovino (Arete o Nombre)
                    </Label>
                    <Input
                      id="filter-ordeno-search"
                      placeholder="Ej. BOV-001 o Lucero..."
                      value={draftFilters.search}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-ordeno-jornada">Jornada</Label>
                    <Select
                      value={draftFilters.jornada}
                      onValueChange={(value) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          jornada: value ?? "ALL",
                        }))
                      }
                      items={[{ label: "Todas", value: "ALL" }, ...JORNADA_OPTIONS]}
                    >
                      <SelectTrigger
                        id="filter-ordeno-jornada"
                        className="w-full"
                      >
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="ALL">Todas</SelectItem>
                          {JORNADA_OPTIONS.map((opt) => (
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
                      <Label htmlFor="filter-fecha-desde">Desde</Label>
                      <Input
                        id="filter-fecha-desde"
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
                      <Label htmlFor="filter-fecha-hasta">Hasta</Label>
                      <Input
                        id="filter-fecha-hasta"
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
                  id="ordeno-record-form"
                  onSubmit={handleSaveSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ordeno-bovino">Bovino *</Label>
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
                      <SelectTrigger id="ordeno-bovino" className="w-full">
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
                      <Label htmlFor="ordeno-fecha">Fecha *</Label>
                      <Input
                        id="ordeno-fecha"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ordeno-jornada">Jornada *</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.jornada}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            jornada:
                              value === "Tarde" ? "Tarde" : "Mañana",
                          }))
                        }
                        items={JORNADA_OPTIONS}
                      >
                        <SelectTrigger id="ordeno-jornada" className="w-full">
                          <SelectValue placeholder="Selecciona jornada" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {JORNADA_OPTIONS.map((opt) => (
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
                      <Label htmlFor="ordeno-litros">Litros *</Label>
                      <Input
                        id="ordeno-litros"
                        type="number"
                        step="0.01"
                        min="0"
                        max="999.99"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.litros}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            litros: e.target.value === "" ? 0 : Number(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ordeno-concentrado">Concentrado (kg)</Label>
                      <Input
                        id="ordeno-concentrado"
                        type="number"
                        step="0.01"
                        min="0"
                        max="999.99"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.concentrado_kg ?? 0}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            concentrado_kg:
                              e.target.value === "" ? 0 : Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ordeno-observaciones">Observaciones</Label>
                    <Input
                      id="ordeno-observaciones"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Ej. Mastitis leve, buen apetito, cambio de potrero..."
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
                  <Button type="submit" form="ordeno-filter-form">
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
                    form="ordeno-record-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : mode === "create"
                        ? "Guardar ordeño"
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