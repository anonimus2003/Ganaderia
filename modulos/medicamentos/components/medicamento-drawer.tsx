"use client"

import * as React from "react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import type {
  BovinoOpcionMedicamento,
  MedicamentoRegistro,
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

export const VIAS_APLICACION = [
  "Intramuscular",
  "Subcutánea",
  "Oral",
  "Tópica",
  "Intrauterina",
  "Local",
  "Intravenosa",
  "Rectal",
  "Intramamaria",
  "Intraruminal",
  "Intraperitonial",
  "Ocular",
  "Intradermica",
  "Endovenosa",
] as const

export type ViaAplicacion = (typeof VIAS_APLICACION)[number]

export const medicamentoSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string().uuid("Debes seleccionar un bovino válido"),
  medicamento: z.string().min(1, "El medicamento es obligatorio"),
  dosis: z.string().min(1, "La dosis es obligatoria"),
  via: z.enum(VIAS_APLICACION),
  fecha_aplicacion: z.string().min(1, "La fecha de aplicación es obligatoria"),
  veterinario: z.string().min(1, "El veterinario es obligatorio"),
  motivo: z.string().nullable().optional(),
  retiro_leche: z.coerce.number().int().min(0).nullable().optional(),
  retiro_carne: z.coerce.number().int().min(0).nullable().optional(),
  registrado_por: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
})

export interface MedicamentoPayload {
  bovino_id: string
  medicamento: string
  dosis: string
  via: ViaAplicacion
  fecha_aplicacion: string
  veterinario: string
  motivo?: string | null
  retiro_leche?: number | null
  retiro_carne?: number | null
}

export type MedicamentoDrawerMode = "create" | "view" | "edit" | "filter" | null

export interface MedicamentoFilterState {
  search: string
  via: string
  veterinario: string
  fechaDesde: string
  fechaHasta: string
}

const VIA_OPTIONS = VIAS_APLICACION.map((via) => ({
  label: via,
  value: via,
}))

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function createEmptyMedicamento(): MedicamentoPayload {
  return {
    bovino_id: "",
    medicamento: "",
    dosis: "",
    via: "Intramuscular",
    fecha_aplicacion: getTodayDateString(),
    veterinario: "",
    motivo: "",
    retiro_leche: 0,
    retiro_carne: 0,
  }
}

interface MedicamentoDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: MedicamentoDrawerMode
  item: MedicamentoRegistro | null
  bovinosList: BovinoOpcionMedicamento[]
  isSubmitting?: boolean
  onSave: (
    values: MedicamentoPayload,
    mode: "create" | "edit",
    existingId?: string
  ) => Promise<void> | void
  filters: MedicamentoFilterState
  onApplyFilters: (nextFilters: MedicamentoFilterState) => void
  onClearFilters: () => void
}

