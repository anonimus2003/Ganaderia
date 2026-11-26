"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { createClient } from "@/lib/client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A donut chart showing expense categories"

interface CajaEgresoRow {
  categoria: string
  monto: number | string
  fecha: string
}

interface CategoriaEgresoItem {
  key: string
  categoria: string
  monto: number
  valorGrafico: number
  fill: string
}

const CATEGORIAS_EGRESO = [
  "Concentrado y suplementos",
  "Medicamentos y sanidad",
  "Mantenimiento de potreros",
  "Salarios y jornales",
  "Insumos y herramientas",
  "Servicios y transporte",
  "Otros egresos",
] as const

const COLORES_EGRESO = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#64748b",
] as const

const chartConfig = {
  monto: {
    label: "Egresos (COP)",
  },
  concentrado_y_suplementos: {
    label: "Concentrado y suplementos",
    color: "#ef4444",
  },
  medicamentos_y_sanidad: {
    label: "Medicamentos y sanidad",
    color: "#f97316",
  },
  mantenimiento_de_potreros: {
    label: "Mantenimiento de potreros",
    color: "#eab308",
  },
  salarios_y_jornales: {
    label: "Salarios y jornales",
    color: "#ec4899",
  },
  insumos_y_herramientas: {
    label: "Insumos y herramientas",
    color: "#8b5cf6",
  },
  servicios_y_transporte: {
    label: "Servicios y transporte",
    color: "#06b6d4",
  },
  otros_egresos: {
    label: "Otros egresos",
    color: "#64748b",
  },
} satisfies ChartConfig

