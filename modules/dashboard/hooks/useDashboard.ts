"use client"

import { useDashboardContext } from "../context/DashboardContext"

export function useDashboard() {
  const { data, loading, vacaSeleccionada, setVacaSeleccionada } = useDashboardContext()

  return {
    produccionHoy: data?.metricas.produccionHoy ?? 0,
    diasLactancia: data?.metricas.diasLactancia ?? 0,
    totalAnimales: data?.metricas.totalAnimales ?? 0,
    vacasOrdeno: data?.metricas.vacasOrdeno ?? 0,

    bovinos: data?.bovinos ?? [],
  
    graficaLeche: data?.graficaLeche ?? { dias: [], meses: [] },
    graficaPesaje: data?.graficaPesaje ?? [],
    graficaEstado: data?.graficaEstado ?? [],
    graficaPotreros: data?.graficaPotreros ?? [],
    retiros: data?.alertasRetiro ?? [],

    loading,
    vacaSeleccionada,
    setVacaSeleccionada
  }
}