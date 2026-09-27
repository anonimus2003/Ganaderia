"use client"

import { DashboardProvider } from "./context/DashboardContext"
import { GraficaLeche } from "./componentes/graficas/GraficaLeche"
import { GraficaPesaje } from "./componentes/graficas/GraficaPesaje"
import { GraficaEstadoHato } from "./componentes/graficas/GraficaEstadoHato"
import { GraficaTopPotreros } from "./componentes/graficas/GraficaRendimientoPotreros"
import { DashboardHeader } from "./componentes/DashboardHeader"
import { AlertasRetiros } from "./componentes/tablas/TablaRetiros"
import { KpiProduccionLeche } from "./componentes/metricas/ProduccionTotalHoy"
import { KpiDiasLactancia } from "./componentes/metricas/DiasLactancia"
import { KpiTotalAnimales } from "./componentes/metricas/TotalAnimales"
import { KpiVacasEnOrdeno } from "./componentes/metricas/VacasenOrdeño"

function DashboardContent() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <main className="flex-1 space-y-6 p-4 md:p-8">
        {/* Header con bienvenida (obtiene el usuario automáticamente de Supabase) */}
        <DashboardHeader />

        {/* KPIs Principales */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiProduccionLeche />
          <KpiDiasLactancia />
          <KpiTotalAnimales />
          <KpiVacasEnOrdeno />
        </div>

        {/* Gráficas y Tablas de Monitoreo */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Gráfica principal de ordeño histórico */}
          <div className="col-span-1">
            <GraficaLeche />
          </div>

          {/* Evolución de pesajes */}
          <div className="col-span-1">
            <GraficaPesaje />
          </div>

          {/* Categorías del Hato */}
          <div className="col-span-1">
            <GraficaEstadoHato />
          </div>

          {/* Producción / Rendimiento de Leche por Potrero */}
          <div className="col-span-1">
            <GraficaTopPotreros />
          </div>

          {/* Alertas de Retiro Sanitario (ocupa las 2 columnas para no dejar espacios vacíos) */}
          <div className="col-span-1 lg:col-span-2">
            <AlertasRetiros />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardHato() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}