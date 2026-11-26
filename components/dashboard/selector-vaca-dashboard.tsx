"use client"

import * as React from "react"
import { createClient } from "@/lib/client"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface BovinoFiltroItem {
  id: string
  arete: string
  nombre: string | null
}

interface SelectorVacaDashboardProps {
  value: string
  onChange: (bovinoId: string) => void
  bovinos?: BovinoFiltroItem[]
}

export function SelectorVacaDashboard({
  value,
  onChange,
  bovinos: initialBovinos = [],
}: SelectorVacaDashboardProps) {
  const supabase = React.useMemo(() => createClient(), [])
  const [bovinos, setBovinos] =
    React.useState<BovinoFiltroItem[]>(initialBovinos)

  React.useEffect(() => {
    if (initialBovinos.length > 0) {
      setBovinos(initialBovinos)
      return
    }
    let activo = true
    async function cargarBovinos() {
      const { data } = await supabase
        .from("bovinos")
        .select("id, arete, nombre")
        .order("arete", { ascending: true })
      if (!activo || !data) return
      setBovinos(
        data.map((b) => ({
          id: String(b.id),
          arete: String(b.arete ?? ""),
          nombre: typeof b.nombre === "string" ? b.nombre : null,
        }))
      )
    }
    void cargarBovinos()
    return () => {
      activo = false
    }
  }, [supabase, initialBovinos])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">Filtrar gráficas por vaca</span>
        <span className="text-xs text-muted-foreground">
          Aplica a Producción de Leche y Pesajes
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="filtro-vaca-dashboard" className="text-sm">
          Vaca:
        </Label>
        <Select
          value={value}
          onValueChange={(nextVal) => onChange(nextVal ?? "ALL")}
        >
          <SelectTrigger id="filtro-vaca-dashboard" className="w-64">
            <SelectValue placeholder="Todas las vacas" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">Todas las vacas</SelectItem>
              {bovinos.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.arete || b.id.slice(0, 8)}
                  {b.nombre ? ` — ${b.nombre}` : ""}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}