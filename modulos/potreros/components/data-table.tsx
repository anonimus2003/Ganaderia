"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  FlexRender,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import type { PermisosModulo } from "@/lib/permisos"
import {
  createOcupacionPotreroAction,
  deleteOcupacionPotreroAction,
  fetchCatalogosOcupacionPotreroAction,
  fetchOcupacionesActivasPotreroAction,
  fetchOcupacionPotrerosPageAction,
  sacarTodosPotreroAction,
  updateOcupacionPotreroAction,
} from "../actions/actions"
import {
  OcupacionPotreroDrawer,
  ocupacionPotreroSchema,
  type BovinoOption,
  type OcupacionPotreroDrawerMode,
  type OcupacionPotreroFilterState,
  type OcupacionPotreroPayload,
  type PotreroOption,
  type SalidaPotreroLotePayload,
} from "@/modulos/potreros/components/potreros-ocupacion-drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  GripVerticalIcon,
  CircleCheckIcon,
  CircleDotIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  LogOutIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FileDown,
  Funnel,
  Loader2Icon,
} from "lucide-react"

export { ocupacionPotreroSchema }

export interface HistorialOcupacionPotrero {
  id: number
  potrero_id: number
  bovino_id: string
  fecha_entrada: string
  fecha_salida: string | null
  registrado_por: string | null
  aforo: number | string | null
  created_at?: string | null
  potrero_nombre?: string | null
  bovino_label?: string | null
  registrado_por_nombre?: string | null
}

type OcupacionRow = HistorialOcupacionPotrero

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, OcupacionRow>()

const DEFAULT_FILTERS: OcupacionPotreroFilterState = {
  search: "",
  estado: "ALL",
  potrero_id: "ALL",
  fechaDesde: "",
  fechaHasta: "",
}

function formatFechaHora(value?: string | null): string {
  if (!value) return "—"
  const trimmed = value.trim()

  const naiveMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  )
  if (naiveMatch) {
    const [, y, m, d, hh, mm] = naiveMatch
    const hour24 = Number(hh)
    const minute = Number(mm)
    const ampm = hour24 >= 12 ? "p. m." : "a. m."
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
    const yy = y.slice(-2)
    return `${d}/${m}/${yy}, ${hour12}:${String(minute).padStart(2, "0")} ${ampm}`
  }

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return trimmed
  return parsed.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "short",
    timeStyle: "short",
  })
}

function formatAforo(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return "—"
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value)
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

function getPotreroLabel(row: OcupacionRow): string {
  if (row.potrero_nombre?.trim()) return row.potrero_nombre.trim()
  return `Potrero #${row.potrero_id}`
}

function getBovinoLabel(row: OcupacionRow): string {
  if (row.bovino_label?.trim()) return row.bovino_label.trim()
  if (row.bovino_id?.trim()) return `${row.bovino_id.slice(0, 8)}...`
  return "—"
}

function getRegistradorLabel(row: OcupacionRow): string {
  if (row.registrado_por_nombre?.trim()) {
    return row.registrado_por_nombre.trim()
  }
  if (row.registrado_por?.trim()) {
    return `${row.registrado_por.slice(0, 8)}...`
  }
  return "—"
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value).replace(/"/g, '""')
  if (
    str.includes(";") ||
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str}"`
  }
  return str
}

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Arrastrar para reordenar</span>
    </Button>
  )
}

