"use client"

import * as React from "react"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import type { CajaRegistro } from "../actions/actions"
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

export const TIPO_CAJA_OPTIONS = [
  { label: "Ingreso", value: "ingreso" },
  { label: "Egreso", value: "egreso" },
] as const

export const CATEGORIA_INGRESO_OPTIONS = [
  { label: "Venta de leche", value: "Venta de leche" },
  { label: "Venta de ganado", value: "Venta de ganado" },
  { label: "Venta de terneros", value: "Venta de terneros" },
  { label: "Subproductos y quesos", value: "Subproductos y quesos" },
  { label: "Otros ingresos", value: "Otros ingresos" },
] as const

export const CATEGORIA_EGRESO_OPTIONS = [
  { label: "Concentrado y suplementos", value: "Concentrado y suplementos" },
  { label: "Medicamentos y sanidad", value: "Medicamentos y sanidad" },
  { label: "Mantenimiento de potreros", value: "Mantenimiento de potreros" },
  { label: "Salarios y jornales", value: "Salarios y jornales" },
  { label: "Insumos y herramientas", value: "Insumos y herramientas" },
  { label: "Servicios y transporte", value: "Servicios y transporte" },
  { label: "Otros egresos", value: "Otros egresos" },
] as const

export const METODO_PAGO_OPTIONS = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "Transferencia", value: "Transferencia" },
  { label: "Nequi", value: "Nequi" },
  { label: "Daviplata", value: "Daviplata" },
  { label: "Tarjeta", value: "Tarjeta" },
  { label: "Cheque", value: "Cheque" },
  { label: "Otro", value: "Otro" },
] as const

export const cajaSchema = z.object({
  id: z.string().uuid().optional(),
  tipo: z.enum(["ingreso", "egreso"]),
  categoria: z.string().min(1, "La categoría es obligatoria"),
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),
  valor_unitario: z.coerce
    .number()
    .positive("El valor unitario debe ser mayor a 0"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  metodo_pago: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  registrado_por: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
})

export interface CajaPayload {
  tipo: "ingreso" | "egreso"
  categoria: string
  cantidad: number
  valor_unitario: number
  monto: number
  fecha: string
  metodo_pago?: string | null
  descripcion?: string | null
}

export type CajaDrawerMode = "create" | "view" | "edit" | "filter" | null

export interface CajaFilterState {
  search: string
  tipo: string
  metodo_pago: string
  fechaDesde: string
  fechaHasta: string
}

function roundMoney(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.round(value * 100) / 100
}

function formatCOP(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safe)
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

function toIsoDateTime(localValue: string): string {
  const trimmed = localValue.trim()
  if (!trimmed) return new Date().toISOString()
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString()
  return parsed.toISOString()
}

function getCategoriasByTipo(tipo: "ingreso" | "egreso") {
  return tipo === "egreso"
    ? CATEGORIA_EGRESO_OPTIONS
    : CATEGORIA_INGRESO_OPTIONS
}

function createEmptyCaja(): CajaPayload {
  return {
    tipo: "ingreso",
    categoria: CATEGORIA_INGRESO_OPTIONS[0].value,
    cantidad: 1,
    valor_unitario: 0,
    monto: 0,
    fecha: toDateTimeLocalInput(),
    metodo_pago: "Efectivo",
    descripcion: "",
  }
}

interface CajaDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: CajaDrawerMode
  item: CajaRegistro | null
  isSubmitting?: boolean
  onSave: (
    values: CajaPayload,
    mode: "create" | "edit",
    existingId?: string
  ) => Promise<void> | void
  filters: CajaFilterState
  onApplyFilters: (nextFilters: CajaFilterState) => void
  onClearFilters: () => void
}

