// modules/dashboard/componentes/metricas/DiasLactancia.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDiasLactancia } from "@/modules/dashboard/hooks/useDashboard"
import { Calendar } from "lucide-react"

interface KpiDiasLactanciaProps {
  vacaSeleccionada: string
}

export function KpiDiasLactancia({ vacaSeleccionada }: KpiDiasLactanciaProps) {
  const { dias, loading } = useDiasLactancia(vacaSeleccionada)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Días en Lactancia (DEL)</CardTitle>
        <Calendar className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : `${dias} días`}
        </div>
        <p className="text-xs text-muted-foreground">
          {vacaSeleccionada === "general" ? "Promedio del hato" : "Actual de la vaca"}
        </p>
      </CardContent>
    </Card>
  )
}