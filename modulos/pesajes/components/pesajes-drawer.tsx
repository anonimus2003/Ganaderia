"use client"

import * as React from "react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import type {
  BovinoOpcionPesaje,
  PesajeRegistro,
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

export const METODOS_PESAJE = [
  "Báscula electrónica",
  "Báscula mecánica",
  "Cinta bovinométrica",
  "Estimación visual",
] as const

export type MetodoPesaje = (typeof METODOS_PESAJE)[number]

export const ESTADOS_FISIOLOGICOS = [
  "Lactancia",
  "Seca",
  "Gestante",
  "Vacía",
  "Crecimiento / Levante",
  "Novilla de vientre",
  "Reproductor",
] as const

export type EstadoFisiologico = (typeof ESTADOS_FISIOLOGICOS)[number]

export const pesajeSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string().uuid("Debes seleccionar un bovino válido"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  peso_kgs: z.coerce
    .number()
    .positive("El peso debe ser mayor a 0 kg")
    .max(2500, "El peso no puede superar 2,500 kg"),
  condicion_corporal: z.coerce
    .number()
    .min(1, "La condición corporal mínima es 1")
    .max(5, "La condición corporal máxima es 5")
    .nullable()
    .optional(),
  estado_fisiologico: z.string().nullable().optional(),
  metodo_pesaje: z.string().nullable().optional(),
  responsable: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  ganancia_diaria_kg: z.coerce.number().nullable().optional(),
  registrado_por: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
})

export interface PesajePayload {
  bovino_id: string
  fecha: string
  peso_kgs: number
  condicion_corporal?: number | null
  estado_fisiologico?: string | null
  metodo_pesaje?: string | null
  responsable?: string | null
  observaciones?: string | null
}

export type PesajeDrawerMode = "create" | "view" | "edit" | "filter" | null

export interface PesajeFilterState {
  search: string
  bovinoId: string
  metodoPesaje: string
  estadoFisiologico: string
  fechaDesde: string
  fechaHasta: string
}

const METODO_OPTIONS = METODOS_PESAJE.map((metodo) => ({
  label: metodo,
  value: metodo,
}))

const ESTADO_OPTIONS = ESTADOS_FISIOLOGICOS.map((estado) => ({
  label: estado,
  value: estado,
}))

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseDecimalInput(raw: string): number {
  const normalized = raw.trim().replace(",", ".")
  if (!normalized) return Number.NaN
  return Number(normalized)
}

function createEmptyPesaje(): PesajePayload {
  return {
    bovino_id: "",
    fecha: getTodayDateString(),
    peso_kgs: 0,
    condicion_corporal: null,
    estado_fisiologico: "",
    metodo_pesaje: "Báscula electrónica",
    responsable: "",
    observaciones: "",
  }
}

interface PesajesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: PesajeDrawerMode
  item: PesajeRegistro | null
  bovinosList: BovinoOpcionPesaje[]
  isSubmitting?: boolean
  onSave: (
    values: PesajePayload,
    mode: "create" | "edit",
    existingId?: string
  ) => Promise<void> | void
  filters: PesajeFilterState
  onApplyFilters: (nextFilters: PesajeFilterState) => void
  onClearFilters: () => void
}

