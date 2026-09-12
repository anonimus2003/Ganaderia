// modules/dashboard/componentes/GraficaLeche.tsx
"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useGraficaLeche } from "@/modules/dashboard/hooks/useDashboard"

const chartConfig = {
  leche: {
    label: "Litros de Leche",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface GraficaLecheProps {
  vacaSeleccionada: string
}

export function GraficaLeche({ vacaSeleccionada }: GraficaLecheProps) {
  // Estado local para alternar entre día, mes o año
  const [escalaTiempo, setEscalaTiempo] = useState<"dia" | "mes" | "anio">("dia")

  // Pasamos tanto la vaca como la escala de tiempo al hook
  const { datos, loading } = useGraficaLeche(vacaSeleccionada, escalaTiempo)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col justify-center gap-1">
          <CardTitle>Registro de Producción de Leche</CardTitle>
          <CardDescription>
            {vacaSeleccionada === "general"
              ? "Producción total acumulada del hato"
              : "Comportamiento de producción del animal seleccionado"}
          </CardDescription>
        </div>

        {/* Botones de control para alternar Día, Mes o Año */}
        <div className="flex items-center bg-muted p-1 rounded-lg border self-start sm:self-auto">
          <button
            onClick={() => setEscalaTiempo("dia")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              escalaTiempo === "dia"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setEscalaTiempo("mes")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              escalaTiempo === "mes"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setEscalaTiempo("anio")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              escalaTiempo === "anio"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Año
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:p-6">
        {loading ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Cargando registros de producción...
          </div>
        ) : datos.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            No hay registros de ordeño disponibles para mostrar.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <AreaChart
              accessibilityLayer
              data={datos}
              margin={{
                top: 20,
                left: 12,
                right: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${value} Litros`}
                    labelKey="fecha"
                  />
                }
              />
              <defs>
                <linearGradient id="fillLeche" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-leche)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-leche)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="litros"
                type="natural"
                fill="url(#fillLeche)"
                fillOpacity={0.4}
                stroke="var(--color-leche)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}