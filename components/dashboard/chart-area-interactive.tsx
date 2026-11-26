"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { createClient } from "@/lib/client"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart for milk production"

type RangoProduccion = "7d" | "meses" | "anos"

interface OrdenoRow {
  id: string
  bovino_id: string
  fecha: string
  litros: number | string
  jornada: string | null
  concentrado_kg: number | string | null
}

interface PuntoLecheArea {
  clave: string
  etiqueta: string
  manana: number
  tarde: number
  total: number
}

const chartConfig = {
  total: {
    label: "Total (L)",
    color: "var(--primary)",
  },
  manana: {
    label: "Mañana (L)",
    color: "#22c55e",
  },
  tarde: {
    label: "Tarde (L)",
    color: "#3b82f6",
  },
} satisfies ChartConfig

function fechaBogotaISO(offsetDias = 0): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const hoyStr = formatter.format(new Date())
  const [y, m, d] = hoyStr.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDias))
  return dt.toISOString().slice(0, 10)
}

function formatoFechaCorta(fechaIso: string): string {
  const [y, m, d] = fechaIso.slice(0, 10).split("-").map(Number)
  const fecha = new Date(Date.UTC(y, m - 1, d))
  return fecha.toLocaleDateString("es-CO", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  })
}

function etiquetaMes(anio: number, mesIdx: number): string {
  const fecha = new Date(Date.UTC(anio, mesIdx, 1))
  const mes = fecha.toLocaleDateString("es-CO", {
    timeZone: "UTC",
    month: "short",
  })
  return `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${String(anio).slice(-2)}`
}

async function obtenerTodosLosOrdenos(
  supabase: ReturnType<typeof createClient>,
  bovinoId?: string
): Promise<{ rows: OrdenoRow[]; errorMsg: string | null }> {
  const pageSize = 1000
  let from = 0
  const todasLasFilas: OrdenoRow[] = []

  while (true) {
    let query = supabase
      .from("ordeño")
      .select("id, bovino_id, fecha, litros, jornada, concentrado_kg")
      .order("fecha", { ascending: true })

    if (bovinoId && bovinoId !== "ALL") {
      query = query.eq("bovino_id", bovinoId)
    }

    const { data, error } = await query.range(from, from + pageSize - 1)

    if (error) {
      return { rows: todasLasFilas, errorMsg: error.message }
    }

    const lote = (data ?? []) as OrdenoRow[]
    todasLasFilas.push(...lote)

    if (lote.length < pageSize) {
      break
    }
    from += pageSize
  }

  return { rows: todasLasFilas, errorMsg: null }
}

