"use client"

import * as React from "react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import type { PermisosModulo } from "@/lib/permisos"
import {
  DataTable,
  type HistorialOcupacionPotrero,
} from "@/modulos/potreros/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { CheckSquareIcon, SearchIcon, XIcon } from "lucide-react"

export interface PotreroOption {
  id: number
  nombre: string
  estado?: string | null
  tipo_pasto?: string | null
  area_m2?: number | null
}

export interface BovinoOption {
  id: string
  arete: string
  nombre?: string | null
  categoria?: string | null
  condicion?: string | null
}

export const ocupacionPotreroSchema = z.object({
  id: z.number().int().optional(),
  potrero_id: z.coerce.number().int().positive("Selecciona un potrero"),
  bovino_id: z.string().uuid().optional(),
  bovino_ids: z.array(z.string().uuid()).optional(),
  fecha_entrada: z.string().min(1, "La fecha de entrada es obligatoria"),
  fecha_salida: z.string().nullable().optional(),
  aforo: z
    .coerce.number()
    .min(0, "El aforo no puede ser negativo")
    .nullable()
    .optional(),
  registrado_por: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
})

export interface OcupacionPotreroPayload {
  potrero_id: number
  bovino_id: string
  bovino_ids: string[]
  fecha_entrada: string
  fecha_salida: string | null
  aforo: number | null
}

export type OcupacionPotreroDrawerMode =
  | "create"
  | "view"
  | "edit"
  | "filter"
  | null

export interface OcupacionPotreroFilterState {
  search: string
  estado: "ALL" | "ACTIVA" | "FINALIZADA"
  potrero_id: string
  fechaDesde: string
  fechaHasta: string
}

function toDateTimeLocalInput(isoOrDate?: string | null): string {
  const base = isoOrDate ? new Date(isoOrDate) : new Date()
  if (Number.isNaN(base.getTime())) {
    const now = new Date()
    const offsetMs = now.getTimezoneOffset() * 60_000
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16)
  }
  const offsetMs = base.getTimezoneOffset() * 60_000
  return new Date(base.getTime() - offsetMs).toISOString().slice(0, 16)
}

function formatBovinoOptionLabel(b: BovinoOption): string {
  const arete = b.arete?.trim() || b.id.slice(0, 8)
  const nombre = b.nombre?.trim()
  return nombre ? `${arete} — ${nombre}` : arete
}

function formatPotreroOptionLabel(p: PotreroOption): string {
  const extras: string[] = []
  if (p.tipo_pasto?.trim()) extras.push(p.tipo_pasto.trim())
  if (typeof p.area_m2 === "number" && Number.isFinite(p.area_m2) && p.area_m2 > 0) {
    extras.push(`${p.area_m2} m²`)
  }
  return extras.length > 0 ? `${p.nombre} (${extras.join(" · ")})` : p.nombre
}

interface OcupacionPotreroDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: OcupacionPotreroDrawerMode
  item: HistorialOcupacionPotrero | null
  potreros?: PotreroOption[]
  bovinos?: BovinoOption[]
  isSubmitting?: boolean
  onSave: (
    values: OcupacionPotreroPayload,
    mode: "create" | "edit",
    existingId?: number
  ) => Promise<void> | void
  filters: OcupacionPotreroFilterState
  onApplyFilters: (nextFilters: OcupacionPotreroFilterState) => void
  onClearFilters: () => void
}

