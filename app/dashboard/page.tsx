"use client"

import * as React from "react"
import { createClient } from "@/lib/client"
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import { DataTableRetiros } from "@/components/dashboard/data-table"
import { SectionCards } from "@/components/dashboard/section-cards"
import { ChartBarLabel } from "@/components/dashboard/chart-bar-label"
import { ChartBarLabelCustom } from "@/components/dashboard/chart-bar-label-custom"
import { ChartPieDonutText } from "@/components/dashboard/chart-pie-donut-text"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BovinoFiltroItem {
  id: string
  arete: string
  nombre: string | null
}

export default function Page() {
  const supabase = React.useMemo(() => createClient(), [])
  const [bovinoId, setBovinoId] = React.useState<string>("ALL")
  const [bovinos, setBovinos] = React.useState<BovinoFiltroItem[]>([])

  React.useEffect(() => {
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
  }, [supabase])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 md:gap-6">
        <SectionCards />

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold">
              Indicadores por vaca
            </h2>
            <p className="text-xs text-muted-foreground">
              Filtra producción de leche y pesajes por animal o consulta todo el hato
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="dashboard-selector-vaca" className="text-sm">
              Vaca:
            </Label>
            <Select
              value={bovinoId}
              onValueChange={(nextVal) => setBovinoId(nextVal ?? "ALL")}
            >
              <SelectTrigger id="dashboard-selector-vaca" className="w-64">
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

        <div className="px-4 lg:px-6">
          <ChartAreaInteractive bovinoId={bovinoId} />
        </div>

        <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <ChartBarLabel bovinoId={bovinoId} />
          </div>
          <div>
            <ChartBarLabelCustom />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <DataTableRetiros />
          </div>
          <div>
            <ChartPieDonutText />
          </div>
        </div>
      </div>
    </div>
  )
}