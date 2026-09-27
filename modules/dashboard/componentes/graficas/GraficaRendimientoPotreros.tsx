"use client"

import { useState } from "react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"

const chartConfig = {
  litros: { label: "Litros de Leche", color: "#16a34a" },
} satisfies ChartConfig

const ITEMS_POR_PAGINA = 10

export function GraficaTopPotreros() {
  const { data, loading } = useDashboardContext()
  const [pagina, setPagina] = useState(0)
  const [ordenAscendente, setOrdenAscendente] = useState(false) // false = Mayor a Menor, true = Menor a Mayor

  // 1. Extraer los datos reales provenientes del contexto
  const datosReales = data?.graficaPotreros ?? []

  // 2. Ordenar datos según la preferencia elegida
  const potrerosOrdenados = [...datosReales].sort((a, b) =>
    ordenAscendente ? a.litros - b.litros : b.litros - a.litros
  )

  const totalPaginas = Math.ceil(potrerosOrdenados.length / ITEMS_POR_PAGINA) || 1

  // 3. Paginar los resultados
  const potrerosPaginados = potrerosOrdenados.slice(
    pagina * ITEMS_POR_PAGINA,
    (pagina + 1) * ITEMS_POR_PAGINA
  )

  const handleAnterior = () => {
    if (pagina > 0) setPagina((prev) => prev - 1)
  }

  const handleSiguiente = () => {
    if (pagina < totalPaginas - 1) setPagina((prev) => prev + 1)
  }

  const toggleOrden = () => {
    setOrdenAscendente(!ordenAscendente)
    setPagina(0)
  }

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">
            Rendimiento de Leche por Potrero
          </CardTitle>
          <CardDescription className="text-xs">
            {ordenAscendente ? "Mostrando de menor a mayor producción" : "Mostrando de mayor a menor producción"}
            {potrerosOrdenados.length > 0 &&
              ` (${pagina * ITEMS_POR_PAGINA + 1} - ${Math.min((pagina + 1) * ITEMS_POR_PAGINA, potrerosOrdenados.length)} de ${potrerosOrdenados.length})`}
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleOrden}
          disabled={datosReales.length === 0}
          className="text-xs flex items-center gap-1.5 h-8"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {ordenAscendente ? "Ver Mejores" : "Ver Menos Productivos"}
        </Button>
      </CardHeader>

      <CardContent className="pb-4">
        {loading ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
            Cargando rendimiento de potreros...
          </div>
        ) : potrerosOrdenados.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
            No hay registros de rotación u ordeño vinculados a potreros.
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={potrerosPaginados}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis
                    dataKey="potrero"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                    width={90}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value} Lts`}
                      />
                    }
                  />
                  <Bar
                    dataKey="litros"
                    fill={ordenAscendente ? "#dc2626" : "#16a34a"}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Paginación */}
            <div className="flex items-center justify-between pt-3 border-t mt-2 text-xs text-muted-foreground">
              <span>Página {pagina + 1} de {totalPaginas}</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnterior}
                  disabled={pagina === 0}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSiguiente}
                  disabled={pagina === totalPaginas - 1}
                  className="h-8 px-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}