function DraggableRow({ row }: { row: Row<typeof features, OcupacionRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
  totalCount: initialTotalCount = 0,
  permissions,
  potreros: initialPotreros = [],
  bovinos: initialBovinos = [],
  ocupacionesActivas: initialOcupacionesActivas = [],
}: {
  data: OcupacionRow[]
  totalCount?: number
  permissions?: PermisosModulo
  potreros?: PotreroOption[]
  bovinos?: BovinoOption[]
  ocupacionesActivas?: HistorialOcupacionPotrero[]
}) {
  const canCreate = permissions?.canCreate ?? true
  const canEdit = permissions?.canEdit ?? true
  const canDelete = permissions?.canDelete ?? true

  const [data, setData] = React.useState<OcupacionRow[]>(
    () => initialData ?? []
  )
  const [totalCount, setTotalCount] = React.useState<number>(
    initialTotalCount || (initialData?.length ?? 0)
  )
  const [isLoadingPage, setIsLoadingPage] = React.useState(false)

  const [potrerosCatalogo, setPotrerosCatalogo] = React.useState<
    PotreroOption[]
  >(() => initialPotreros)
  const [bovinosCatalogo, setBovinosCatalogo] = React.useState<
    BovinoOption[]
  >(() => initialBovinos)
  const [ocupacionesActivas, setOcupacionesActivas] = React.useState<
    OcupacionRow[]
  >(() => initialOcupacionesActivas ?? [])

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState({})

  const [itemToDelete, setItemToDelete] = React.useState<OcupacionRow | null>(
    null
  )
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({
      registrado_por: false,
      created_at: false,
    })

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [drawerMode, setDrawerMode] =
    React.useState<OcupacionPotreroDrawerMode>(null)
  const [selectedItem, setSelectedItem] = React.useState<OcupacionRow | null>(
    null
  )
  const [filters, setFilters] =
    React.useState<OcupacionPotreroFilterState>(DEFAULT_FILTERS)

  const isInitialMount = React.useRef(true)
  const prevInitialDataKeyRef = React.useRef("")
  const prevPotrerosKeyRef = React.useRef("")
  const prevBovinosKeyRef = React.useRef("")
  const prevActivasKeyRef = React.useRef("")

  React.useEffect(() => {
    const next = initialData ?? []
    const nextKey = `${initialTotalCount}|${next
      .map((r) => `${r.id}:${r.fecha_salida ?? ""}:${r.potrero_id}`)
      .join(",")}`
    if (nextKey !== prevInitialDataKeyRef.current) {
      prevInitialDataKeyRef.current = nextKey
      setData(next)
      setTotalCount(initialTotalCount || next.length)
    }
  }, [initialData, initialTotalCount])

  React.useEffect(() => {
    const nextKey = initialPotreros
      .map((p) => `${p.id}:${p.nombre}`)
      .join("|")
    if (initialPotreros.length > 0 && nextKey !== prevPotrerosKeyRef.current) {
      prevPotrerosKeyRef.current = nextKey
      setPotrerosCatalogo(initialPotreros)
    }
  }, [initialPotreros])

  React.useEffect(() => {
    const nextKey = initialBovinos
      .map((b) => `${b.id}:${b.arete}`)
      .join("|")
    if (initialBovinos.length > 0 && nextKey !== prevBovinosKeyRef.current) {
      prevBovinosKeyRef.current = nextKey
      setBovinosCatalogo(initialBovinos)
    }
  }, [initialBovinos])

  React.useEffect(() => {
    const next = initialOcupacionesActivas ?? []
    const nextKey = next
      .map((x) => `${x.id}:${x.fecha_salida ?? ""}:${x.potrero_id}`)
      .join("|")
    if (nextKey !== prevActivasKeyRef.current) {
      prevActivasKeyRef.current = nextKey
      setOcupacionesActivas(next)
    }
  }, [initialOcupacionesActivas])

  const refreshOcupacionesActivas = React.useCallback(async () => {
    const res = await fetchOcupacionesActivasPotreroAction()
    if (!res.error) {
      const next = res.items ?? []
      prevActivasKeyRef.current = next
        .map((x) => `${x.id}:${x.fecha_salida ?? ""}:${x.potrero_id}`)
        .join("|")
      setOcupacionesActivas(next)
    }
  }, [])

  React.useEffect(() => {
    if (!drawerOpen || !drawerMode) return

    let active = true

    if (potrerosCatalogo.length === 0 || bovinosCatalogo.length === 0) {
      void fetchCatalogosOcupacionPotreroAction().then((res) => {
        if (!active || res.error) return
        if (res.potreros.length > 0) setPotrerosCatalogo(res.potreros)
        if (res.bovinos.length > 0) setBovinosCatalogo(res.bovinos)
      })
    }

    if (drawerMode === "exit") {
      void fetchOcupacionesActivasPotreroAction().then((res) => {
        if (!active || res.error) return
        const next = res.items ?? []
        prevActivasKeyRef.current = next
          .map((x) => `${x.id}:${x.fecha_salida ?? ""}:${x.potrero_id}`)
          .join("|")
        setOcupacionesActivas(next)
      })
    }

    return () => {
      active = false
    }
  }, [
    drawerOpen,
    drawerMode,
    potrerosCatalogo.length,
    bovinosCatalogo.length,
  ])

  const loadPage = React.useCallback(
    async (
      nextPageIndex: number,
      nextPageSize: number,
      nextFilters: OcupacionPotreroFilterState
    ) => {
      setIsLoadingPage(true)
      try {
        const res = await fetchOcupacionPotrerosPageAction({
          pageIndex: nextPageIndex,
          pageSize: nextPageSize,
          filters: nextFilters,
        })
        if (res.error) {
          toast.error(res.error)
          return
        }
        setData(res.items ?? [])
        setTotalCount(res.totalCount ?? 0)
      } finally {
        setIsLoadingPage(false)
      }
    },
    []
  )

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    void loadPage(pagination.pageIndex, pagination.pageSize, filters)
  }, [pagination.pageIndex, pagination.pageSize, filters, loadPage])

  const openDrawer = React.useCallback(
    (
      mode: Exclude<OcupacionPotreroDrawerMode, null>,
      item: OcupacionRow | null = null
    ) => {
      if (mode === "create" && !canCreate) {
        toast.error("No tienes permiso para registrar ocupación de potreros")
        return
      }
      if ((mode === "edit" || mode === "exit") && !canEdit) {
        toast.error("No tienes permiso para actualizar ocupación de potreros")
        return
      }
      setDrawerMode(mode)
      setSelectedItem(item)
      setDrawerOpen(true)
    },
    [canCreate, canEdit]
  )

  const handleSaveOcupacion = React.useCallback(
    async (
      values: OcupacionPotreroPayload,
      mode: "create" | "edit",
      existingId?: number
    ) => {
      if (mode === "create" && !canCreate) {
        toast.error("No tienes permiso para registrar ocupación de potreros")
        return
      }
      if (mode === "edit" && !canEdit) {
        toast.error("No tienes permiso para actualizar ocupación de potreros")
        return
      }

      setIsSubmitting(true)
      try {
        if (mode === "create") {
          const {
            data: inserted,
            createdCount,
            error,
          } = await createOcupacionPotreroAction(values)
          if (error || !inserted) {
            toast.error(error ?? "No se pudo registrar la ocupación")
            throw new Error(error ?? "Error al crear")
          }
          const countCreated = createdCount ?? 1
          toast.success(
            countCreated > 1
              ? `${countCreated} bovinos registrados en ${getPotreroLabel(inserted)}`
              : `Ocupación en ${getPotreroLabel(inserted)} registrada`
          )
          await Promise.all([
            loadPage(0, pagination.pageSize, filters),
            refreshOcupacionesActivas(),
          ])
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        } else if (mode === "edit" && typeof existingId === "number") {
          const { data: updated, error } = await updateOcupacionPotreroAction(
            existingId,
            values
          )
          if (error || !updated) {
            toast.error(error ?? "No se pudo actualizar la ocupación")
            throw new Error(error ?? "Error al actualizar")
          }
          setData((prev) =>
            prev.map((row) =>
              row.id === existingId
                ? {
                    ...updated,
                    registrado_por_nombre:
                      updated.registrado_por_nombre ??
                      row.registrado_por_nombre,
                  }
                : row
            )
          )
          await refreshOcupacionesActivas()
          toast.success(`Ocupación #${existingId} actualizada`)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      canCreate,
      canEdit,
      loadPage,
      pagination.pageSize,
      filters,
      refreshOcupacionesActivas,
    ]
  )

  const handleExitPotrero = React.useCallback(
    async (values: SalidaPotreroLotePayload) => {
      if (!canEdit) {
        toast.error("No tienes permiso para registrar salida de potreros")
        return
      }

      setIsSubmitting(true)
      try {
        const res = await sacarTodosPotreroAction(values)
        if (!res.ok) {
          toast.error(res.error ?? "No se pudo sacar los animales del potrero")
          throw new Error(res.error ?? "Error al sacar animales")
        }

        const potreroNombre =
          potrerosCatalogo.find((p) => Number(p.id) === values.potrero_id)
            ?.nombre ?? `Potrero #${values.potrero_id}`

        toast.success(
          `Salida registrada para ${res.updatedCount} animal(es) de ${potreroNombre}`
        )

        await Promise.all([
          loadPage(pagination.pageIndex, pagination.pageSize, filters),
          refreshOcupacionesActivas(),
        ])
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      canEdit,
      potrerosCatalogo,
      loadPage,
      pagination.pageIndex,
      pagination.pageSize,
      filters,
      refreshOcupacionesActivas,
    ]
  )

  const confirmDeleteOcupacion = React.useCallback(async () => {
    if (!itemToDelete) return
    if (!canDelete) {
      toast.error("No tienes permiso para eliminar registros de ocupación")
      setItemToDelete(null)
      return
    }

    setIsDeleting(true)
    try {
      const { ok, error } = await deleteOcupacionPotreroAction(
        itemToDelete.id
      )
      if (!ok) {
        toast.error(error ?? "No se pudo eliminar el registro")
        return
      }
      toast.success(`Registro de ocupación #${itemToDelete.id} eliminado`)
      setItemToDelete(null)
      await Promise.all([
        loadPage(pagination.pageIndex, pagination.pageSize, filters),
        refreshOcupacionesActivas(),
      ])
    } finally {
      setIsDeleting(false)
    }
  }, [
    itemToDelete,
    canDelete,
    loadPage,
    pagination.pageIndex,
    pagination.pageSize,
    filters,
    refreshOcupacionesActivas,
  ])

  const handleApplyFilters = React.useCallback(
    (nextFilters: OcupacionPotreroFilterState) => {
      setFilters(nextFilters)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    []
  )

  const handleClearFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [])

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "drag",
          header: () => null,
          cell: ({ row }) => <DragHandle id={row.original.id} />,
        }),
        columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={
                  table.getIsSomePageRowsSelected() &&
                  !table.getIsAllPageRowsSelected()
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Seleccionar todos"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        }),
        columnHelper.accessor("potrero_id", {
          header: "Potrero",
          cell: ({ row }) => (
            <Button
              variant="link"
              className="w-fit px-0 font-semibold text-left text-foreground"
              onClick={() => openDrawer("view", row.original)}
            >
              {getPotreroLabel(row.original)}
            </Button>
          ),
          enableHiding: false,
        }),
        columnHelper.accessor("bovino_id", {
          header: "Bovino",
          cell: ({ row }) => <span>{getBovinoLabel(row.original)}</span>,
          enableHiding: false,
        }),
        columnHelper.accessor("fecha_entrada", {
          header: "Entrada",
          cell: ({ row }) => (
            <span className="text-muted-foreground">
              {formatFechaHora(row.original.fecha_entrada)}
            </span>
          ),
        }),
        columnHelper.accessor("fecha_salida", {
          header: "Salida",
          cell: ({ row }) => (
            <span className="text-muted-foreground">
              {formatFechaHora(row.original.fecha_salida)}
            </span>
          ),
        }),
        columnHelper.display({
          id: "estado",
          header: "Estado",
          cell: ({ row }) => {
            const enPotrero = !row.original.fecha_salida
            return (
              <Badge
                variant="outline"
                className="gap-1 px-1.5 text-muted-foreground"
              >
                {enPotrero ? (
                  <CircleDotIcon className="size-3.5 text-green-500" />
                ) : (
                  <CircleCheckIcon className="size-3.5 text-muted-foreground" />
                )}
                {enPotrero ? "En potrero" : "Finalizada"}
              </Badge>
            )
          },
        }),
        columnHelper.accessor("aforo", {
          header: "Aforo",
          cell: ({ row }) => (
            <span className="tabular-nums font-medium">
              {formatAforo(row.original.aforo)}
            </span>
          ),
        }),
        columnHelper.accessor("registrado_por", {
          header: "Registrado por",
          cell: ({ row }) => (
            <span className="text-sm">{getRegistradorLabel(row.original)}</span>
          ),
        }),
        columnHelper.accessor("created_at", {
          header: "Creado",
          cell: ({ row }) => (
            <span>
              {row.original.created_at
                ? new Date(row.original.created_at).toLocaleDateString("es-CO", {
                    timeZone: "America/Bogota",
                  })
                : "—"}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="flex size-8 text-muted-foreground data-open:bg-muted"
                    size="icon"
                  />
                }
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">Abrir menú</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => openDrawer("view", row.original)}>
                  Ver
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => openDrawer("edit", row.original)}
                  >
                    Editar
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setItemToDelete(row.original)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    [openDrawer, canEdit, canDelete]
  )

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const pageCount = Math.max(1, Math.ceil(totalCount / pagination.pageSize))
  const canPreviousPage = pagination.pageIndex > 0 && !isLoadingPage
  const canNextPage = pagination.pageIndex + 1 < pageCount && !isLoadingPage

  const table = useTable({
    features,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id)
        const newIndex = prev.findIndex((item) => item.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleExportExcel = React.useCallback(() => {
    const selectedRows = table.getSelectedRowModel().rows
    const rowsToExport =
      selectedRows.length > 0 ? selectedRows.map((r) => r.original) : data

    if (!rowsToExport.length) {
      toast.error("No hay registros de ocupación para exportar")
      return
    }

    const headers = [
      "ID",
      "Potrero",
      "Bovino",
      "Fecha Entrada",
      "Fecha Salida",
      "Estado",
      "Aforo",
      "Registrado por",
      "Fecha Creación",
    ]

    const csvLines = rowsToExport.map((item) => {
      const creadoFecha = item.created_at
        ? new Date(item.created_at).toLocaleDateString("es-CO", {
            timeZone: "America/Bogota",
          })
        : ""

      const cells = [
        item.id,
        getPotreroLabel(item),
        getBovinoLabel(item),
        formatFechaHora(item.fecha_entrada),
        item.fecha_salida ? formatFechaHora(item.fecha_salida) : "",
        item.fecha_salida ? "Finalizada" : "En potrero",
        item.aforo ?? "",
        getRegistradorLabel(item),
        creadoFecha,
      ]

      return cells.map(escapeCsvCell).join(";")
    })

    const csvContent = `\uFEFF${[headers.map(escapeCsvCell).join(";"), ...csvLines].join("\r\n")}`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const today = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute("download", `historial-ocupacion-potreros-${today}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(
      `Exportados ${rowsToExport.length} registro(s) a Excel (${selectedRows.length > 0 ? "seleccionados" : "página actual"})`
    )
  }, [table, data])

  return (
    <>
      <Tabs
        defaultValue="outline"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              Historial de ocupación de potreros
            </h1>
            {isLoadingPage && (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDrawer("filter")}
            >
              <Funnel />
              <span className="hidden lg:inline">Filtro</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileDown />
              <span className="hidden lg:inline">Excel</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <Columns3Icon data-icon="inline-start" />
                Columnas
                <ChevronDownIcon data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-72 w-44 overflow-y-auto"
              >
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replaceAll("_", " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDrawer("exit")}
              >
                <LogOutIcon />
                <span className="hidden lg:inline">Sacar animales</span>
              </Button>
            )}

            {canCreate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDrawer("create")}
              >
                <PlusIcon />
                <span className="hidden lg:inline">Registrar ocupación</span>
              </Button>
            )}
          </div>
        </div>

        <TabsContent
          value="outline"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <FlexRender header={header} />
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {isLoadingPage
                          ? "Cargando historial de ocupación..."
                          : "No hay registros de ocupación de potreros."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} de {totalCount}{" "}
              registro(s) en total.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Filas por página
                </Label>
                <Select
                  value={`${pagination.pageSize}`}
                  onValueChange={(value) => {
                    const nextSize = Number(value)
                    if (!Number.isFinite(nextSize) || nextSize <= 0) return
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: nextSize,
                      pageIndex: 0,
                    }))
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-20"
                    id="rows-per-page"
                  >
                    <SelectValue placeholder={pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectGroup>
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Página {pagination.pageIndex + 1} de {pageCount}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  }
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Ir a la primera página</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.max(0, prev.pageIndex - 1),
                    }))
                  }
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.min(pageCount - 1, prev.pageIndex + 1),
                    }))
                  }
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: pageCount - 1,
                    }))
                  }
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Ir a la última página</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <OcupacionPotreroDrawer
        open={drawerOpen}
        onOpenChange={(nextOpen) => {
          setDrawerOpen(nextOpen)
          if (!nextOpen) {
            setDrawerMode(null)
            setSelectedItem(null)
          }
        }}
        mode={drawerMode}
        item={selectedItem}
        potreros={potrerosCatalogo}
        bovinos={bovinosCatalogo}
        ocupacionesActivas={ocupacionesActivas}
        isSubmitting={isSubmitting}
        onSave={handleSaveOcupacion}
        onExitPotrero={handleExitPotrero}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setItemToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro de ocupación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro #{itemToDelete?.id} del
              historial de ocupación de potreros. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOcupacion}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}