export function PesajesDrawer({
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
}: PesajesDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"

  const [formValues, setFormValues] = React.useState<PesajePayload>(() =>
    createEmptyPesaje()
  )
  const [pesoInput, setPesoInput] = React.useState<string>("")
  const [ccInput, setCcInput] = React.useState<string>("")
  const [draftFilters, setDraftFilters] =
    React.useState<PesajeFilterState>(filters)

  const bovinoSelectItems = React.useMemo(() => {
    const base = bovinosList.map((b) => ({
      label: `${b.arete || b.id}${b.nombre ? ` — ${b.nombre}` : ""}`,
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
      const pesoNum =
        item.peso_kgs === null || item.peso_kgs === undefined
          ? 0
          : Number(item.peso_kgs)
      const ccNum =
        item.condicion_corporal === null ||
        item.condicion_corporal === undefined
          ? null
          : Number(item.condicion_corporal)

      setFormValues({
        bovino_id: item.bovino_id ?? "",
        fecha: item.fecha || getTodayDateString(),
        peso_kgs: Number.isNaN(pesoNum) ? 0 : pesoNum,
        condicion_corporal:
          ccNum !== null && !Number.isNaN(ccNum) ? ccNum : null,
        estado_fisiologico: item.estado_fisiologico ?? "",
        metodo_pesaje: item.metodo_pesaje ?? "",
        responsable: item.responsable ?? "",
        observaciones: item.observaciones ?? "",
      })
      setPesoInput(
        !Number.isNaN(pesoNum) && pesoNum > 0 ? String(pesoNum) : ""
      )
      setCcInput(
        ccNum !== null && !Number.isNaN(ccNum) ? String(ccNum) : ""
      )
    } else if (mode === "create") {
      setFormValues(createEmptyPesaje())
      setPesoInput("")
      setCcInput("")
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
  }, [open, mode, item, filters])

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault()

    const pesoParsed = parseDecimalInput(pesoInput)
    const ccParsed =
      ccInput.trim() === "" ? null : parseDecimalInput(ccInput)

    const cleanPayload: PesajePayload = {
      bovino_id: formValues.bovino_id.trim(),
      fecha: formValues.fecha.trim() || getTodayDateString(),
      peso_kgs: Number.isFinite(pesoParsed) ? pesoParsed : 0,
      condicion_corporal:
        ccParsed !== null && Number.isFinite(ccParsed) ? ccParsed : null,
      estado_fisiologico: formValues.estado_fisiologico?.trim()
        ? formValues.estado_fisiologico.trim()
        : null,
      metodo_pesaje: formValues.metodo_pesaje?.trim()
        ? formValues.metodo_pesaje.trim()
        : null,
      responsable: formValues.responsable?.trim()
        ? formValues.responsable.trim()
        : null,
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
      // El error ya se muestra con toast en handleSavePesaje
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    onApplyFilters(draftFilters)
    onOpenChange(false)
  }

  function handleResetFilters() {
    const empty: PesajeFilterState = {
      search: "",
      bovinoId: "ALL",
      metodoPesaje: "ALL",
      estadoFisiologico: "ALL",
      fechaDesde: "",
      fechaHasta: "",
    }
    setDraftFilters(empty)
    onClearFilters()
    onOpenChange(false)
  }

  const drawerTitle =
    mode === "create"
      ? "Registrar pesaje"
      : mode === "edit"
        ? `Editar pesaje · ${item?.fecha ?? ""}`
        : mode === "filter"
          ? "Filtrar pesajes"
          : `Detalle de pesaje · ${item?.fecha ?? ""}`

  const drawerDescription =
    mode === "create"
      ? "Registra el peso, condición corporal y estado fisiológico del bovino."
      : mode === "edit"
        ? "Modifica los datos del pesaje seleccionado. La ganancia diaria se recalcula automáticamente."
        : mode === "filter"
          ? "Filtra por bovino, método de pesaje, estado fisiológico o rango de fechas."
          : item?.bovino_label
            ? `Animal: ${item.bovino_label}`
            : "Consulta la información del control de peso registrado."

  const gananciaDisplay = React.useMemo(() => {
    if (
      item?.ganancia_diaria_kg === null ||
      item?.ganancia_diaria_kg === undefined
    ) {
      return "Sin registro previo"
    }
    const num = Number(item.ganancia_diaria_kg)
    if (Number.isNaN(num)) return String(item.ganancia_diaria_kg)
    return `${num > 0 ? "+" : ""}${num.toFixed(2)} kg/día`
  }, [item])

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
                  id="pesaje-filter-form"
                  onSubmit={handleFilterSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-pesaje-search">
                      Buscar (Arete, Nombre, Responsable u Observaciones)
                    </Label>
                    <Input
                      id="filter-pesaje-search"
                      placeholder="Ej. BOV-001, Lucero o Juan..."
                      value={draftFilters.search ?? ""}
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
                      <Label htmlFor="filter-pesaje-metodo">Método</Label>
                      <Select
                        value={draftFilters.metodoPesaje ?? "ALL"}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            metodoPesaje: value ?? "ALL",
                          }))
                        }
                        items={[
                          { label: "Todos", value: "ALL" },
                          ...METODO_OPTIONS,
                        ]}
                      >
                        <SelectTrigger
                          id="filter-pesaje-metodo"
                          className="w-full"
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {METODO_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-pesaje-estado">
                        Estado fisiológico
                      </Label>
                      <Select
                        value={draftFilters.estadoFisiologico ?? "ALL"}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            estadoFisiologico: value ?? "ALL",
                          }))
                        }
                        items={[
                          { label: "Todos", value: "ALL" },
                          ...ESTADO_OPTIONS,
                        ]}
                      >
                        <SelectTrigger
                          id="filter-pesaje-estado"
                          className="w-full"
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {ESTADO_OPTIONS.map((opt) => (
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
                      <Label htmlFor="filter-pesaje-desde">Desde</Label>
                      <Input
                        id="filter-pesaje-desde"
                        type="date"
                        value={draftFilters.fechaDesde ?? ""}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            fechaDesde: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-pesaje-hasta">Hasta</Label>
                      <Input
                        id="filter-pesaje-hasta"
                        type="date"
                        value={draftFilters.fechaHasta ?? ""}
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
                  id="pesaje-record-form"
                  onSubmit={handleSaveSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pesaje-bovino">Bovino *</Label>
                    <Select
                      disabled={isReadOnly || isSubmitting}
                      value={formValues.bovino_id ?? ""}
                      onValueChange={(value) =>
                        setFormValues((prev) => ({
                          ...prev,
                          bovino_id: value ?? "",
                        }))
                      }
                      items={bovinoSelectItems}
                    >
                      <SelectTrigger id="pesaje-bovino" className="w-full">
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
                      <Label htmlFor="pesaje-fecha">Fecha *</Label>
                      <Input
                        id="pesaje-fecha"
                        type="date"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.fecha ?? ""}
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
                      <Label htmlFor="pesaje-peso">Peso (kg) *</Label>
                      <Input
                        id="pesaje-peso"
                        type="text"
                        inputMode="decimal"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. 425.50"
                        value={pesoInput}
                        onChange={(e) => setPesoInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pesaje-cc">
                        Condición corporal (1–5)
                      </Label>
                      <Input
                        id="pesaje-cc"
                        type="text"
                        inputMode="decimal"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Ej. 3.45"
                        value={ccInput}
                        onChange={(e) => setCcInput(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pesaje-metodo">Método de pesaje</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.metodo_pesaje ?? ""}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            metodo_pesaje: value ?? "",
                          }))
                        }
                        items={METODO_OPTIONS}
                      >
                        <SelectTrigger id="pesaje-metodo" className="w-full">
                          <SelectValue placeholder="Selecciona método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {METODO_OPTIONS.map((opt) => (
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
                      <Label htmlFor="pesaje-estado">Estado fisiológico</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.estado_fisiologico ?? ""}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            estado_fisiologico: value ?? "",
                          }))
                        }
                        items={ESTADO_OPTIONS}
                      >
                        <SelectTrigger id="pesaje-estado" className="w-full">
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {ESTADO_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pesaje-responsable">Responsable</Label>
                      <Input
                        id="pesaje-responsable"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="Nombre del responsable"
                        value={formValues.responsable ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            responsable: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {isReadOnly && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="pesaje-ganancia">
                            Ganancia diaria (calculada)
                          </Label>
                          <Input
                            id="pesaje-ganancia"
                            disabled
                            value={gananciaDisplay}
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label htmlFor="pesaje-registrado-por">
                            Registrado por
                          </Label>
                          <Input
                            id="pesaje-registrado-por"
                            disabled
                            value={
                              item?.registrado_por_nombre ||
                              item?.registrado_por ||
                              "—"
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pesaje-observaciones">Observaciones</Label>
                    <Input
                      id="pesaje-observaciones"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Notas adicionales sobre el pesaje..."
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
                  <Button type="submit" form="pesaje-filter-form">
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
                    form="pesaje-record-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : mode === "create"
                        ? "Guardar pesaje"
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