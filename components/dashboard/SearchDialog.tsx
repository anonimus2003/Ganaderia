"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  LayoutDashboardIcon,
  Package,
  Milk,
  MapPinned,
  Pill,
  Dna,
  Wallet,
  FileChartColumnIcon,
  SearchIcon,
} from "lucide-react"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ACCESOS_RAPIDOS = [
  {
    titulo: "Dashboard General",
    descripcion: "Resumen de producción, hato y alertas",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    titulo: "Inventario Bovino",
    descripcion: "Consultar animales, chapetas, razas y estados",
    url: "/dashboard/inventario",
    icon: Package,
  },
  {
    titulo: "Control de Ordeño",
    descripcion: "Registros diarios de leche por jornada",
    url: "/dashboard/ordeno",
    icon: Milk,
  },
  {
    titulo: "Mapa de Potreros",
    descripcion: "Distribución de lotes, pastoreo y rotación",
    url: "/dashboard/potreros",
    icon: MapPinned,
  },
  {
    titulo: "Medicamentos y Sanidad",
    descripcion: "Tratamientos, vacunas y tiempos de retiro",
    url: "/dashboard/medicamentos",
    icon: Pill,
  },
  {
    titulo: "Reproducción",
    descripcion: "Servicios, palpaciones, partos y genealogía",
    url: "/dashboard/reproduccion",
    icon: Dna,
  },
  {
    titulo: "Ingresos y Egresos",
    descripcion: "Movimientos financieros de la unidad ganadera",
    url: "/dashboard/finanzas",
    icon: Wallet,
  },
  {
    titulo: "Reportes Financieros",
    descripcion: "Balances y exportación de informes",
    url: "/dashboard/finanzas/reportes",
    icon: FileChartColumnIcon,
  },
]

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const filtered = ACCESOS_RAPIDOS.filter(
    (item) =>
      item.titulo.toLowerCase().includes(query.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(url: string) {
    onOpenChange(false)
    setQuery("")
    router.push(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Búsqueda rápida</DialogTitle>
          <DialogDescription>
            Navega rápidamente entre los módulos de Agronova (atajo Ctrl + K).
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar módulo (ej. Inventario, Potreros, Ordeño)..."
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron resultados para &ldquo;{query}&rdquo;.
            </p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.titulo}
                  type="button"
                  onClick={() => handleSelect(item.url)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.descripcion}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}