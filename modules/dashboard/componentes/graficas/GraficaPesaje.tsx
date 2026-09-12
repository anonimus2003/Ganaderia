"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useState } from "react"
import { useGraficaPesaje } from "@/modules/dashboard/hooks/useDashboard"

const chartConfig = {
  peso: {
    label: "Peso Promedio (kg)",
    color: "#16a34a", // Verde esmeralda vivo y profesional
  },
} satisfies ChartConfig

interface GraficaPesajeProps {
  vacaSeleccionada: string
}

export function GraficaPesaje({ vacaSeleccionada }: GraficaPesajeProps) {
  const [escalaTiempo, setEscalaTiempo] = useState<"dias" | "meses" | "anios">("meses")

  const { datos, loading } = useGraficaPesaje(vacaSeleccionada, escalaTiempo)

  const obtenerDescripcion = () => {
    switch (escalaTiempo) {
      case "dias":
        return "Control de peso diario registrado recientemente"
      case "meses":
        return "Evolución del peso promedio mensual"
      case "anios":
        return "Histórico de ganancia de peso anual"
    }
  }

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-base font-semibold">Control y Registro de Pesaje</CardTitle>
          <CardDescription className="text-xs">{obtenerDescripcion()}</CardDescription>
        </div>
        <div className="flex items-center px-6 py-4 sm:py-0">
          <Tabs
            defaultValue="meses"
            value={escalaTiempo}
            onValueChange={(v) => setEscalaTiempo(v as "dias" | "meses" | "anios")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 h-8 text-xs">
              <TabsTrigger value="dias">Días</TabsTrigger>
              <TabsTrigger value="meses">Meses</TabsTrigger>
              <TabsTrigger value="anios">Años</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:p-6">
        {loading ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
            Cargando registros de pesaje...
          </div>
        ) : datos.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
            No hay registros de pesaje disponibles para mostrar.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <BarChart
              accessibilityLayer
              data={datos}
              margin={{
                top: 20,
                left: 12,
                right: 12,
                bottom: 12,
              }}
            >
              {/* Cuadrícula de fondo más sutil y punteada */}
              <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.4} />
              <XAxis
                dataKey="periodo"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['dataMin - 10', 'dataMax + 10']}
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${value} kg`}
                    hideLabel
                  />
                }
              />
              {/* Barras con bordes redondeados arriba y color vibrante */}
              <Bar 
                dataKey="peso" 
                fill="var(--color-peso)" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}