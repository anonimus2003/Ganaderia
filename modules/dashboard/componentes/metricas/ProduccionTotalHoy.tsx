// modules/dashboard/componentes/metricas/ProduccionTotalHoy.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduccionTotalHoy } from "@/modules/dashboard/hooks/useDashboard"
import { Droplet } from "lucide-react"

interface KpiProduccionLecheProps {
  vacaSeleccionada: string
}

export function KpiProduccionLeche({ vacaSeleccionada }: KpiProduccionLecheProps) {
  const { produccion, loading } = useProduccionTotalHoy(vacaSeleccionada)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Producción Total Hoy</CardTitle>
        <Droplet className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : `${produccion} L`}
        </div>
        <p className="text-xs text-muted-foreground">
          {vacaSeleccionada === "general" ? "Suma de todas las jornadas" : "Producción de la vaca"}
        </p>
      </CardContent>
    </Card>
  )
}