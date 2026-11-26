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
  createOrdenoAction,
  deleteOrdenoAction,
  fetchOrdenoCatalogoBovinosAction,
  fetchOrdenoPageAction,
  updateOrdenoAction,
  type BovinoOpcionOrdeno,
  type OrdenoRegistro,
} from "../actions/actions"
import {
  OrdenoDrawer,
  ordenoSchema,
  type OrdenoDrawerMode,
  type OrdenoFilterState,
  type OrdenoPayload,
} from "@/modulos/ordeno/components/ordeno-drawer"
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
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  FileDown,
  Funnel,
  Loader2Icon,
  SunIcon,
  SunsetIcon,
} from "lucide-react"

export { ordenoSchema }

type OrdenoRow = OrdenoRegistro

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, OrdenoRow>()

const DEFAULT_FILTERS: OrdenoFilterState = {
  search: "",
  jornada: "ALL",
  fechaDesde: "",
  fechaHasta: "",
}

function formatDecimal(val: number | string | null | undefined, suffix = ""): string {
  if (val === null || val === undefined || val === "") return "—"
  const num = typeof val === "number" ? val : Number(val)
  if (Number.isNaN(num)) return `${val}${suffix}`
  return `${num.toFixed(2)}${suffix}`
}

function getRegistradorLabel(row: OrdenoRow): string {
  if (row.registrado_por_nombre?.trim()) {
    return row.registrado_por_nombre.trim()
  }
  if (row.registrado_por?.trim()) {
    return `${row.registrado_por.slice(0, 8)}...`
  }
  return "—"
}