export function MedicamentoDrawer({
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
}: MedicamentoDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"

  const [formValues, setFormValues] = React.useState<MedicamentoPayload>(() =>
    createEmptyMedicamento()
  )
  const [draftFilters, setDraftFilters] =
    React.useState<MedicamentoFilterState>(filters)

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
      const viaValida = VIAS_APLICACION.includes(item.via as ViaAplicacion)
        ? (item.via as ViaAplicacion)
        : "Intramuscular"

      const lecheNum =
        item.retiro_leche === null || item.retiro_leche === undefined
          ? 0
          : Number(item.retiro_leche)
      const carneNum =
        item.retiro_carne === null || item.retiro_carne === undefined
          ? 0
          : Number(item.retiro_carne)

      setFormValues({
        bovino_id: item.bovino_id,
        medicamento: item.medicamento ?? "",
        dosis: item.dosis ?? "",
        via: viaValida,
        fecha_aplicacion: item.fecha_aplicacion || getTodayDateString(),
        veterinario: item.veterinario ?? "",
        motivo: item.motivo ?? "",
        retiro_leche: Number.isNaN(lecheNum) ? 0 : lecheNum,
        retiro_carne: Number.isNaN(carneNum) ? 0 : carneNum,
      })
    } else if (mode === "create") {
      setFormValues(createEmptyMedicamento())
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
  }, [open, mode, item, filters])

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault()

    const cleanPayload: MedicamentoPayload = {
      bovino_id: formValues.bovino_id.trim(),
      medicamento: formValues.medicamento.trim(),
      dosis: formValues.dosis.trim(),
      via: formValues.via,
      fecha_aplicacion:
        formValues.fecha_aplicacion.trim() || getTodayDateString(),
      veterinario: formValues.veterinario.trim(),
      motivo: formValues.motivo?.trim() ? formValues.motivo.trim() : null,
      retiro_leche: Number.isFinite(Number(formValues.retiro_leche))
        ? Math.max(0, Math.trunc(Number(formValues.retiro_leche)))
        : 0,
      retiro_carne: Number.isFinite(Number(formValues.retiro_carne))
        ? Math.max(0, Math.trunc(Number(formValues.retiro_carne)))
        : 0,
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
      // El error ya se muestra con toast en handleSaveMedicamento
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    onApplyFilters(draftFilters)
    onOpenChange(false)
  }

  function handleResetFilters() {
    const empty: MedicamentoFilterState = {
      search: "",
      via: "ALL",
      veterinario: "",
      fechaDesde: "",
      fechaHasta: "",
    }
    setDraftFilters(empty)
    onClearFilters()
    onOpenChange(false)
  }

  const drawerTitle =
    mode === "create"
      ? "Registrar aplicación de medicamento"
      : mode === "edit"
        ? `Editar aplicación · ${item?.medicamento ?? ""}`
        : mode === "filter"
          ? "Filtrar medicamentos"
          : `Detalle de aplicación · ${item?.medicamento ?? ""}`

  const drawerDescription =
    mode === "create"
      ? "Registra el tratamiento aplicado, vía, dosis, veterinario y tiempos de retiro."
      : mode === "edit"
        ? "Modifica los datos de la aplicación clínica seleccionada."
        : mode === "filter"
          ? "Filtra por bovino, medicamento, vía de aplicación, veterinario o rango de fechas."
          : item?.bovino_label
            ? `Animal: ${item.bovino_label}`
            : "Consulta la información clínica registrada."

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
                  id="medicamento-filter-form"
                  onSubmit={handleFilterSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-med-search">
                      Buscar (Arete, Nombre o Medicamento)
                    </Label>
                    <Input
                      id="filter-med-search"
                      placeholder="Ej. BOV-001, Lucero o Ivermectina..."
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
                      <Label htmlFor="filter-med-via">Vía</Label>
                      <Select
                        value={draftFilters.via}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            via: value ?? "ALL",
                          }))
                        }
                        items={[{ label: "Todas", value: "ALL" }, ...VIA_OPTIONS]}
                      >
                        <SelectTrigger id="filter-med-via" className="w-full">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todas</SelectItem>
                            {VIA_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-med-vet">Veterinario</Label>
                      <Input
                        id="filter-med-vet"
                        placeholder="Nombre del veterinario..."
                        value={draftFilters.veterinario}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            veterinario: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-med-desde">Desde</Label>
                      <Input
                        id="filter-med-desde"
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
                      <Label htmlFor="filter-med-hasta">Hasta</Label>
                      <Input
                        id="filter-med-hasta"
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
                  id="medicamento-record-form"
                  onSubmit={handleSaveSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="med-bovino">Bovino *</Label>
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
                      <SelectTrigger id="med-bovino" className="w-full">
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
                      <Label htmlFor="med-nombre">Medicamento *</Label>
                      <Input
                        id="med-nombre"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. Oxitetraciclina LA"
                        value={formValues.medicamento}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            medicamento: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="med-dosis">Dosis *</Label>
                      <Input
                        id="med-dosis"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. 10 ml / 1 mL por 10 kg"
                        value={formValues.dosis}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            dosis: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="med-via">Vía de aplicación *</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.via}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            via:
                              (value as ViaAplicacion) ?? "Intramuscular",
                          }))
                        }
                        items={VIA_OPTIONS}
                      >
                        <SelectTrigger id="med-via" className="w-full">
                          <SelectValue placeholder="Selecciona vía" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {VIA_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="med-fecha">Fecha de aplicación *</Label>
                      <Input
                        id="med-fecha"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha_aplicacion}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            fecha_aplicacion: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="med-veterinario">Veterinario *</Label>
                    <Input
                      id="med-veterinario"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Nombre del médico veterinario o responsable"
                      value={formValues.veterinario}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          veterinario: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="med-retiro-leche">
                        Retiro leche (días)
                      </Label>
                      <Input
                        id="med-retiro-leche"
                        type="number"
                        min="0"
                        step="1"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.retiro_leche ?? 0}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            retiro_leche:
                              e.target.value === ""
                                ? 0
                                : Math.max(0, Math.trunc(Number(e.target.value))),
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="med-retiro-carne">
                        Retiro carne (días)
                      </Label>
                      <Input
                        id="med-retiro-carne"
                        type="number"
                        min="0"
                        step="1"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.retiro_carne ?? 0}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            retiro_carne:
                              e.target.value === ""
                                ? 0
                                : Math.max(0, Math.trunc(Number(e.target.value))),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="med-motivo">Motivo / Diagnóstico</Label>
                    <Input
                      id="med-motivo"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Ej. Cojera, control parasitario, mastitis..."
                      value={formValues.motivo ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          motivo: e.target.value,
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
                  <Button type="submit" form="medicamento-filter-form">
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
                    form="medicamento-record-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : mode === "create"
                        ? "Guardar aplicación"
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