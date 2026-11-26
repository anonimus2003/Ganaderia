"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
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

export const description = "Milk production grouped by pasture occupied on milking date"

interface OrdenoRow {
  id: string
  bovino_id: string
  fecha: string
  litros: number | string
  jornada: string | null
  created_at: string | null
}

interface OcupacionPotreroRow {
  id: number
  potrero_id: number | string
  bovino_id: string
  fecha_entrada: string
  fecha_salida: string | null
}

interface PotreroRow {
  id: number | string
  nombre?: string | null
  codigo?: string | null
}

interface LechePorPotreroItem {
  potreroKey: string
  potreroNombre: string
  litrosTotales: number
  registrosOrdeno: number
  bovinosUnicos: number
  ultimoDia: string
}

const chartConfig = {
  litrosTotales: {
    label: "Litros de leche",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function extraerFechaDia(fechaStr: string | null | undefined): string {
  if (!fechaStr) return ""
  return fechaStr.slice(0, 10)
}

function resolverPotreroEnFecha(
  bovinoId: string,
  fechaOrdenoDia: string,
  timestampOrdeno: string | null,
  ocupacionesPorBovino: Map<string, OcupacionPotreroRow[]>,
  nombresPotreros: Map<string, string>
): { key: string; nombre: string } {
  const lista = ocupacionesPorBovino.get(bovinoId) ?? []
  const momentoRef = timestampOrdeno
    ? new Date(timestampOrdeno).getTime()
    : new Date(`${fechaOrdenoDia}T12:00:00-05:00`).getTime()

  // Buscar ocupación donde fecha_entrada <= momentoRef y (fecha_salida es null o fecha_salida >= momentoRef)
  const coincidenciaExacta = lista.find((oc) => {
    const entrada = new Date(oc.fecha_entrada).getTime()
    if (Number.isNaN(entrada) || entrada > momentoRef) return false
    if (!oc.fecha_salida) return true
    const salida = new Date(oc.fecha_salida).getTime()
    return Number.isNaN(salida) || salida >= momentoRef
  })

  // Respaldo comparando solo por día (YYYY-MM-DD) por si fecha_entrada tiene hora posterior el mismo día
  const coincidenciaDia =
    coincidenciaExacta ??
    lista.find((oc) => {
      const entradaDia = extraerFechaDia(oc.fecha_entrada)
      const salidaDia = oc.fecha_salida ? extraerFechaDia(oc.fecha_salida) : "9999-12-31"
      return entradaDia <= fechaOrdenoDia && salidaDia >= fechaOrdenoDia
    })

  if (!coincidenciaDia) {
    return {
      key: "sin_potrero",
      nombre: "Sin potrero asignado",
    }
  }

  const pKey = String(coincidenciaDia.potrero_id)
  const pNombre = nombresPotreros.get(pKey) ?? `Potrero ${pKey}`
  return { key: pKey, nombre: pNombre }
}

async function fetchAllRows<T>(
  supabase: ReturnType<typeof createClient>,
  tableName: string,
  columns: string,
  orderBy: string
): Promise<{ rows: T[]; errorMsg: string | null }> {
  const pageSize = 1000
  let from = 0
  const all: T[] = []

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .order(orderBy, { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) {
      return { rows: all, errorMsg: error.message }
    }

    const batch = (data ?? []) as T[]
    all.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return { rows: all, errorMsg: null }
}

export function ChartBarLabelCustom() {
  const supabase = React.useMemo(() => createClient(), [])
  const [datosPotreros, setDatosPotreros] = React.useState<LechePorPotreroItem[]>([])
  const [cargando, setCargando] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let activo = true

    async function cargarLechePorPotrero() {
      setCargando(true)

      const [resOrdeno, resOcupacion, resPotreros] = await Promise.all([
        fetchAllRows<OrdenoRow>(
          supabase,
          "ordeño",
          "id, bovino_id, fecha, litros, jornada, created_at",
          "fecha"
        ),
        fetchAllRows<OcupacionPotreroRow>(
          supabase,
          "historial_ocupacion_potreros",
          "id, potrero_id, bovino_id, fecha_entrada, fecha_salida",
          "fecha_entrada"
        ),
        supabase.from("potreros").select("*"),
      ])

      if (!activo) return

      const err = resOrdeno.errorMsg ?? resOcupacion.errorMsg ?? resPotreros.error?.message ?? null
      if (err) {
        setErrorMsg(err)
        setDatosPotreros([])
        setCargando(false)
        return
      }

      const nombresPotreros = new Map<string, string>()
      for (const raw of (resPotreros.data ?? []) as PotreroRow[]) {
        const idStr = String(raw.id)
        const etiqueta =
          (typeof raw.nombre === "string" && raw.nombre.trim()) ||
          (typeof raw.codigo === "string" && raw.codigo.trim()) ||
          `Potrero ${idStr}`
        nombresPotreros.set(idStr, etiqueta)
      }

      const ocupacionesPorBovino = new Map<string, OcupacionPotreroRow[]>()
      for (const oc of resOcupacion.rows) {
        const list = ocupacionesPorBovino.get(oc.bovino_id) ?? []
        list.push(oc)
        ocupacionesPorBovino.set(oc.bovino_id, list)
      }

      const acumulado = new Map<
        string,
        {
          potreroNombre: string
          litrosTotales: number
          registrosOrdeno: number
          bovinos: Set<string>
          ultimoDia: string
        }
      >()

      for (const fila of resOrdeno.rows) {
        const litros = Number(fila.litros)
        const fechaDia = extraerFechaDia(fila.fecha)
        if (!Number.isFinite(litros) || litros <= 0 || !fechaDia) continue

        const potrero = resolverPotreroEnFecha(
          fila.bovino_id,
          fechaDia,
          fila.created_at,
          ocupacionesPorBovino,
          nombresPotreros
        )

        const actual = acumulado.get(potrero.key) ?? {
          potreroNombre: potrero.nombre,
          litrosTotales: 0,
          registrosOrdeno: 0,
          bovinos: new Set<string>(),
          ultimoDia: fechaDia,
        }

        actual.litrosTotales += litros
        actual.registrosOrdeno += 1
        actual.bovinos.add(fila.bovino_id)
        if (fechaDia > actual.ultimoDia) {
          actual.ultimoDia = fechaDia
        }

        acumulado.set(potrero.key, actual)
      }

      const items: LechePorPotreroItem[] = Array.from(acumulado.entries())
        .map(([potreroKey, val]) => ({
          potreroKey,
          potreroNombre: val.potreroNombre,
          litrosTotales: Number(val.litrosTotales.toFixed(1)),
          registrosOrdeno: val.registrosOrdeno,
          bovinosUnicos: val.bovinos.size,
          ultimoDia: val.ultimoDia,
        }))
        .sort((a, b) => b.litrosTotales - a.litrosTotales)

      setDatosPotreros(items)
      setErrorMsg(null)
      setCargando(false)
    }

    void cargarLechePorPotrero()
    return () => {
      activo = false
    }
  }, [supabase])

  const potreroLider = datosPotreros[0] ?? null
  const totalGeneralLitros = React.useMemo(() => {
    return Number(
      datosPotreros.reduce((acc, item) => acc + item.litrosTotales, 0).toFixed(1)
    )
  }, [datosPotreros])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Producción de Leche por Potrero</CardTitle>
        <CardDescription>
          Litros producidos según el potrero que ocupaba cada bovino en la fecha de ordeño
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            Cruzando registros de ordeño y potreros...
          </div>
        ) : errorMsg ? (
          <div className="flex h-[240px] items-center justify-center px-4 text-center text-sm text-destructive">
            {errorMsg}
          </div>
        ) : datosPotreros.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            No hay registros de ordeño para asociar a potreros
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={datosPotreros}
              margin={{
                top: 24,
                right: 8,
                left: 8,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="potreroNombre"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => {
                      const payload = item?.payload as LechePorPotreroItem | undefined
                      const litros = Number(value ?? 0)
                      return `${litros.toLocaleString("es-CO")} L · ${payload?.registrosOrdeno ?? 0} ordeños (${payload?.bovinosUnicos ?? 0} bovinos · últ. día: ${payload?.ultimoDia ?? "-"})`
                    }}
                  />
                }
              />
              <Bar
                dataKey="litrosTotales"
                fill="var(--color-litrosTotales)"
                radius={8}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground tabular-nums"
                  fontSize={12}
                  formatter={(val: unknown) => `${Number(val ?? 0)} L`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {potreroLider ? (
            <>
              Mayor producción: {potreroLider.potreroNombre} ({potreroLider.litrosTotales.toLocaleString("es-CO")} L)
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Total acumulado: {totalGeneralLitros.toLocaleString("es-CO")} L
              <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Total cruces: {totalGeneralLitros.toLocaleString("es-CO")} L desde ordeño + historial_ocupacion_potreros
        </div>
      </CardFooter>
    </Card>
  )
}