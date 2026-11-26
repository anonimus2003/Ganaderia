"use client"

import { useEffect, useState } from "react"
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

interface CajaRow {
  tipo: "ingreso" | "egreso"
  monto: number | string
  fecha: string
}

interface ResumenMetrica {
  total: number
  variacionPct: number | null
  tendenciaPositiva: boolean
}

interface ResumenCaja {
  ingresos: ResumenMetrica
  egresos: ResumenMetrica
  utilidadNeta: number
  variacionUtilidadPct: number | null
  margenGananciaPct: number | null
  variacionMargenPts: number | null
  cargando: boolean
  sinDatos: boolean
  errorMsg: string | null
}

function calcularVariacionPct(actual: number, anterior: number): number | null {
  if (anterior === 0) return null
  return Number((((actual - anterior) / Math.abs(anterior)) * 100).toFixed(1))
}

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatearPorcentaje(valor: number | null, incluirSigno = true): string {
  if (valor === null || !Number.isFinite(valor)) return "—"
  const signo = incluirSigno && valor > 0 ? "+" : ""
  return `${signo}${valor.toFixed(1)}%`
}

const ESTADO_INICIAL: ResumenCaja = {
  ingresos: { total: 0, variacionPct: null, tendenciaPositiva: true },
  egresos: { total: 0, variacionPct: null, tendenciaPositiva: false },
  utilidadNeta: 0,
  variacionUtilidadPct: null,
  margenGananciaPct: null,
  variacionMargenPts: null,
  cargando: true,
  sinDatos: true,
  errorMsg: null,
}

