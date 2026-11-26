"use client"

import * as React from "react"
import { createClient } from "@/lib/client"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

interface BovinoRow {
  id: string
  genero: string
  condicion: string
}

interface OrdenoRow {
  bovino_id: string
  fecha: string
  litros: number | string
}

interface ReproduccionRow {
  bovino_id: string
  fecha_parto: string | null
  fecha_secado: string | null
}

interface MetricSummary {
  produccionHoyLitros: number
  variacionProduccionPct: number | null
  promedioDiasLactancia: number
  animalesTotales: number
  vacasEnOrdeno: number
  porcentajeVacasOrdeno: number
}

const METRICAS_INICIALES: MetricSummary = {
  produccionHoyLitros: 0,
  variacionProduccionPct: null,
  promedioDiasLactancia: 0,
  animalesTotales: 0,
  vacasEnOrdeno: 0,
  porcentajeVacasOrdeno: 0,
}

function fechaLocalISO(offsetDias = 0): string {
  const ahora = new Date()
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const baseHoy = formatter.format(ahora) // YYYY-MM-DD
  const [y, m, d] = baseHoy.split("-").map(Number)
  const fechaAjustada = new Date(Date.UTC(y, m - 1, d + offsetDias))
  return fechaAjustada.toISOString().slice(0, 10)
}

function diasEntreFechas(fechaInicioStr: string, fechaFinStr: string): number {
  const inicio = new Date(`${fechaInicioStr.slice(0, 10)}T00:00:00Z`).getTime()
  const fin = new Date(`${fechaFinStr.slice(0, 10)}T00:00:00Z`).getTime()
  if (Number.isNaN(inicio) || Number.isNaN(fin)) return 0
  return Math.max(0, Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)))
}

