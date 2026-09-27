"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"
import { Database } from "lucide-react"

export function KpiTotalAnimales() {
  const { data, loading } = useDashboardContext()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Animales</CardTitle>
        <Database className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : (data?.metricas.totalAnimales ?? 0)}
        </div>
        <p className="text-xs text-muted-foreground">Hato activo general</p>
      </CardContent>
    </Card>
  )
}