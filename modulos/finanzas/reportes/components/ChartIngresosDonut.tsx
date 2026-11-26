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

export const description = "A donut chart showing income categories"

interface CajaIngresoRow {
  categoria: string
  monto: number | string
  fecha: string
}

interface CategoriaIngresoItem {
  key: string
  categoria: string
  monto: number
  valorGrafico: number
  fill: string
}

const CATEGORIAS_INGRESO = [
  "Venta de leche",
  "Venta de ganado",
  "Venta de terneros",
  "Subproductos y quesos",
  "Otros ingresos",
] as const

const COLORES_INGRESO = [
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#06b6d4",
] as const

const chartConfig = {
  monto: {
    label: "Ingresos (COP)",
  },
  venta_de_leche: {
    label: "Venta de leche",
    color: "#22c55e",
  },
  venta_de_ganado: {
    label: "Venta de ganado",
    color: "#3b82f6",
  },
  venta_de_terneros: {
    label: "Venta de terneros",
    color: "#eab308",
  },
  subproductos_y_quesos: {
    label: "Subproductos y quesos",
    color: "#a855f7",
  },
  otros_ingresos: {
    label: "Otros ingresos",
    color: "#06b6d4",
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

function construirItemsBaseIngresos(
  totalIngresos: number
): CategoriaIngresoItem[] {
  const pesoVacio = Math.max(1000, Math.round(totalIngresos * 0.08))
  return CATEGORIAS_INGRESO.map((categoria, index) => ({
    key: normalizarClaveCategoria(categoria),
    categoria,
    monto: 0,
    valorGrafico: pesoVacio,
    fill: COLORES_INGRESO[index % COLORES_INGRESO.length],
  }))
}

export function ChartIngresosDonut() {
  const supabase = React.useMemo(() => createClient(), [])

  const [categoriasData, setCategoriasData] = React.useState<
    CategoriaIngresoItem[]
  >(() => construirItemsBaseIngresos(0))
  const [cargando, setCargando] = React.useState(true)
  const [variacionMesPct, setVariacionMesPct] = React.useState<number | null>(
    null
  )
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let activo = true

    async function cargarIngresosPorCategoria() {
      const { data, error } = await supabase
        .from("caja")
        .select("categoria, monto, fecha")
        .eq("tipo", "ingreso")

      if (!activo) return

      if (error) {
        setErrorMsg(error.message)
        setCategoriasData(construirItemsBaseIngresos(0))
        setCargando(false)
        return
      }

      const filas = (data ?? []) as CajaIngresoRow[]
      const totalesPorCategoria = new Map<string, number>()

      for (const cat of CATEGORIAS_INGRESO) {
        totalesPorCategoria.set(cat, 0)
      }

      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const anioActual = ahora.getFullYear()

      const fechaMesAnterior = new Date(anioActual, mesActual - 1, 1)
      const mesAnterior = fechaMesAnterior.getMonth()
      const anioAnterior = fechaMesAnterior.getFullYear()

      let ingresosMesActual = 0
      let ingresosMesAnterior = 0
      let acumuladoTotal = 0

      for (const fila of filas) {
        const monto = Number(fila.monto)
        if (!Number.isFinite(monto) || monto <= 0) continue

        const categoriaNombre =
          CATEGORIAS_INGRESO.find((c) => c === fila.categoria) ??
          "Otros ingresos"

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
              ingresosMesActual += monto
            } else if (
              fecha.getFullYear() === anioAnterior &&
              fecha.getMonth() === mesAnterior
            ) {
              ingresosMesAnterior += monto
            }
          }
        }
      }

      const pesoMinimoVisible = Math.max(1000, Math.round(acumuladoTotal * 0.08))

      const listaCompleta: CategoriaIngresoItem[] = CATEGORIAS_INGRESO.map(
        (categoria, index) => {
          const montoReal = totalesPorCategoria.get(categoria) ?? 0
          return {
            key: normalizarClaveCategoria(categoria),
            categoria,
            monto: montoReal,
            valorGrafico: montoReal > 0 ? montoReal : pesoMinimoVisible,
            fill: COLORES_INGRESO[index % COLORES_INGRESO.length],
          }
        }
      )

      const variacion =
        ingresosMesAnterior > 0
          ? Number(
              (
                ((ingresosMesActual - ingresosMesAnterior) /
                  ingresosMesAnterior) *
                100
              ).toFixed(1)
            )
          : null

      setCategoriasData(listaCompleta)
      setVariacionMesPct(variacion)
      setErrorMsg(null)
      setCargando(false)
    }

    void cargarIngresosPorCategoria()
    return () => {
      activo = false
    }
  }, [supabase])

  const totalIngresos = React.useMemo(() => {
    return categoriasData.reduce((acc, curr) => acc + curr.monto, 0)
  }, [categoriasData])

  const tendenciaPositiva = (variacionMesPct ?? 0) >= 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>¿De dónde viene el dinero? (Ingresos)</CardTitle>
        <CardDescription>
          Todas las categorías de ingresos con su monto en el gráfico
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {cargando ? (
          <div className="mx-auto flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Cargando ingresos...
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
                        (item?.payload as CategoriaIngresoItem | undefined)
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
                            Total Ingresos
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 12}
                            className="fill-foreground text-base font-bold tabular-nums"
                          >
                            {formatearMonedaCorta(totalIngresos)}
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
              {tendenciaPositiva
                ? `Ingresos +${variacionMesPct}% este mes`
                : `Ingresos ${variacionMesPct}% este mes`}
              {tendenciaPositiva ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </>
          ) : (
            `Total: ${formatearMonedaCompleta(totalIngresos)}`
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Datos en tiempo real desde public.caja
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartIngresosDonut