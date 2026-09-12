// modules/dashboard/componentes/metricas/TotalAnimales.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"
import { useTotalAnimales } from "@/modules/dashboard/hooks/useDashboard" // Ajusta la ruta si es necesario

export function KpiTotalAnimales() {
  const { total, loading } = useTotalAnimales()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Animales</CardTitle>
        <Database className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : total}
        </div>
        <p className="text-xs text-muted-foreground">Hato activo general</p>
      </CardContent>
    </Card>
  )
}