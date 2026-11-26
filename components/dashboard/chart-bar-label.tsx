"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
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

export const description = "A bar chart with a label for livestock weightings"

interface PesajeRow {
  id: string
  fecha: string
  peso_kgs: number | string
  condicion_corporal: number | string | null
  ganancia_diaria_kg: number | string | null
}

interface PuntoPesajeMensual {
  claveMes: string
  mesCorto: string
  mesTitulo: string
  promedioPesoKg: number
  cantidadPesajes: number
}

const chartConfig = {
  promedioPesoKg: {
    label: "Peso prom. (kg)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

function formatoMesCorto(claveMes: string): string {
  const [anio, mes] = claveMes.split("-").map(Number)
  const fecha = new Date(Date.UTC(anio, mes - 1, 1))
  const texto = fecha.toLocaleDateString("es-CO", {
    timeZone: "UTC",
    month: "short",
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(".", "")
}

function formatoMesTitulo(claveMes: string): string {
  const [anio, mes] = claveMes.split("-").map(Number)
  const fecha = new Date(Date.UTC(anio, mes - 1, 1))
  const texto = fecha.toLocaleDateString("es-CO", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

async function obtenerTodosLosPesajes(
  supabase: ReturnType<typeof createClient>
): Promise<{ rows: PesajeRow[]; errorMsg: string | null }> {
  const pageSize = 1000
  let from = 0
  const todasLasFilas: PesajeRow[] = []

  while (true) {
    const { data, error } = await supabase
      .from("pesajes")
      .select("id, fecha, peso_kgs, condicion_corporal, ganancia_diaria_kg")
      .order("fecha", { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) {
      return { rows: todasLasFilas, errorMsg: error.message }
    }

    const lote = (data ?? []) as PesajeRow[]
    todasLasFilas.push(...lote)

    if (lote.length < pageSize) {
      break
    }
    from += pageSize
  }

  return { rows: todasLasFilas, errorMsg: null }
}

export function ChartBarLabel() {
  const supabase = React.useMemo(() => createClient(), [])
  const [datosMensuales, setDatosMensuales] = React.useState<PuntoPesajeMensual[]>([])
  const [cargando, setCargando] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let activo = true

    async function cargarPesajes() {
      setCargando(true)
      const { rows, errorMsg: err } = await obtenerTodosLosPesajes(supabase)

      if (!activo) return

      if (err) {
        setErrorMsg(err)
        setDatosMensuales([])
        setCargando(false)
        return
      }

      const agrupado = new Map<string, { sumaPeso: number; conteo: number }>()

      for (const fila of rows) {
        const peso = Number(fila.peso_kgs)
        const fechaStr = fila.fecha?.slice(0, 10)
        if (!Number.isFinite(peso) || peso <= 0 || !fechaStr || fechaStr.length < 7) {
          continue
        }

        const claveMes = fechaStr.slice(0, 7) // YYYY-MM
        const actual = agrupado.get(claveMes) ?? { sumaPeso: 0, conteo: 0 }
        actual.sumaPeso += peso
        actual.conteo += 1
        agrupado.set(claveMes, actual)
      }

      const mesesOrdenados = Array.from(agrupado.keys()).sort().slice(-6)
      const serie: PuntoPesajeMensual[] = mesesOrdenados.map((claveMes) => {
        const val = agrupado.get(claveMes)!
        return {
          claveMes,
          mesCorto: formatoMesCorto(claveMes),
          mesTitulo: formatoMesTitulo(claveMes),
          promedioPesoKg: Number((val.sumaPeso / val.conteo).toFixed(1)),
          cantidadPesajes: val.conteo,
        }
      })

      setDatosMensuales(serie)
      setErrorMsg(null)
      setCargando(false)
    }

    void cargarPesajes()
    return () => {
      activo = false
    }
  }, [supabase])

  const variacionMensualPct = React.useMemo(() => {
    if (datosMensuales.length < 2) return null
    const anterior = datosMensuales[datosMensuales.length - 2].promedioPesoKg
    const actual = datosMensuales[datosMensuales.length - 1].promedioPesoKg
    if (anterior <= 0) return null
    return Number((((actual - anterior) / anterior) * 100).toFixed(1))
  }, [datosMensuales])

  const rangoTexto =
    datosMensuales.length > 0
      ? `${datosMensuales[0].mesTitulo} – ${datosMensuales[datosMensuales.length - 1].mesTitulo}`
      : "Sin registros de pesajes"

  const subePeso = (variacionMensualPct ?? 0) >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesajes - Promedio Mensual (kg)</CardTitle>
        <CardDescription>{rangoTexto}</CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            Cargando pesajes...
          </div>
        ) : errorMsg ? (
          <div className="flex h-[240px] items-center justify-center px-4 text-center text-sm text-destructive">
            {errorMsg}
          </div>
        ) : datosMensuales.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            No hay pesajes registrados en public.pesajes
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={datosMensuales}
              margin={{
                top: 24,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mesCorto"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => {
                      const peso = Number(value ?? 0)
                      const cant =
                        (item?.payload as PuntoPesajeMensual | undefined)
                          ?.cantidadPesajes ?? 0
                      return `${peso.toLocaleString("es-CO")} kg (${cant} pesajes)`
                    }}
                  />
                }
              />
              <Bar
                dataKey="promedioPesoKg"
                fill="var(--color-promedioPesoKg)"
                radius={8}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground tabular-nums"
                  fontSize={12}
                  formatter={(val: unknown) => `${Number(val ?? 0)} kg`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {variacionMensualPct !== null ? (
            <>
              {subePeso
                ? `Promedio mensual +${variacionMensualPct}% frente al mes anterior`
                : `Promedio mensual ${variacionMensualPct}% frente al mes anterior`}
              {subePeso ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </>
          ) : (
            <>
              Promedio de peso en kg desde public.pesajes
              <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando promedio mensual de peso_kgs (últimos 6 meses con datos)
        </div>
      </CardFooter>
    </Card>
  )
}