export function OcupacionPotreroDrawer({
  open,
  onOpenChange,
  mode,
  item,
  potreros = [],
  bovinos = [],
  isSubmitting = false,
  onSave,
  filters,
  onApplyFilters,
  onClearFilters,
}: OcupacionPotreroDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"
  const isCreate = mode === "create"

  const [potreroId, setPotreroId] = React.useState<string>("")
  const [selectedBovinoIds, setSelectedBovinoIds] = React.useState<string[]>([])
  const [singleBovinoId, setSingleBovinoId] = React.useState<string>("")
  const [bovinoSearch, setBovinoSearch] = React.useState<string>("")
  const [fechaEntrada, setFechaEntrada] = React.useState<string>(() =>
    toDateTimeLocalInput()
  )
  const [fechaSalida, setFechaSalida] = React.useState<string>("")
  const [aforo, setAforo] = React.useState<string>("")
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  )

  const [draftFilters, setDraftFilters] =
    React.useState<OcupacionPotreroFilterState>(filters)

  const wasOpenRef = React.useRef(false)

  const potreroSelectItems = React.useMemo(() => {
    const base = potreros.map((p) => ({
      label: formatPotreroOptionLabel(p),
      value: String(p.id),
    }))
    if (
      item?.potrero_id &&
      !base.some((opt) => opt.value === String(item.potrero_id))
    ) {
      base.unshift({
        label: item.potrero_nombre?.trim() || `Potrero #${item.potrero_id}`,
        value: String(item.potrero_id),
      })
    }
    return base
  }, [potreros, item])

  const bovinoSingleSelectItems = React.useMemo(() => {
    const base = bovinos.map((b) => ({
      label: formatBovinoOptionLabel(b),
      value: b.id,
    }))
    if (item?.bovino_id && !base.some((opt) => opt.value === item.bovino_id)) {
      base.unshift({
        label: item.bovino_label?.trim() || `${item.bovino_id.slice(0, 8)}...`,
        value: item.bovino_id,
      })
    }
    return base
  }, [bovinos, item])

  const filteredBovinos = React.useMemo(() => {
    const activos = bovinos.filter(
      (b) => !b.condicion || b.condicion.toLowerCase() === "activo"
    )
    const term = bovinoSearch.trim().toLowerCase()
    if (!term) return activos
    return activos.filter((b) => {
      const arete = b.arete?.toLowerCase() ?? ""
      const nombre = b.nombre?.toLowerCase() ?? ""
      const cat = b.categoria?.toLowerCase() ?? ""
      return (
        arete.includes(term) || nombre.includes(term) || cat.includes(term)
      )
    })
  }, [bovinos, bovinoSearch])

  React.useEffect(() => {
    const justOpened = open && !wasOpenRef.current
    wasOpenRef.current = open

    if (!justOpened) return

    setValidationError(null)
    setBovinoSearch("")

    if ((mode === "edit" || mode === "view") && item) {
      setPotreroId(String(item.potrero_id))
      setSingleBovinoId(item.bovino_id)
      setSelectedBovinoIds([item.bovino_id])
      setFechaEntrada(toDateTimeLocalInput(item.fecha_entrada))
      setFechaSalida(
        item.fecha_salida ? toDateTimeLocalInput(item.fecha_salida) : ""
      )
      setAforo(
        item.aforo !== null && item.aforo !== undefined
          ? String(item.aforo)
          : ""
      )
    } else if (mode === "create") {
      setPotreroId(potreros[0] ? String(potreros[0].id) : "")
      setSelectedBovinoIds([])
      setSingleBovinoId("")
      setFechaEntrada(toDateTimeLocalInput())
      setFechaSalida("")
      setAforo("")
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
  }, [open, mode, item, potreros, filters])

  function toggleBovinoSelection(id: string) {
    setSelectedBovinoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSelectAllVisible() {
    const visibleIds = filteredBovinos.map((b) => b.id)
    setSelectedBovinoIds((prev) => {
      const set = new Set(prev)
      for (const id of visibleIds) set.add(id)
      return Array.from(set)
    })
  }

  function handleClearSelection() {
    setSelectedBovinoIds([])
  }

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)

    const potreroNum = Number(potreroId)
    if (!Number.isInteger(potreroNum) || potreroNum <= 0) {
      setValidationError("Debes seleccionar un potrero válido.")
      return
    }

    if (!fechaEntrada.trim()) {
      setValidationError("La fecha y hora de entrada son obligatorias.")
      return
    }

    const idsFinales = isCreate
      ? selectedBovinoIds
      : singleBovinoId
        ? [singleBovinoId]
        : []

    if (idsFinales.length === 0) {
      setValidationError(
        isCreate
          ? "Selecciona al menos un bovino para ingresar al potrero."
          : "Debes seleccionar un bovino."
      )
      return
    }

    if (fechaSalida.trim()) {
      const entradaMs = new Date(fechaEntrada).getTime()
      const salidaMs = new Date(fechaSalida).getTime()
      if (
        Number.isFinite(entradaMs) &&
        Number.isFinite(salidaMs) &&
        salidaMs < entradaMs
      ) {
        setValidationError(
          "La fecha de salida no puede ser anterior a la fecha de entrada."
        )
        return
      }
    }

    const aforoNum =
      aforo.trim() === "" ? null : Math.max(0, Number(aforo) || 0)

    const payload: OcupacionPotreroPayload = {
      potrero_id: potreroNum,
      bovino_id: idsFinales[0],
      bovino_ids: idsFinales,
      fecha_entrada: fechaEntrada.trim(),
      fecha_salida: fechaSalida.trim() ? fechaSalida.trim() : null,
      aforo: aforoNum,
    }

    try {
      if (mode === "create") {
        await onSave(payload, "create")
        onOpenChange(false)
      } else if (mode === "edit" && item) {
        await onSave(payload, "edit", item.id)
        onOpenChange(false)
      }
    } catch {
      // El error se notifica con toast en DataTable
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    onApplyFilters(draftFilters)
    onOpenChange(false)
  }

  function handleResetFilters() {
    const empty: OcupacionPotreroFilterState = {
      search: "",
      estado: "ALL",
      potrero_id: "ALL",
      fechaDesde: "",
      fechaHasta: "",
    }
    setDraftFilters(empty)
    onClearFilters()
    onOpenChange(false)
  }

  const drawerTitle =
    mode === "create"
      ? "Registrar ingreso a potrero"
      : mode === "edit"
        ? `Editar ocupación #${item?.id ?? ""}`
        : mode === "filter"
          ? "Filtrar historial de ocupación"
          : `Detalle de ocupación #${item?.id ?? ""}`

  const drawerDescription =
    mode === "create"
      ? "Selecciona el potrero y marca todos los bovinos que entran al mismo tiempo."
      : mode === "edit"
        ? "Actualiza las fechas, el potrero o el aforo del registro seleccionado."
        : mode === "filter"
          ? "Filtra por potrero, bovino, estado o rango de fechas."
          : "Consulta el detalle del movimiento registrado en el potrero."

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className={isMobile ? "max-h-[92vh]" : "sm:max-w-lg"}>
        {mode && (
          <>
            <DrawerHeader className="gap-1">
              <DrawerTitle>{drawerTitle}</DrawerTitle>
              <DrawerDescription>{drawerDescription}</DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
              {mode === "filter" ? (
                <form
                  id="ocupacion-filter-form"
                  onSubmit={handleFilterSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-ocupacion-search">
                      Buscar (Arete, nombre o potrero)
                    </Label>
                    <Input
                      id="filter-ocupacion-search"
                      placeholder="Ej. 0045, La Esperanza..."
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
                      <Label htmlFor="filter-ocupacion-potrero">Potrero</Label>
                      <Select
                        value={draftFilters.potrero_id}
                        onValueChange={(value) => {
                          const next = value ?? "ALL"
                          setDraftFilters((prev) =>
                            prev.potrero_id === next
                              ? prev
                              : { ...prev, potrero_id: next }
                          )
                        }}
                      >
                        <SelectTrigger
                          id="filter-ocupacion-potrero"
                          className="w-full"
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {potreroSelectItems.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-ocupacion-estado">Estado</Label>
                      <Select
                        value={draftFilters.estado}
                        onValueChange={(value) => {
                          const next =
                            (value as OcupacionPotreroFilterState["estado"]) ??
                            "ALL"
                          setDraftFilters((prev) =>
                            prev.estado === next
                              ? prev
                              : { ...prev, estado: next }
                          )
                        }}
                      >
                        <SelectTrigger
                          id="filter-ocupacion-estado"
                          className="w-full"
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="ACTIVA">En potrero</SelectItem>
                            <SelectItem value="FINALIZADA">
                              Finalizada
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-ocupacion-desde">
                        Entrada desde
                      </Label>
                      <Input
                        id="filter-ocupacion-desde"
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
                      <Label htmlFor="filter-ocupacion-hasta">
                        Entrada hasta
                      </Label>
                      <Input
                        id="filter-ocupacion-hasta"
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
                  id="ocupacion-record-form"
                  onSubmit={handleSaveSubmit}
                  className="flex flex-col gap-4"
                >
                  {validationError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {validationError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ocupacion-potrero">Potrero *</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={potreroId}
                        onValueChange={(value) => {
                          const next = value ?? ""
                          setPotreroId((prev) => (prev === next ? prev : next))
                        }}
                      >
                        <SelectTrigger id="ocupacion-potrero" className="w-full">
                          <SelectValue placeholder="Selecciona potrero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {potreroSelectItems.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ocupacion-aforo">Aforo (opcional)</Label>
                      <Input
                        id="ocupacion-aforo"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Ej. 2.5"
                        disabled={isReadOnly || isSubmitting}
                        value={aforo}
                        onChange={(e) => setAforo(e.target.value)}
                      />
                    </div>
                  </div>

                  {isCreate ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label>
                          Bovinos a ingresar *{" "}
                          <Badge variant="secondary" className="ml-1">
                            {selectedBovinoIds.length} seleccionado(s)
                          </Badge>
                        </Label>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={
                              isSubmitting || filteredBovinos.length === 0
                            }
                            onClick={handleSelectAllVisible}
                          >
                            <CheckSquareIcon className="mr-1 size-3.5" />
                            Marcar visibles
                          </Button>
                          {selectedBovinoIds.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground"
                              disabled={isSubmitting}
                              onClick={handleClearSelection}
                            >
                              <XIcon className="mr-1 size-3.5" />
                              Limpiar
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <SearchIcon className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar vaca por arete, nombre o categoría..."
                          className="pl-8"
                          disabled={isSubmitting}
                          value={bovinoSearch}
                          onChange={(e) => setBovinoSearch(e.target.value)}
                        />
                      </div>

                      <div className="max-h-56 overflow-y-auto rounded-lg border divide-y">
                        {filteredBovinos.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">
                            {bovinos.length === 0
                              ? "No hay bovinos disponibles."
                              : "Ningún bovino coincide con la búsqueda."}
                          </div>
                        ) : (
                          filteredBovinos.map((b) => {
                            const checked = selectedBovinoIds.includes(b.id)
                            return (
                              <label
                                key={b.id}
                                className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Checkbox
                                    checked={checked}
                                    disabled={isSubmitting}
                                    onCheckedChange={() =>
                                      toggleBovinoSelection(b.id)
                                    }
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium text-foreground">
                                      {b.arete}
                                      {b.nombre ? ` — ${b.nombre}` : ""}
                                    </span>
                                    {b.categoria && (
                                      <span className="text-xs text-muted-foreground">
                                        {b.categoria}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {checked && (
                                  <Badge
                                    variant="outline"
                                    className="text-[11px]"
                                  >
                                    Seleccionado
                                  </Badge>
                                )}
                              </label>
                            )
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ocupacion-bovino">Bovino *</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={singleBovinoId}
                        onValueChange={(value) => {
                          const next = value ?? ""
                          setSingleBovinoId((prev) =>
                            prev === next ? prev : next
                          )
                        }}
                      >
                        <SelectTrigger id="ocupacion-bovino" className="w-full">
                          <SelectValue placeholder="Selecciona bovino" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {bovinoSingleSelectItems.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ocupacion-entrada">
                        Fecha y hora entrada *
                      </Label>
                      <Input
                        id="ocupacion-entrada"
                        type="datetime-local"
                        disabled={isReadOnly || isSubmitting}
                        value={fechaEntrada}
                        onChange={(e) => setFechaEntrada(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ocupacion-salida">
                        Fecha y hora salida
                      </Label>
                      <Input
                        id="ocupacion-salida"
                        type="datetime-local"
                        disabled={isReadOnly || isSubmitting}
                        value={fechaSalida}
                        onChange={(e) => setFechaSalida(e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            <DrawerFooter className="gap-2">
              {mode === "filter" ? (
                <>
                  <Button type="submit" form="ocupacion-filter-form">
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
                    form="ocupacion-record-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : mode === "create"
                        ? selectedBovinoIds.length > 1
                          ? `Registrar (${selectedBovinoIds.length} bovinos)`
                          : "Registrar ocupación"
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

export function PotrerosOcupacionView({
  initialData,
  initialTotalCount = 0,
  permissions,
  potreros = [],
  bovinos = [],
  mapSlot,
}: {
  initialData: HistorialOcupacionPotrero[]
  initialTotalCount?: number
  permissions?: PermisosModulo
  potreros?: PotreroOption[]
  bovinos?: BovinoOption[]
  mapSlot?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      {mapSlot ? <div className="w-full">{mapSlot}</div> : null}
      <DataTable
        data={initialData}
        totalCount={initialTotalCount}
        permissions={permissions}
        potreros={potreros}
        bovinos={bovinos}
      />
    </div>
  )
}