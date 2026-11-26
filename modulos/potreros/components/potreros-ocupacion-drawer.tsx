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
import {
  CheckSquareIcon,
  LogOutIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

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

export interface SalidaPotreroLotePayload {
  potrero_id: number
  ocupacion_ids: number[]
  bovino_ids: string[]
  fecha_salida: string
}

export type OcupacionPotreroDrawerMode =
  | "create"
  | "edit"
  | "view"
  | "filter"
  | "exit"
  | null

export interface OcupacionPotreroFilterState {
  search: string
  estado: "ALL" | "ACTIVA" | "FINALIZADA"
  potrero_id: string
  fechaDesde: string
  fechaHasta: string
}

function formatLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toDateTimeLocalInput(isoOrDate?: string | null): string {
  if (!isoOrDate) {
    return formatLocalDateTime(new Date())
  }
  // Si ya viene en formato YYYY-MM-DDTHH:mm o YYYY-MM-DD HH:mm:ss sin zona, preservar hora local
  const trimmed = isoOrDate.trim()
  const matchLocal = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?(?!Z|[+-]\d{2}:?\d{2})/i
  )
  if (matchLocal) {
    return `${matchLocal[1]}T${matchLocal[2]}`
  }
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return formatLocalDateTime(new Date())
  }
  return formatLocalDateTime(parsed)
}

