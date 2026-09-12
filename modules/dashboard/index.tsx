// modules/dashboard/DashboardHato.tsx
"use client"

import { useState } from "react"
import { GraficaLeche } from "./componentes/graficas/GraficaLeche"
import { GraficaPesaje } from "./componentes/graficas/GraficaPesaje"
import { GraficaEstadoHato } from "./componentes/graficas/GraficaEstadoHato"
import { DashboardHeader } from "./componentes/DashboardHeader"
import { AlertasRetiros } from "./componentes/tablas/TablaRetiros"

import { KpiProduccionLeche } from "./componentes/metricas/ProduccionTotalHoy"
import { KpiDiasLactancia } from "./componentes/metricas/DiasLactancia"
import { KpiTotalAnimales } from "./componentes/metricas/TotalAnimales"
import { KpiVacasEnOrdeno } from "./componentes/metricas/VacasenOrdeño"

interface DashboardHatoProps {
  totalAnimalesReal?: number
}

export default function DashboardHato({ totalAnimalesReal }: DashboardHatoProps) {
  const [vacaSeleccionada, setVacaSeleccionada] = useState("general")
  const nombreUsuario = "Olmer Ruiz"

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <main className="flex-1 space-y-6 p-4 md:p-8">
        
        <DashboardHeader
          nombreUsuario={nombreUsuario}
          vacaSeleccionada={vacaSeleccionada}
          onVacaChange={setVacaSeleccionada}
        />

        {/* Cambiado a grid-cols-2 para que en celulares se acomoden 2 y 2 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiProduccionLeche vacaSeleccionada={vacaSeleccionada} />
          <KpiDiasLactancia vacaSeleccionada={vacaSeleccionada} />
          <KpiTotalAnimales />
          <KpiVacasEnOrdeno />
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <div className="col-span-1 lg:col-span-2">
            <GraficaLeche vacaSeleccionada={vacaSeleccionada} />
          </div>
          <div className="col-span-1">
            <GraficaPesaje vacaSeleccionada={vacaSeleccionada} />
          </div>
          <div className="col-span-1">
            <GraficaEstadoHato />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <AlertasRetiros />
          </div>
        </div>
      </main>
    </div>
  )
}