"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"

const chartConfig = {
  litros: {
    label: "Litros de Leche",
    color: "hsl(var(--chart-1))",
  },
}

type Periodo = "dias" | "meses" | "anios"

export function GraficaLeche() {
  const { data, loading, vacaSeleccionada } = useDashboardContext()
  const [periodo, setPeriodo] = useState<Periodo>("dias")

  const datosProcesados = useMemo(() => {
    if (!data?.graficaLeche) return []

    // 1. MODO DÍAS: Procesamiento fila por fila exactamente como lo tenías antes
    if (periodo === "dias") {
      const ordenados = [...(data.graficaLeche.dias || [])].sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      )

      return ordenados.map((item) => {
        const partes = item.fecha.split("-")
        const fechaCorta = partes.length === 3 ? `${partes[2]}/${partes[1]}` : item.fecha
        return {
          etiqueta: fechaCorta,
          litros: Number(item.litros || 0),
        }
      })
    }

    // 2. MODO MESES: Utiliza el consolidado precalculado de la Vista
    if (periodo === "meses") {
      return (data.graficaLeche.meses || []).map((item: any) => ({
        etiqueta: item.fecha, // Ej: "Ene 2026"
        litros: Number(item.litros || 0),
      }))
    }

    // 3. MODO AÑOS: Agrupa las sumas de los meses por Año (YYYY)
    if (periodo === "anios") {
      const mapaAnios: Record<string, number> = {}

      ;(data.graficaLeche.meses || []).forEach((item: any) => {
        const anioKey = item.mesKey.substring(0, 4) // Obtiene "YYYY" de "YYYY-MM"
        mapaAnios[anioKey] = (mapaAnios[anioKey] || 0) + Number(item.litros || 0)
      })

      return Object.keys(mapaAnios)
        .sort()
        .map((anioKey) => ({
          etiqueta: anioKey,
          litros: Number(mapaAnios[anioKey].toFixed(1)),
        }))
    }

    return []
  }, [data, periodo])

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Producción de Leche</CardTitle>
          <CardDescription className="text-xs">
            {vacaSeleccionada === "general"
              ? "Histórico general de producción del hato"
              : "Histórico de producción del animal seleccionado"}
          </CardDescription>
        </div>

        {/* Filtro de período */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setPeriodo("dias")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              periodo === "dias"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Últimos 7 Días
          </button>
          <button
            onClick={() => setPeriodo("meses")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              periodo === "meses"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Meses
          </button>
          <button
            onClick={() => setPeriodo("anios")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              periodo === "anios"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Años
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
            Cargando historial de producción...
          </div>
        ) : datosProcesados.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
            No hay registros de producción en este periodo.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={datosProcesados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillLitros" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="litros"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#fillLitros)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}