function formatFechaCorta(value?: string | null): string {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  })
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
  ocupacionesActivas?: HistorialOcupacionPotrero[]
  isSubmitting?: boolean
  onSave: (
    values: OcupacionPotreroPayload,
    mode: "create" | "edit",
    existingId?: number
  ) => Promise<void> | void
  onExitPotrero?: (values: SalidaPotreroLotePayload) => Promise<void> | void
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
  ocupacionesActivas = [],
  isSubmitting = false,
  onSave,
  onExitPotrero,
  filters,
  onApplyFilters,
  onClearFilters,
}: OcupacionPotreroDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"
  const isCreate = mode === "create"
  const isExit = mode === "exit"

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
  const initializedExitSelectionRef = React.useRef(false)

  const bovinosById = React.useMemo(() => {
    const map = new Map<string, BovinoOption>()
    for (const b of bovinos) {
      map.set(b.id, b)
    }
    return map
  }, [bovinos])

  const animalesEnPotreroSeleccionado = React.useMemo(() => {
    const pNum = Number(potreroId)
    if (!Number.isInteger(pNum) || pNum <= 0) return []

    return ocupacionesActivas
      .filter((oc) => Number(oc.potrero_id) === pNum && !oc.fecha_salida)
      .map((oc) => {
        const b = bovinosById.get(oc.bovino_id)
        const arete =
          b?.arete?.trim() ||
          oc.bovino_label?.split("—")[0]?.trim() ||
          oc.bovino_id.slice(0, 8)
        const nombre =
          b?.nombre?.trim() ||
          oc.bovino_label?.split("—").slice(1).join("—").trim() ||
          null
        const categoria = b?.categoria?.trim() || null
        return {
          ocupacionId: oc.id,
          bovinoId: oc.bovino_id,
          arete,
          nombre,
          categoria,
          fechaEntrada: oc.fecha_entrada,
        }
      })
  }, [potreroId, ocupacionesActivas, bovinosById])

  const filteredAnimalesEnPotrero = React.useMemo(() => {
    const term = bovinoSearch.trim().toLowerCase()
    if (!term) return animalesEnPotreroSeleccionado
    return animalesEnPotreroSeleccionado.filter((a) => {
      return (
        a.arete.toLowerCase().includes(term) ||
        (a.nombre?.toLowerCase().includes(term) ?? false) ||
        (a.categoria?.toLowerCase().includes(term) ?? false)
      )
    })
  }, [animalesEnPotreroSeleccionado, bovinoSearch])

  const potreroSelectItems = React.useMemo(() => {
    if (isExit) {
      const conteoPorPotrero = new Map<number, number>()
      for (const oc of ocupacionesActivas) {
        if (!oc.fecha_salida) {
          const idNum = Number(oc.potrero_id)
          conteoPorPotrero.set(idNum, (conteoPorPotrero.get(idNum) ?? 0) + 1)
        }
      }

      if (potreros.length > 0) {
        return potreros.map((p) => {
          const cant = conteoPorPotrero.get(Number(p.id)) ?? 0
          const baseLabel = formatPotreroOptionLabel(p)
          return {
            label: `${baseLabel} — ${cant} ${cant === 1 ? "animal" : "animales"}`,
            value: String(p.id),
          }
        })
      }

      return Array.from(conteoPorPotrero.entries()).map(([idNum, cant]) => ({
        label: `Potrero #${idNum} — ${cant} ${cant === 1 ? "animal" : "animales"}`,
        value: String(idNum),
      }))
    }

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
  }, [potreros, item, isExit, ocupacionesActivas])

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

  const aplicarPotreroExit = React.useCallback(
    (nextPotreroId: string, sourceActivas: HistorialOcupacionPotrero[]) => {
      setPotreroId(nextPotreroId)
      setBovinoSearch("")
      setValidationError(null)

      const pNum = Number(nextPotreroId)
      if (!Number.isInteger(pNum) || pNum <= 0) {
        setSelectedBovinoIds([])
        return
      }

      const idsEnEsePotrero = sourceActivas
        .filter((oc) => Number(oc.potrero_id) === pNum && !oc.fecha_salida)
        .map((oc) => oc.bovino_id)

      setSelectedBovinoIds(Array.from(new Set(idsEnEsePotrero)))
    },
    []
  )

  // Inicialización única al abrir el drawer (nunca resetea fechas mientras está abierto)
  React.useEffect(() => {
    const justOpened = open && !wasOpenRef.current
    wasOpenRef.current = open

    if (!open) {
      initializedExitSelectionRef.current = false
      return
    }

    if (!justOpened) return

    setValidationError(null)
    setBovinoSearch("")
    initializedExitSelectionRef.current = false

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
    } else if (mode === "exit") {
      setFechaSalida(toDateTimeLocalInput())

      const conteo = new Map<number, number>()
      for (const oc of ocupacionesActivas) {
        if (!oc.fecha_salida) {
          const idNum = Number(oc.potrero_id)
          conteo.set(idNum, (conteo.get(idNum) ?? 0) + 1)
        }
      }

      const potreroConAnimales = potreros.find(
        (p) => (conteo.get(Number(p.id)) ?? 0) > 0
      )
      const chosenId = potreroConAnimales
        ? String(potreroConAnimales.id)
        : potreros[0]
          ? String(potreros[0].id)
          : ""

      aplicarPotreroExit(chosenId, ocupacionesActivas)
      if (ocupacionesActivas.length > 0) {
        initializedExitSelectionRef.current = true
      }
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode])

  // Sincroniza potrero y animales marcados cuando ocupacionesActivas llega tarde, sin tocar fechaSalida
  React.useEffect(() => {
    if (!open || mode !== "exit" || initializedExitSelectionRef.current) return
    if (ocupacionesActivas.length === 0) return

    initializedExitSelectionRef.current = true

    const conteo = new Map<number, number>()
    for (const oc of ocupacionesActivas) {
      if (!oc.fecha_salida) {
        const idNum = Number(oc.potrero_id)
        conteo.set(idNum, (conteo.get(idNum) ?? 0) + 1)
      }
    }

    const potreroConAnimales = potreros.find(
      (p) => (conteo.get(Number(p.id)) ?? 0) > 0
    )
    const chosenId = potreroConAnimales
      ? String(potreroConAnimales.id)
      : potreros[0]
        ? String(potreros[0].id)
        : ""

    aplicarPotreroExit(chosenId, ocupacionesActivas)
  }, [open, mode, ocupacionesActivas, potreros, aplicarPotreroExit])

  function toggleBovinoSelection(id: string) {
    setSelectedBovinoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSelectAllCreate() {
    const visibleIds = filteredBovinos.map((b) => b.id)
    setSelectedBovinoIds((prev) => {
      const set = new Set(prev)
      for (const id of visibleIds) set.add(id)
      return Array.from(set)
    })
  }

  function handleSelectAllExit() {
    const allIds = animalesEnPotreroSeleccionado.map((a) => a.bovinoId)
    setSelectedBovinoIds(Array.from(new Set(allIds)))
  }

  function handleClearSelection() {
    setSelectedBovinoIds([])
  }

  async function handleExitSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)

    const potreroNum = Number(potreroId)
    if (!Number.isInteger(potreroNum) || potreroNum <= 0) {
      setValidationError("Debes seleccionar un potrero válido.")
      return
    }

    if (selectedBovinoIds.length === 0) {
      setValidationError(
        "Selecciona al menos un animal para sacar del potrero."
      )
      return
    }

    if (!fechaSalida.trim()) {
      setValidationError("La fecha y hora de salida son obligatorias.")
      return
    }

    const ocupacionIdsSeleccionadas = animalesEnPotreroSeleccionado
      .filter((a) => selectedBovinoIds.includes(a.bovinoId))
      .map((a) => a.ocupacionId)

    const payload: SalidaPotreroLotePayload = {
      potrero_id: potreroNum,
      ocupacion_ids: ocupacionIdsSeleccionadas,
      bovino_ids: selectedBovinoIds,
      fecha_salida: fechaSalida.trim(),
    }

    try {
      await onExitPotrero?.(payload)
      onOpenChange(false)
    } catch {
      // El error se notifica con toast en DataTable
    }
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
      : mode === "exit"
        ? "Sacar animales del potrero"
        : mode === "edit"
          ? `Editar ocupación #${item?.id ?? ""}`
          : mode === "filter"
            ? "Filtrar historial de ocupación"
            : `Detalle de ocupación #${item?.id ?? ""}`

  const drawerDescription =
    mode === "create"
      ? "Selecciona el potrero y marca todos los bovinos que entran al mismo tiempo."
      : mode === "exit"
        ? "Selecciona el potrero para ver todos los animales que están adentro y sacarlos todos de una vez."
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
              ) : isExit ? (
                <form
                  id="ocupacion-exit-form"
                  onSubmit={handleExitSubmit}
                  className="flex flex-col gap-4"
                >
                  {validationError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {validationError}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="exit-potrero-select">Potrero *</Label>
                    <Select
                      disabled={isSubmitting}
                      value={potreroId}
                      onValueChange={(value) => {
                        if (value) {
                          aplicarPotreroExit(value, ocupacionesActivas)
                        }
                      }}
                    >
                      <SelectTrigger id="exit-potrero-select" className="w-full">
                        <SelectValue placeholder="Selecciona un potrero" />
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
                    <Label htmlFor="exit-fecha-salida">
                      Fecha y hora de salida *
                    </Label>
                    <Input
                      id="exit-fecha-salida"
                      type="datetime-local"
                      disabled={isSubmitting}
                      value={fechaSalida}
                      onChange={(e) => setFechaSalida(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label>
                        Animales en el potrero ({animalesEnPotreroSeleccionado.length}){" "}
                        <Badge variant="secondary" className="ml-1">
                          {selectedBovinoIds.length} a sacar
                        </Badge>
                      </Label>

                      <div className="flex items-center gap-1">
                        {animalesEnPotreroSeleccionado.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={isSubmitting}
                            onClick={handleSelectAllExit}
                          >
                            <CheckSquareIcon className="mr-1 size-3.5" />
                            Marcar todos
                          </Button>
                        )}
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
                            Ninguno
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <SearchIcon className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Filtrar animales en este potrero..."
                        className="pl-8"
                        disabled={
                          isSubmitting ||
                          animalesEnPotreroSeleccionado.length === 0
                        }
                        value={bovinoSearch}
                        onChange={(e) => setBovinoSearch(e.target.value)}
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-lg border divide-y">
                      {filteredAnimalesEnPotrero.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          {animalesEnPotreroSeleccionado.length === 0
                            ? "Este potrero no tiene animales activos en este momento."
                            : "Ningún animal en este potrero coincide con el filtro."}
                        </div>
                      ) : (
                        filteredAnimalesEnPotrero.map((a) => {
                          const checked = selectedBovinoIds.includes(a.bovinoId)
                          return (
                            <label
                              key={a.ocupacionId}
                              className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 hover:bg-muted/50"
                            >
                              <div className="flex items-center gap-2.5">
                                <Checkbox
                                  checked={checked}
                                  disabled={isSubmitting}
                                  onCheckedChange={() =>
                                    toggleBovinoSelection(a.bovinoId)
                                  }
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">
                                    {a.arete}
                                    {a.nombre ? ` — ${a.nombre}` : ""}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {a.categoria ? `${a.categoria} · ` : ""}
                                    Entró: {formatFechaCorta(a.fechaEntrada)}
                                  </span>
                                </div>
                              </div>
                              {checked && (
                                <Badge variant="outline" className="text-[11px]">
                                  Sacar
                                </Badge>
                              )}
                            </label>
                          )
                        })
                      )}
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
                            onClick={handleSelectAllCreate}
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
              ) : isExit ? (
                <>
                  <Button
                    type="submit"
                    form="ocupacion-exit-form"
                    disabled={isSubmitting || selectedBovinoIds.length === 0}
                  >
                    <LogOutIcon className="mr-1.5 size-4" />
                    {isSubmitting
                      ? "Sacando..."
                      : selectedBovinoIds.length > 0
                        ? `Sacar todos (${selectedBovinoIds.length})`
                        : "Sacar todos"}
                  </Button>
                  <DrawerClose
                    render={<Button variant="outline" disabled={isSubmitting} />}
                  >
                    Cancelar
                  </DrawerClose>
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
  ocupacionesActivas,
  mapSlot,
}: {
  initialData: HistorialOcupacionPotrero[]
  initialTotalCount?: number
  permissions?: PermisosModulo
  potreros?: PotreroOption[]
  bovinos?: BovinoOption[]
  ocupacionesActivas?: HistorialOcupacionPotrero[]
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
        ocupacionesActivas={ocupacionesActivas}
      />
    </div>
  )
}