export function ChartAreaInteractive({
  bovinoId = "ALL",
}: {
  bovinoId?: string
}) {
  const isMobile = useIsMobile()
  const supabase = React.useMemo(() => createClient(), [])
  const [timeRange, setTimeRange] = React.useState<RangoProduccion>("7d")
  const [filasOrdeno, setFilasOrdeno] = React.useState<OrdenoRow[]>([])
  const [cargando, setCargando] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  React.useEffect(() => {
    let activo = true

    async function cargarProduccionLeche() {
      setCargando(true)
      const { rows, errorMsg: err } = await obtenerTodosLosOrdenos(
        supabase,
        bovinoId
      )

      if (!activo) return

      setFilasOrdeno(rows)
      setErrorMsg(err)
      setCargando(false)
    }

    void cargarProduccionLeche()
    return () => {
      activo = false
    }
  }, [supabase, bovinoId])

  const filteredData = React.useMemo<PuntoLecheArea[]>(() => {
    const hoyStr = fechaBogotaISO(0)
    const [anioActual, mesActual] = hoyStr.split("-").map(Number)

    if (timeRange === "7d") {
      const mapa = new Map<string, PuntoLecheArea>()
      const dias: string[] = []

      for (let i = -6; i <= 0; i++) {
        const dia = fechaBogotaISO(i)
        dias.push(dia)
        mapa.set(dia, {
          clave: dia,
          etiqueta: formatoFechaCorta(dia),
          manana: 0,
          tarde: 0,
          total: 0,
        })
      }

      for (const fila of filasOrdeno) {
        const dia = fila.fecha?.slice(0, 10)
        if (!dia || !mapa.has(dia)) continue
        const item = mapa.get(dia)!
        const litros = Number(fila.litros)
        const val = Number.isFinite(litros) ? litros : 0
        const jornadaNorm = (fila.jornada ?? "").trim().toLowerCase()

        if (jornadaNorm === "mañana" || jornadaNorm === "manana") {
          item.manana += val
        } else if (jornadaNorm === "tarde") {
          item.tarde += val
        }
        item.total += val
      }

      return dias.map((dia) => {
        const item = mapa.get(dia)!
        return {
          ...item,
          manana: Number(item.manana.toFixed(1)),
          tarde: Number(item.tarde.toFixed(1)),
          total: Number(item.total.toFixed(1)),
        }
      })
    }

    if (timeRange === "meses") {
      const mapa = new Map<string, PuntoLecheArea>()
      const claves: string[] = []

      for (let offset = -11; offset <= 0; offset++) {
        const dt = new Date(Date.UTC(anioActual, mesActual - 1 + offset, 1))
        const y = dt.getUTCFullYear()
        const m = dt.getUTCMonth()
        const clave = `${y}-${String(m + 1).padStart(2, "0")}`
        claves.push(clave)
        mapa.set(clave, {
          clave,
          etiqueta: etiquetaMes(y, m),
          manana: 0,
          tarde: 0,
          total: 0,
        })
      }

      for (const fila of filasOrdeno) {
        const dia = fila.fecha?.slice(0, 10)
        if (!dia || dia.length < 7) continue
        const clave = dia.slice(0, 7)
        const item = mapa.get(clave)
        if (!item) continue

        const litros = Number(fila.litros)
        const val = Number.isFinite(litros) ? litros : 0
        const jornadaNorm = (fila.jornada ?? "").trim().toLowerCase()

        if (jornadaNorm === "mañana" || jornadaNorm === "manana") {
          item.manana += val
        } else if (jornadaNorm === "tarde") {
          item.tarde += val
        }
        item.total += val
      }

      return claves.map((clave) => {
        const item = mapa.get(clave)!
        return {
          ...item,
          manana: Number(item.manana.toFixed(1)),
          tarde: Number(item.tarde.toFixed(1)),
          total: Number(item.total.toFixed(1)),
        }
      })
    }

    const mapa = new Map<string, PuntoLecheArea>()

    for (const fila of filasOrdeno) {
      const anio = fila.fecha?.slice(0, 4)
      if (!anio || anio.length !== 4) continue
      if (!mapa.has(anio)) {
        mapa.set(anio, {
          clave: anio,
          etiqueta: anio,
          manana: 0,
          tarde: 0,
          total: 0,
        })
      }
      const item = mapa.get(anio)!
      const litros = Number(fila.litros)
      const val = Number.isFinite(litros) ? litros : 0
      const jornadaNorm = (fila.jornada ?? "").trim().toLowerCase()

      if (jornadaNorm === "mañana" || jornadaNorm === "manana") {
        item.manana += val
      } else if (jornadaNorm === "tarde") {
        item.tarde += val
      }
      item.total += val
    }

    const aniosOrdenados = Array.from(mapa.keys()).sort()
    if (aniosOrdenados.length === 0) {
      return [
        {
          clave: String(anioActual),
          etiqueta: String(anioActual),
          manana: 0,
          tarde: 0,
          total: 0,
        },
      ]
    }

    return aniosOrdenados.map((anio) => {
      const item = mapa.get(anio)!
      return {
        ...item,
        manana: Number(item.manana.toFixed(1)),
        tarde: Number(item.tarde.toFixed(1)),
        total: Number(item.total.toFixed(1)),
      }
    })
  }, [filasOrdeno, timeRange])

  const descripcionTexto =
    timeRange === "7d"
      ? `Producción diaria (${filasOrdeno.length} registros · últimos 7 días)`
      : timeRange === "meses"
        ? `Producción mensual (${filasOrdeno.length} registros · últimos 12 meses)`
        : `Producción anual (${filasOrdeno.length} registros · todos los años)`

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Produccion de Leche</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{descripcionTexto}</span>
          <span className="@[540px]/card:hidden">{descripcionTexto}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              const seleccionado = value[0] as RangoProduccion | undefined
              if (seleccionado) {
                setTimeRange(seleccionado)
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
            <ToggleGroupItem value="meses">Meses</ToggleGroupItem>
            <ToggleGroupItem value="anos">Años</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value === "7d" || value === "meses" || value === "anos") {
                setTimeRange(value)
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Seleccionar rango"
            >
              <SelectValue placeholder="Últimos 7 días" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
              <SelectItem value="meses" className="rounded-lg">
                Meses
              </SelectItem>
              <SelectItem value="anos" className="rounded-lg">
                Años
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {cargando ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Cargando producción de leche...
          </div>
        ) : errorMsg ? (
          <div className="flex h-[250px] items-center justify-center px-4 text-center text-sm text-destructive">
            Error consultando ordeño: {errorMsg}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillManana" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-manana)"
                    stopOpacity={0.85}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-manana)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillTarde" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-tarde)"
                    stopOpacity={0.85}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-tarde)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="etiqueta"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) => {
                      const punto = payload?.[0]?.payload as
                        | PuntoLecheArea
                        | undefined
                      return punto?.etiqueta ?? ""
                    }}
                    formatter={(value, name) => {
                      const num = Number(value ?? 0)
                      const etiquetaSerie =
                        name === "manana"
                          ? "Mañana"
                          : name === "tarde"
                            ? "Tarde"
                            : "Total"
                      return `${etiquetaSerie}: ${num.toLocaleString("es-CO")} L`
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="tarde"
                type="natural"
                fill="url(#fillTarde)"
                stroke="var(--color-tarde)"
                stackId="a"
              />
              <Area
                dataKey="manana"
                type="natural"
                fill="url(#fillManana)"
                stroke="var(--color-manana)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}