export function CajaDrawer({
  open,
  onOpenChange,
  mode,
  item,
  isSubmitting = false,
  onSave,
  filters,
  onApplyFilters,
  onClearFilters,
}: CajaDrawerProps) {
  const isMobile = useIsMobile()
  const isReadOnly = mode === "view"

  const [formValues, setFormValues] = React.useState<CajaPayload>(() =>
    createEmptyCaja()
  )
  const [draftFilters, setDraftFilters] =
    React.useState<CajaFilterState>(filters)

  const categoriaSelectItems = React.useMemo(() => {
    const base: { label: string; value: string }[] = [
      ...getCategoriasByTipo(formValues.tipo),
    ]
    if (
      formValues.categoria &&
      !base.some((opt) => opt.value === formValues.categoria)
    ) {
      base.unshift({
        label: formValues.categoria,
        value: formValues.categoria,
      })
    }
    return base
  }, [formValues.tipo, formValues.categoria])

  const metodoSelectItems = React.useMemo(() => {
    const base: { label: string; value: string }[] = [...METODO_PAGO_OPTIONS]
    if (
      item?.metodo_pago &&
      !base.some((opt) => opt.value === item.metodo_pago)
    ) {
      base.unshift({
        label: item.metodo_pago,
        value: item.metodo_pago,
      })
    }
    return base
  }, [item])

  React.useEffect(() => {
    if (!open) return

    if ((mode === "edit" || mode === "view") && item) {
      const tipoValido: "ingreso" | "egreso" =
        item.tipo === "egreso" ? "egreso" : "ingreso"
      const cantidadNum =
        Number.isFinite(Number(item.cantidad)) && Number(item.cantidad) >= 1
          ? Math.trunc(Number(item.cantidad))
          : 1
      const montoNum = Number(item.monto)
      const safeMonto =
        Number.isFinite(montoNum) && montoNum > 0 ? roundMoney(montoNum) : 0

      const itemUnitario = Number(
        (item as CajaRegistro & { valor_unitario?: number | null })
          .valor_unitario
      )
      const valorUnitarioNum =
        Number.isFinite(itemUnitario) && itemUnitario > 0
          ? roundMoney(itemUnitario)
          : safeMonto > 0
            ? roundMoney(safeMonto / cantidadNum)
            : 0

      const opcionesTipo = getCategoriasByTipo(tipoValido)
      const categoriaValida =
        item.categoria?.trim() || opcionesTipo[0].value

      setFormValues({
        tipo: tipoValido,
        categoria: categoriaValida,
        cantidad: cantidadNum,
        valor_unitario: valorUnitarioNum,
        monto: roundMoney(cantidadNum * valorUnitarioNum) || safeMonto,
        fecha: toDateTimeLocalInput(item.fecha),
        metodo_pago: item.metodo_pago || "Efectivo",
        descripcion: item.descripcion ?? "",
      })
    } else if (mode === "create") {
      setFormValues(createEmptyCaja())
    } else if (mode === "filter") {
      setDraftFilters(filters)
    }
  }, [open, mode, item, filters])

  function handleTipoChange(value: string | null) {
    const nextTipo: "ingreso" | "egreso" =
      value === "egreso" ? "egreso" : "ingreso"
    const opciones = getCategoriasByTipo(nextTipo)

    setFormValues((prev) => {
      const mantieneCategoria = opciones.some(
        (opt) => opt.value === prev.categoria
      )
      return {
        ...prev,
        tipo: nextTipo,
        categoria: mantieneCategoria ? prev.categoria : opciones[0].value,
      }
    })
  }

  function handleCantidadChange(rawValue: string) {
    const cantidadNum =
      rawValue === "" ? 1 : Math.max(1, Math.trunc(Number(rawValue) || 1))

    setFormValues((prev) => ({
      ...prev,
      cantidad: cantidadNum,
      monto: roundMoney(cantidadNum * prev.valor_unitario),
    }))
  }

  function handleValorUnitarioChange(rawValue: string) {
    const valorUnitarioNum =
      rawValue === "" ? 0 : Math.max(0, Number(rawValue) || 0)

    setFormValues((prev) => ({
      ...prev,
      valor_unitario: valorUnitarioNum,
      monto: roundMoney(prev.cantidad * valorUnitarioNum),
    }))
  }

  async function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault()

    const cantidadNum = Number.isFinite(Number(formValues.cantidad))
      ? Math.max(1, Math.trunc(Number(formValues.cantidad)))
      : 1
    const valorUnitarioNum = Number.isFinite(Number(formValues.valor_unitario))
      ? Math.max(0, Number(formValues.valor_unitario))
      : 0
    const montoCalculado = roundMoney(cantidadNum * valorUnitarioNum)

    const cleanPayload: CajaPayload = {
      tipo: formValues.tipo,
      categoria: formValues.categoria.trim(),
      cantidad: cantidadNum,
      valor_unitario: valorUnitarioNum,
      monto: montoCalculado,
      fecha: toIsoDateTime(formValues.fecha),
      metodo_pago: formValues.metodo_pago?.trim() || "Efectivo",
      descripcion: formValues.descripcion?.trim()
        ? formValues.descripcion.trim()
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
      // El error ya se notifica con toast en handleSaveCaja
    }
  }

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    onApplyFilters(draftFilters)
    onOpenChange(false)
  }

  function handleResetFilters() {
    const empty: CajaFilterState = {
      search: "",
      tipo: "ALL",
      metodo_pago: "ALL",
      fechaDesde: "",
      fechaHasta: "",
    }
    setDraftFilters(empty)
    onClearFilters()
    onOpenChange(false)
  }

  const drawerTitle =
    mode === "create"
      ? "Registrar movimiento de caja"
      : mode === "edit"
        ? `Editar movimiento · ${item?.categoria ?? ""}`
        : mode === "filter"
          ? "Filtrar movimientos de caja"
          : `Detalle de caja · ${item?.categoria ?? ""}`

  const drawerDescription =
    mode === "create"
      ? "Selecciona la categoría, ingresa cantidad y valor unitario para calcular el total."
      : mode === "edit"
        ? "Modifica los datos del movimiento; el total se recalcula automáticamente."
        : mode === "filter"
          ? "Filtra por categoría, descripción, tipo, método de pago o rango de fechas."
          : item?.tipo
            ? `Tipo: ${item.tipo === "ingreso" ? "Ingreso" : "Egreso"}`
            : "Consulta el detalle del movimiento registrado."

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
                  id="caja-filter-form"
                  onSubmit={handleFilterSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-caja-search">
                      Buscar (Categoría o Descripción)
                    </Label>
                    <Input
                      id="filter-caja-search"
                      placeholder="Ej. Venta de leche, Concentrado, Veterinario..."
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
                      <Label htmlFor="filter-caja-tipo">Tipo</Label>
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
                          ...TIPO_CAJA_OPTIONS,
                        ]}
                      >
                        <SelectTrigger id="filter-caja-tipo" className="w-full">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {TIPO_CAJA_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="filter-caja-metodo">Método de pago</Label>
                      <Select
                        value={draftFilters.metodo_pago}
                        onValueChange={(value) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            metodo_pago: value ?? "ALL",
                          }))
                        }
                        items={[
                          { label: "Todos", value: "ALL" },
                          ...METODO_PAGO_OPTIONS,
                        ]}
                      >
                        <SelectTrigger
                          id="filter-caja-metodo"
                          className="w-full"
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {METODO_PAGO_OPTIONS.map((opt) => (
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
                      <Label htmlFor="filter-caja-desde">Desde</Label>
                      <Input
                        id="filter-caja-desde"
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
                      <Label htmlFor="filter-caja-hasta">Hasta</Label>
                      <Input
                        id="filter-caja-hasta"
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
                  id="caja-record-form"
                  onSubmit={handleSaveSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="caja-tipo">Tipo *</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.tipo}
                        onValueChange={handleTipoChange}
                        items={TIPO_CAJA_OPTIONS}
                      >
                        <SelectTrigger id="caja-tipo" className="w-full">
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {TIPO_CAJA_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="caja-categoria">Categoría *</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.categoria}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            categoria: value ?? categoriaSelectItems[0].value,
                          }))
                        }
                        items={categoriaSelectItems}
                      >
                        <SelectTrigger id="caja-categoria" className="w-full">
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {categoriaSelectItems.map((opt) => (
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
                      <Label htmlFor="caja-cantidad">Cantidad *</Label>
                      <Input
                        id="caja-cantidad"
                        type="number"
                        min="1"
                        step="1"
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.cantidad}
                        onChange={(e) => handleCantidadChange(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="caja-valor-unitario">
                        Valor unitario *
                      </Label>
                      <Input
                        id="caja-valor-unitario"
                        type="number"
                        min="0.01"
                        step="0.01"
                        disabled={isReadOnly || isSubmitting}
                        placeholder="0.00"
                        value={formValues.valor_unitario}
                        onChange={(e) =>
                          handleValorUnitarioChange(e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Total ({formValues.cantidad} ×{" "}
                        {formatCOP(formValues.valor_unitario)})
                      </span>
                      <span className="text-base font-semibold tabular-nums">
                        {formatCOP(formValues.monto)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="caja-fecha">Fecha y hora *</Label>
                      <Input
                        id="caja-fecha"
                        type="datetime-local"
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
                      <Label htmlFor="caja-metodo">Método de pago</Label>
                      <Select
                        disabled={isReadOnly || isSubmitting}
                        value={formValues.metodo_pago || "Efectivo"}
                        onValueChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            metodo_pago: value ?? "Efectivo",
                          }))
                        }
                        items={metodoSelectItems}
                      >
                        <SelectTrigger id="caja-metodo" className="w-full">
                          <SelectValue placeholder="Efectivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {metodoSelectItems.map((opt) => (
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
                    <Label htmlFor="caja-descripcion">Descripción</Label>
                    <Input
                      id="caja-descripcion"
                      disabled={isReadOnly || isSubmitting}
                      placeholder="Detalle adicional del ingreso o gasto..."
                      value={formValues.descripcion ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          descripcion: e.target.value,
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
                  <Button type="submit" form="caja-filter-form">
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
                    form="caja-record-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : mode === "create"
                        ? "Guardar movimiento"
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