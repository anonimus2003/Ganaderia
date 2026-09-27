"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"
import { Calendar } from "lucide-react"

export function KpiDiasLactancia() {
  const { data, loading, vacaSeleccionada } = useDashboardContext()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Días en Lactancia (DEL)</CardTitle>
        <Calendar className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : `${data?.metricas.diasLactancia ?? 0} días`}
        </div>
        <p className="text-xs text-muted-foreground">
          {vacaSeleccionada === "general" ? "Promedio del hato" : "Actual de la vaca"}
        </p>
      </CardContent>
    </Card>
  )
}