export function SectionCards() {
  const supabase = React.useMemo(() => createClient(), [])
  const [metricas, setMetricas] = React.useState<MetricSummary>(METRICAS_INICIALES)
  const [cargando, setCargando] = React.useState(true)

  React.useEffect(() => {
    let activo = true

    async function cargarMetricas() {
      const hoy = fechaLocalISO(0)
      const ayer = fechaLocalISO(-1)
      const hace7Dias = fechaLocalISO(-7)

      const [
        { data: bovinosActivos },
        { data: ordenoReciente },
        { data: reproduccionesData },
      ] = await Promise.all([
        supabase
          .from("bovinos")
          .select("id, genero, condicion")
          .eq("condicion", "Activo"),
        supabase
          .from("ordeño")
          .select("bovino_id, fecha, litros")
          .gte("fecha", hace7Dias)
          .lte("fecha", hoy),
        supabase
          .from("reproducciones")
          .select("bovino_id, fecha_parto, fecha_secado")
          .not("fecha_parto", "is", null)
          .order("fecha_parto", { ascending: false }),
      ])

      if (!activo) return

      const bovinos = (bovinosActivos ?? []) as BovinoRow[]
      const ordenos = (ordenoReciente ?? []) as OrdenoRow[]
      const reproducciones = (reproduccionesData ?? []) as ReproduccionRow[]

      const activosIds = new Set(bovinos.map((b) => b.id))
      const hembrasActivasIds = new Set(
        bovinos.filter((b) => b.genero === "Hembra").map((b) => b.id)
      )

      // 1. Producción hoy vs ayer
      let litrosHoy = 0
      let litrosAyer = 0
      const bovinosOrdenadosHoy = new Set<string>()
      const bovinosOrdenadosRecientes = new Set<string>()

      for (const fila of ordenos) {
        const litros = Number(fila.litros)
        const litrosValidos = Number.isFinite(litros) ? litros : 0
        const fechaFila = fila.fecha?.slice(0, 10)

        if (fechaFila === hoy) {
          litrosHoy += litrosValidos
          if (hembrasActivasIds.has(fila.bovino_id)) {
            bovinosOrdenadosHoy.add(fila.bovino_id)
          }
        } else if (fechaFila === ayer) {
          litrosAyer += litrosValidos
        }

        if (hembrasActivasIds.has(fila.bovino_id)) {
          bovinosOrdenadosRecientes.add(fila.bovino_id)
        }
      }

      const variacionProduccionPct =
        litrosAyer > 0
          ? Number((((litrosHoy - litrosAyer) / litrosAyer) * 100).toFixed(1))
          : null

      // 2. Días en lactancia desde `reproducciones` (último parto sin secado posterior)
      const ultimoPartoPorBovino = new Map<string, ReproduccionRow>()
      for (const rep of reproducciones) {
        if (!activosIds.has(rep.bovino_id) || !rep.fecha_parto) continue
        if (!ultimoPartoPorBovino.has(rep.bovino_id)) {
          ultimoPartoPorBovino.set(rep.bovino_id, rep)
        }
      }

      let sumaDiasLactancia = 0
      let conteoLactancia = 0
      const vacasEnLactanciaActiva = new Set<string>()

      for (const [bovinoId, rep] of ultimoPartoPorBovino.entries()) {
        if (!rep.fecha_parto) continue
        const estaSeca =
          rep.fecha_secado !== null &&
          rep.fecha_secado.slice(0, 10) >= rep.fecha_parto.slice(0, 10) &&
          rep.fecha_secado.slice(0, 10) <= hoy

        if (!estaSeca) {
          sumaDiasLactancia += diasEntreFechas(rep.fecha_parto, hoy)
          conteoLactancia += 1
          if (hembrasActivasIds.has(bovinoId)) {
            vacasEnLactanciaActiva.add(bovinoId)
          }
        }
      }

      const promedioDiasLactancia =
        conteoLactancia > 0 ? Math.round(sumaDiasLactancia / conteoLactancia) : 0

      // 3. Animales activos y vacas en ordeño
      const animalesTotales = bovinos.length
      const vacasEnOrdeno =
        bovinosOrdenadosHoy.size > 0
          ? bovinosOrdenadosHoy.size
          : bovinosOrdenadosRecientes.size > 0
            ? bovinosOrdenadosRecientes.size
            : vacasEnLactanciaActiva.size

      const porcentajeVacasOrdeno =
        animalesTotales > 0
          ? Number(((vacasEnOrdeno / animalesTotales) * 100).toFixed(1))
          : 0

      setMetricas({
        produccionHoyLitros: Number(litrosHoy.toFixed(1)),
        variacionProduccionPct,
        promedioDiasLactancia,
        animalesTotales,
        vacasEnOrdeno,
        porcentajeVacasOrdeno,
      })
      setCargando(false)
    }

    void cargarMetricas()
    return () => {
      activo = false
    }
  }, [supabase])

  const produccionAlAlza = (metricas.variacionProduccionPct ?? 0) >= 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Produccion Total Hoy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {cargando
              ? "..."
              : `${metricas.produccionHoyLitros.toLocaleString("es-CO")} L`}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {produccionAlAlza ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
              {metricas.variacionProduccionPct !== null
                ? `${metricas.variacionProduccionPct > 0 ? "+" : ""}${metricas.variacionProduccionPct}%`
                : "Hoy"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {produccionAlAlza
              ? "Producción diaria registrada"
              : "Menor frente al día anterior"}
            {produccionAlAlza ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Tabla ordeño (fecha actual)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Dias en Lactancia</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {cargando
              ? "..."
              : `${metricas.promedioDiasLactancia.toLocaleString("es-CO")} d`}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Prom.
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Promedio desde fecha de parto{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Tabla reproducciones (sin secado)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Animales totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {cargando ? "..." : metricas.animalesTotales.toLocaleString("es-CO")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Activos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bovinos con condición Activo{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Tabla bovinos (condicion = Activo)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vacas en Ordeño</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {cargando ? "..." : metricas.vacasEnOrdeno.toLocaleString("es-CO")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {metricas.porcentajeVacasOrdeno}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {metricas.porcentajeVacasOrdeno}% de bovinos activos{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Hembras activas con ordeño / lactancia
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}