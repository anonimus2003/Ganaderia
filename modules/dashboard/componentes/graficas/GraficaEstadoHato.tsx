"use client"

import { Cell, Pie, PieChart } from "recharts"
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
import { useGraficaEstadoHato } from "@/modules/dashboard/hooks/useDashboard"

const chartConfig = {
  cantidad: {},
} satisfies ChartConfig

export function GraficaEstadoHato() {
  const { datos, loading } = useGraficaEstadoHato()

  const totalAnimales = datos.reduce((acc, curr) => acc + curr.cantidad, 0)

  return (
    <Card className="w-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base font-semibold text-center">Estado y Categorías del Hato</CardTitle>
        <CardDescription className="text-xs text-center">
          Distribución poblacional actual en tiempo real ({totalAnimales} animales activos)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {loading ? (
          <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground text-sm">
            Cargando distribución del hato...
          </div>
        ) : datos.length === 0 ? (
          <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground text-sm">
            No hay registros de animales activos disponibles.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            
            <div className="md:col-span-6 flex justify-center">
              <ChartContainer
                config={chartConfig}
                className="aspect-square w-full max-h-[240px] [&_.recharts-pie-label-text]:fill-foreground"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => {
                          const cantidadNum = Number(value) || 0
                          const porcentaje = totalAnimales > 0 
                            ? ((cantidadNum / totalAnimales) * 100).toFixed(1) 
                            : "0"
                          return `${porcentaje}%`
                        }}
                        hideLabel={false}
                      />
                    }
                  />
                  <Pie
                    data={datos}
                    dataKey="cantidad"
                    nameKey="categoria"
                    innerRadius={55}
                    outerRadius={85}
                    strokeWidth={4}
                    paddingAngle={3}
                  >
                    {datos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            <div className="md:col-span-6 flex flex-col justify-center space-y-2 px-2">
              <div className="text-xs font-semibold text-muted-foreground mb-1">Categorías:</div>
              {datos.map((item, index) => {
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: item.fill }} 
                      />
                      <span className="font-medium text-foreground truncate" title={item.categoria}>
                        {item.categoria}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.cantidad}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}