function normalizarClaveCategoria(categoria: string): string {
  return categoria
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

function formatearMonedaCorta(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `$${(valor / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(valor) >= 1_000) {
    return `$${Math.round(valor / 1_000)}k`
  }
  return `$${Math.round(valor).toLocaleString("es-CO")}`
}

function formatearMonedaCompleta(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor)
}

function construirItemsBaseEgresos(
  totalEgresos: number
): CategoriaEgresoItem[] {
  const pesoVacio = Math.max(1000, Math.round(totalEgresos * 0.08))
  return CATEGORIAS_EGRESO.map((categoria, index) => ({
    key: normalizarClaveCategoria(categoria),
    categoria,
    monto: 0,
    valorGrafico: pesoVacio,
    fill: COLORES_EGRESO[index % COLORES_EGRESO.length],
  }))
}

export function ChartEgresosDonut() {
  const supabase = React.useMemo(() => createClient(), [])

  const [categoriasData, setCategoriasData] = React.useState<
    CategoriaEgresoItem[]
  >(() => construirItemsBaseEgresos(0))
  const [cargando, setCargando] = React.useState(true)
  const [variacionMesPct, setVariacionMesPct] = React.useState<number | null>(
    null
  )
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let activo = true

    async function cargarEgresosPorCategoria() {
      const { data, error } = await supabase
        .from("caja")
        .select("categoria, monto, fecha")
        .eq("tipo", "egreso")

      if (!activo) return

      if (error) {
        setErrorMsg(error.message)
        setCategoriasData(construirItemsBaseEgresos(0))
        setCargando(false)
        return
      }

      const filas = (data ?? []) as CajaEgresoRow[]
      const totalesPorCategoria = new Map<string, number>()

      for (const cat of CATEGORIAS_EGRESO) {
        totalesPorCategoria.set(cat, 0)
      }

      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const anioActual = ahora.getFullYear()

      const fechaMesAnterior = new Date(anioActual, mesActual - 1, 1)
      const mesAnterior = fechaMesAnterior.getMonth()
      const anioAnterior = fechaMesAnterior.getFullYear()

      let egresosMesActual = 0
      let egresosMesAnterior = 0
      let acumuladoTotal = 0

      for (const fila of filas) {
        const monto = Number(fila.monto)
        if (!Number.isFinite(monto) || monto <= 0) continue

        const categoriaNombre =
          CATEGORIAS_EGRESO.find((c) => c === fila.categoria) ??
          "Otros egresos"

        totalesPorCategoria.set(
          categoriaNombre,
          (totalesPorCategoria.get(categoriaNombre) ?? 0) + monto
        )
        acumuladoTotal += monto

        if (fila.fecha) {
          const fecha = new Date(fila.fecha)
          if (!Number.isNaN(fecha.getTime())) {
            if (
              fecha.getFullYear() === anioActual &&
              fecha.getMonth() === mesActual
            ) {
              egresosMesActual += monto
            } else if (
              fecha.getFullYear() === anioAnterior &&
              fecha.getMonth() === mesAnterior
            ) {
              egresosMesAnterior += monto
            }
          }
        }
      }

      const pesoMinimoVisible = Math.max(1000, Math.round(acumuladoTotal * 0.08))

      const listaCompleta: CategoriaEgresoItem[] = CATEGORIAS_EGRESO.map(
        (categoria, index) => {
          const montoReal = totalesPorCategoria.get(categoria) ?? 0
          return {
            key: normalizarClaveCategoria(categoria),
            categoria,
            monto: montoReal,
            valorGrafico: montoReal > 0 ? montoReal : pesoMinimoVisible,
            fill: COLORES_EGRESO[index % COLORES_EGRESO.length],
          }
        }
      )

      const variacion =
        egresosMesAnterior > 0
          ? Number(
              (
                ((egresosMesActual - egresosMesAnterior) /
                  egresosMesAnterior) *
                100
              ).toFixed(1)
            )
          : null

      setCategoriasData(listaCompleta)
      setVariacionMesPct(variacion)
      setErrorMsg(null)
      setCargando(false)
    }

    void cargarEgresosPorCategoria()
    return () => {
      activo = false
    }
  }, [supabase])

  const totalEgresos = React.useMemo(() => {
    return categoriasData.reduce((acc, curr) => acc + curr.monto, 0)
  }, [categoriasData])

  const bajoControl = (variacionMesPct ?? 0) <= 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>¿En qué se va el dinero? (Egresos)</CardTitle>
        <CardDescription>
          Todas las categorías de egresos con su monto en el gráfico
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {cargando ? (
          <div className="mx-auto flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Cargando egresos...
          </div>
        ) : errorMsg ? (
          <div className="mx-auto flex h-[300px] items-center justify-center px-4 text-center text-sm text-destructive">
            {errorMsg}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[310px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    nameKey="categoria"
                    formatter={(_value, _name, item) => {
                      const realMonto =
                        (item?.payload as CategoriaEgresoItem | undefined)
                          ?.monto ?? 0
                      return formatearMonedaCompleta(realMonto)
                    }}
                  />
                }
              />
              <Pie
                data={categoriasData}
                dataKey="valorGrafico"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={92}
                paddingAngle={2}
                strokeWidth={2}
                labelLine={{ strokeWidth: 1 }}
                label={({
                  cx,
                  cy,
                  midAngle,
                  outerRadius,
                  index,
                }) => {
                  if (
                    cx === undefined ||
                    cy === undefined ||
                    midAngle === undefined ||
                    outerRadius === undefined ||
                    index === undefined
                  ) {
                    return null
                  }
                  const item = categoriasData[index]
                  if (!item) return null

                  const RADIAN = Math.PI / 180
                  const radius = Number(outerRadius) + 14
                  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN)
                  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN)
                  const textAnchor = x > Number(cx) ? "start" : "end"

                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      className="fill-foreground text-[10px] font-medium"
                    >
                      <tspan x={x} dy="-5">
                        {item.categoria}
                      </tspan>
                      <tspan
                        x={x}
                        dy="12"
                        className="fill-muted-foreground text-[10px] font-semibold tabular-nums"
                      >
                        {formatearMonedaCorta(item.monto)}
                      </tspan>
                    </text>
                  )
                }}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 6}
                            className="fill-muted-foreground text-[10px] font-medium"
                          >
                            Total Egresos
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 12}
                            className="fill-foreground text-base font-bold tabular-nums"
                          >
                            {formatearMonedaCorta(totalEgresos)}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {variacionMesPct !== null ? (
            <>
              {variacionMesPct > 0
                ? `Egresos +${variacionMesPct}% este mes`
                : `Egresos ${variacionMesPct}% este mes`}
              {bajoControl ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
            </>
          ) : (
            `Total: ${formatearMonedaCompleta(totalEgresos)}`
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Datos en tiempo real desde public.caja
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartEgresosDonut