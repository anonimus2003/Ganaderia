"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"

// Paleta de colores detallada con tonos base, superior (claro) e inferior (oscuro) para degradados
const PALETA_COLORES = [
  { id: "emerald", base: "hsl(158, 64%, 42%)", top: "hsl(158, 64%, 52%)", bottom: "hsl(158, 64%, 30%)" },
  { id: "sky",     base: "hsl(199, 89%, 48%)", top: "hsl(199, 89%, 58%)", bottom: "hsl(199, 89%, 35%)" },
  { id: "rose",    base: "hsl(346, 84%, 61%)", top: "hsl(346, 84%, 71%)", bottom: "hsl(346, 84%, 40%)" },
  { id: "violet",  base: "hsl(262, 83%, 58%)", top: "hsl(262, 83%, 68%)", bottom: "hsl(262, 83%, 38%)" },
  { id: "amber",   base: "hsl(38, 92%, 50%)",  top: "hsl(38, 92%, 60%)",  bottom: "hsl(38, 92%, 35%)" },
]

const chartConfig = {
  peso: {
    label: "Peso (Kg)",
    color: "hsl(var(--chart-1))",
  },
}

export function GraficaPesaje() {
  const { data, loading, vacaSeleccionada } = useDashboardContext()
  const datos = data?.graficaPesaje ?? []

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Evolución de Peso (Kg)</CardTitle>
        <CardDescription className="text-xs">
          {vacaSeleccionada === "general"
            ? "Promedio de pesaje general del hato"
            : "Histórico de pesajes del animal seleccionado"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
            Cargando historial de pesaje...
          </div>
        ) : datos.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
            No hay registros de pesaje disponibles.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Definición de degradados SVG individuales para cada color */}
                {PALETA_COLORES.map((c) => (
                  <linearGradient key={c.id} id={`grad-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.top} stopOpacity={1} />
                    <stop offset="100%" stopColor={c.bottom} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
              <XAxis dataKey="fecha" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" domain={['auto', 'auto']} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="peso" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {datos.map((_, index) => {
                  const colorScheme = PALETA_COLORES[index % PALETA_COLORES.length]
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#grad-${colorScheme.id})`}
                      stroke={colorScheme.base}
                      strokeWidth={1}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}