function getBovinoLabel(row: OrdenoRow, bovinosMap: Map<string, BovinoOpcionOrdeno>): string {
  if (row.bovino_label?.trim()) {
    return row.bovino_label.trim()
  }
  const found = bovinosMap.get(row.bovino_id)
  if (!found) return row.bovino_id
  const arete = found.arete?.trim() || found.id
  const nombre = found.nombre?.trim()
  return nombre ? `${arete} — ${nombre}` : arete
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

function DragHandle({ id }: { id: string }) {
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

function DraggableRow({ row }: { row: Row<typeof features, OrdenoRow> }) {
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
}: {
  data: OrdenoRow[]
  totalCount?: number
  permissions?: PermisosModulo
}) {
  const canCreate = permissions?.canCreate ?? true
  const canEdit = permissions?.canEdit ?? true
  const canDelete = permissions?.canDelete ?? true

  const [data, setData] = React.useState<OrdenoRow[]>(() => initialData ?? [])
  const [totalCount, setTotalCount] = React.useState<number>(
    initialTotalCount || (initialData?.length ?? 0)
  )
  const [isLoadingPage, setIsLoadingPage] = React.useState(false)
  const [catalogoBovinos, setCatalogoBovinos] = React.useState<BovinoOpcionOrdeno[]>([])

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState({})

  const [itemToDelete, setItemToDelete] = React.useState<OrdenoRow | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({
      observaciones: false,
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
  const [drawerMode, setDrawerMode] = React.useState<OrdenoDrawerMode>(null)
  const [selectedItem, setSelectedItem] = React.useState<OrdenoRow | null>(null)
  const [filters, setFilters] = React.useState<OrdenoFilterState>(DEFAULT_FILTERS)

  const isInitialMount = React.useRef(true)

  React.useEffect(() => {
    setData(initialData ?? [])
    setTotalCount(initialTotalCount || (initialData?.length ?? 0))
  }, [initialData, initialTotalCount])

  const loadPage = React.useCallback(
    async (
      nextPageIndex: number,
      nextPageSize: number,
      nextFilters: OrdenoFilterState
    ) => {
      setIsLoadingPage(true)
      try {
        const res = await fetchOrdenoPageAction({
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

  React.useEffect(() => {
    if (!drawerOpen || (drawerMode !== "create" && drawerMode !== "edit")) {
      return
    }
    let active = true
    void fetchOrdenoCatalogoBovinosAction().then((res) => {
      if (active && !res.error && res.items.length > 0) {
        setCatalogoBovinos(res.items)
      }
    })
    return () => {
      active = false
    }
  }, [drawerOpen, drawerMode])

  const bovinosMap = React.useMemo(() => {
    const map = new Map<string, BovinoOpcionOrdeno>()
    catalogoBovinos.forEach((b) => map.set(b.id, b))
    return map
  }, [catalogoBovinos])

  const openDrawer = React.useCallback(
    (mode: Exclude<OrdenoDrawerMode, null>, item: OrdenoRow | null = null) => {
      if (mode === "create" && !canCreate) {
        toast.error("No tienes permiso para registrar ordeños")
        return
      }
      if (mode === "edit" && !canEdit) {
        toast.error("No tienes permiso para editar ordeños")
        return
      }
      setDrawerMode(mode)
      setSelectedItem(item)
      setDrawerOpen(true)
    },
    [canCreate, canEdit]
  )

  const handleSaveOrdeno = React.useCallback(
    async (
      values: OrdenoPayload,
      mode: "create" | "edit",
      existingId?: string
    ) => {
      if (mode === "create" && !canCreate) {
        toast.error("No tienes permiso para registrar ordeños")
        return
      }
      if (mode === "edit" && !canEdit) {
        toast.error("No tienes permiso para actualizar ordeños")
        return
      }

      setIsSubmitting(true)
      try {
        if (mode === "create") {
          const { data: inserted, error } = await createOrdenoAction(values)
          if (error || !inserted) {
            toast.error(error ?? "No se pudo registrar el ordeño")
            throw new Error(error ?? "Error al crear")
          }
          toast.success(
            `Ordeño (${inserted.jornada} · ${formatDecimal(inserted.litros, " L")}) creado con éxito`
          )
          await loadPage(0, pagination.pageSize, filters)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        } else if (mode === "edit" && existingId) {
          const { data: updated, error } = await updateOrdenoAction(
            existingId,
            values
          )
          if (error || !updated) {
            toast.error(error ?? "No se pudo actualizar el ordeño")
            throw new Error(error ?? "Error al actualizar")
          }
          setData((prev) =>
            prev.map((row) =>
              row.id === existingId
                ? {
                    ...updated,
                    registrado_por_nombre:
                      updated.registrado_por_nombre ?? row.registrado_por_nombre,
                    bovino_label: updated.bovino_label ?? row.bovino_label,
                  }
                : row
            )
          )
          toast.success(
            `Ordeño (${updated.jornada} · ${formatDecimal(updated.litros, " L")}) actualizado con éxito`
          )
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [canCreate, canEdit, loadPage, pagination.pageSize, filters]
  )

  const confirmDeleteOrdeno = React.useCallback(async () => {
    if (!itemToDelete) return
    if (!canDelete) {
      toast.error("No tienes permiso para eliminar registros de ordeño")
      setItemToDelete(null)
      return
    }

    setIsDeleting(true)
    try {
      const { ok, error } = await deleteOrdenoAction(itemToDelete.id)
      if (!ok) {
        toast.error(error ?? "No se pudo eliminar el registro de ordeño")
        return
      }
      toast.success(
        `Ordeño del ${itemToDelete.fecha} (${itemToDelete.jornada}) eliminado con éxito`
      )
      setItemToDelete(null)
      await loadPage(pagination.pageIndex, pagination.pageSize, filters)
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
  ])

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
        columnHelper.accessor("bovino_id", {
          header: "Bovino",
          cell: ({ row }) => (
            <Button
              variant="link"
              className="w-fit px-0 font-semibold text-left text-foreground"
              onClick={() => openDrawer("view", row.original)}
            >
              {getBovinoLabel(row.original, bovinosMap)}
            </Button>
          ),
          enableHiding: false,
        }),
        columnHelper.accessor("fecha", {
          header: "Fecha",
          cell: ({ row }) => <span>{row.original.fecha || "—"}</span>,
        }),
        columnHelper.accessor("jornada", {
          header: "Jornada",
          cell: ({ row }) => {
            const esManana = row.original.jornada === "Mañana"
            return (
              <Badge variant="outline" className="gap-1 px-1.5 text-muted-foreground">
                {esManana ? (
                  <SunIcon className="size-3.5 text-amber-500" />
                ) : (
                  <SunsetIcon className="size-3.5 text-indigo-500" />
                )}
                {row.original.jornada}
              </Badge>
            )
          },
        }),
        columnHelper.accessor("litros", {
          header: "Litros",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {formatDecimal(row.original.litros, " L")}
            </span>
          ),
        }),
        columnHelper.accessor("concentrado_kg", {
          header: "Concentrado",
          cell: ({ row }) => (
            <span className="text-muted-foreground">
              {formatDecimal(row.original.concentrado_kg, " kg")}
            </span>
          ),
        }),
        columnHelper.accessor("observaciones", {
          header: "Observaciones",
          cell: ({ row }) => (
            <span className="line-clamp-1 max-w-48">
              {row.original.observaciones || "—"}
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
                ? new Date(row.original.created_at).toLocaleDateString("es-CO")
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
    [openDrawer, bovinosMap, canEdit, canDelete]
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
    getRowId: (row) => row.id,
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
      toast.error("No hay registros de ordeño para exportar")
      return
    }

    const headers = [
      "Bovino",
      "Fecha",
      "Jornada",
      "Litros",
      "Concentrado (kg)",
      "Observaciones",
      "Registrado por",
      "Fecha Creación",
    ]

    const csvLines = rowsToExport.map((item) => {
      const creadoFecha = item.created_at
        ? new Date(item.created_at).toLocaleDateString("es-CO")
        : ""

      const cells = [
        getBovinoLabel(item, bovinosMap),
        item.fecha ?? "",
        item.jornada ?? "",
        item.litros ?? "",
        item.concentrado_kg ?? 0,
        item.observaciones ?? "",
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
    link.setAttribute("download", `ordeno-agronova-${today}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(
      `Exportados ${rowsToExport.length} registro(s) de ordeño a Excel (${selectedRows.length > 0 ? "seleccionados" : "página actual"})`
    )
  }, [table, data, bovinosMap])

  return (
    <>
      <Tabs
        defaultValue="outline"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Registros de ordeño</h1>
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

            {canCreate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDrawer("create")}
              >
                <PlusIcon />
                <span className="hidden lg:inline">Registrar ordeño</span>
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
                          ? "Cargando registros de ordeño..."
                          : "No hay registros de ordeño."}
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
                    setPagination({
                      pageIndex: 0,
                      pageSize: Number(value),
                    })
                  }}
                  items={[10, 20, 30, 40, 50].map((pageSize) => ({
                    label: `${pageSize}`,
                    value: `${pageSize}`,
                  }))}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
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
                  <span className="sr-only">Primera página</span>
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
                  <span className="sr-only">Página anterior</span>
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
                  <span className="sr-only">Página siguiente</span>
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
                  <span className="sr-only">Última página</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <OrdenoDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        item={selectedItem}
        bovinosList={catalogoBovinos}
        isSubmitting={isSubmitting}
        onSave={handleSaveOrdeno}
        filters={filters}
        onApplyFilters={(nextFilters) => {
          setFilters(nextFilters)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
        onClearFilters={() => {
          setFilters(DEFAULT_FILTERS)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
      />

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setItemToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro de ordeño?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente el registro de ordeño del{" "}
              <span className="font-semibold text-foreground">
                {itemToDelete?.fecha}
              </span>{" "}
              en jornada{" "}
              <span className="font-semibold text-foreground">
                {itemToDelete?.jornada}
              </span>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrdeno}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}