export function SectionCards() {
  const supabase = createClient()
  const [resumen, setResumen] = useState<ResumenCaja>(ESTADO_INICIAL)

  useEffect(() => {
    let activo = true

    async function cargarCaja() {
      const { data, error } = await supabase
        .from("caja")
        .select("tipo, monto, fecha")
        .order("fecha", { ascending: false })

      if (!activo) return

      if (error) {
        setResumen({
          ...ESTADO_INICIAL,
          cargando: false,
          sinDatos: true,
          errorMsg: error.message,
        })
        return
      }

      const filas = (data ?? []) as CajaRow[]
      if (filas.length === 0) {
        setResumen({
          ...ESTADO_INICIAL,
          cargando: false,
          sinDatos: true,
        })
        return
      }

      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const anioActual = ahora.getFullYear()

      const fechaMesAnterior = new Date(anioActual, mesActual - 1, 1)
      const mesAnterior = fechaMesAnterior.getMonth()
      const anioAnterior = fechaMesAnterior.getFullYear()

      let totalIngresos = 0
      let totalEgresos = 0

      let ingresosMesActual = 0
      let ingresosMesAnterior = 0
      let egresosMesActual = 0
      let egresosMesAnterior = 0

      for (const fila of filas) {
        const monto = Number(fila.monto)
        if (!Number.isFinite(monto)) continue

        const fecha = fila.fecha ? new Date(fila.fecha) : null
        const fechaValida = fecha && !Number.isNaN(fecha.getTime())
        const esMesActual =
          fechaValida &&
          fecha.getFullYear() === anioActual &&
          fecha.getMonth() === mesActual
        const esMesAnterior =
          fechaValida &&
          fecha.getFullYear() === anioAnterior &&
          fecha.getMonth() === mesAnterior

        if (fila.tipo === "ingreso") {
          totalIngresos += monto
          if (esMesActual) ingresosMesActual += monto
          else if (esMesAnterior) ingresosMesAnterior += monto
        } else if (fila.tipo === "egreso") {
          totalEgresos += monto
          if (esMesActual) egresosMesActual += monto
          else if (esMesAnterior) egresosMesAnterior += monto
        }
      }

      const utilidadNeta = totalIngresos - totalEgresos
      const utilidadMesActual = ingresosMesActual - egresosMesActual
      const utilidadMesAnterior = ingresosMesAnterior - egresosMesAnterior

      const margenGananciaPct =
        totalIngresos > 0
          ? Number(((utilidadNeta / totalIngresos) * 100).toFixed(1))
          : null

      const margenMesActual =
        ingresosMesActual > 0 ? (utilidadMesActual / ingresosMesActual) * 100 : null
      const margenMesAnterior =
        ingresosMesAnterior > 0
          ? (utilidadMesAnterior / ingresosMesAnterior) * 100
          : null

      const variacionMargenPts =
        margenMesActual !== null && margenMesAnterior !== null
          ? Number((margenMesActual - margenMesAnterior).toFixed(1))
          : null

      const varIngresos = calcularVariacionPct(ingresosMesActual, ingresosMesAnterior)
      const varEgresos = calcularVariacionPct(egresosMesActual, egresosMesAnterior)
      const varUtilidad = calcularVariacionPct(utilidadMesActual, utilidadMesAnterior)

      setResumen({
        ingresos: {
          total: totalIngresos,
          variacionPct: varIngresos,
          tendenciaPositiva: (varIngresos ?? 0) >= 0,
        },
        egresos: {
          total: totalEgresos,
          variacionPct: varEgresos,
          tendenciaPositiva: (varEgresos ?? 0) <= 0,
        },
        utilidadNeta,
        variacionUtilidadPct: varUtilidad,
        margenGananciaPct,
        variacionMargenPts,
        cargando: false,
        sinDatos: false,
        errorMsg: null,
      })
    }

    void cargarCaja()
    return () => {
      activo = false
    }
  }, [supabase])

  const utilidadPositiva = resumen.utilidadNeta >= 0
  const margenPositivo = (resumen.margenGananciaPct ?? 0) >= 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {resumen.cargando ? "Cargando..." : formatearMoneda(resumen.ingresos.total)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {resumen.ingresos.tendenciaPositiva ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
              {formatearPorcentaje(resumen.ingresos.variacionPct)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {resumen.errorMsg
              ? resumen.errorMsg
              : resumen.sinDatos
              ? "Sin ingresos registrados en caja"
              : resumen.ingresos.tendenciaPositiva
              ? "Ingresos al alza este mes"
              : "Menor ingreso frente al mes anterior"}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acumulado en tabla caja (tipo = ingreso)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Egresos Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {resumen.cargando ? "Cargando..." : formatearMoneda(resumen.egresos.total)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {resumen.egresos.tendenciaPositiva ? (
                <TrendingDownIcon />
              ) : (
                <TrendingUpIcon />
              )}
              {formatearPorcentaje(resumen.egresos.variacionPct)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {resumen.errorMsg
              ? resumen.errorMsg
              : resumen.sinDatos
              ? "Sin egresos registrados en caja"
              : resumen.egresos.tendenciaPositiva
              ? "Egresos contenidos frente al mes previo"
              : "Mayor egreso frente al mes anterior"}
            <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acumulado en tabla caja (tipo = egreso)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Utilidad Neta</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {resumen.cargando ? "Cargando..." : formatearMoneda(resumen.utilidadNeta)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {utilidadPositiva ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {formatearPorcentaje(resumen.variacionUtilidadPct)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {resumen.errorMsg
              ? resumen.errorMsg
              : resumen.sinDatos
              ? "Sin movimientos en caja"
              : utilidadPositiva
              ? "Balance neto positivo"
              : "Balance neto en déficit"}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Ingresos totales menos egresos</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Margen Ganancia</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {resumen.cargando
              ? "Cargando..."
              : resumen.margenGananciaPct !== null
              ? `${resumen.margenGananciaPct.toFixed(1)}%`
              : "0.0%"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {margenPositivo ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {resumen.variacionMargenPts !== null
                ? `${resumen.variacionMargenPts > 0 ? "+" : ""}${resumen.variacionMargenPts.toFixed(1)} pts`
                : "—"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {resumen.errorMsg
              ? resumen.errorMsg
              : resumen.sinDatos
              ? "Sin ingresos base para margen"
              : margenPositivo
              ? "Rentabilidad sobre ingresos"
              : "Margen por debajo de cero"}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            (Utilidad neta / Ingresos totales) × 100
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}