"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"
import { Activity } from "lucide-react"

export function KpiVacasEnOrdeno() {
  const { data, loading } = useDashboardContext()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Vacas en Ordeño</CardTitle>
        <Activity className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : (data?.metricas.vacasOrdeno ?? 0)}
        </div>
        <p className="text-xs text-muted-foreground">Únicas hoy en ordeño</p>
      </CardContent>
    </Card>
  )
}