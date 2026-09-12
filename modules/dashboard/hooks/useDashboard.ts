// modules/dashboard/hooks/useDashboard.ts
"use client"

import { useState, useEffect } from "react"
import { 
  obtenerTotalAnimalesActivos, 
  obtenerVacasEnOrdenoHoy, 
  obtenerDiasLactancia, 
  obtenerProduccionTotalHoy, 
  obtenerListaBovinos,
  BovinoOption, 
  obtenerDatosGraficaLeche, 
  PuntoProduccion,
  obtenerDatosGraficaPesaje,
  PuntoPesaje,
  obtenerAlertasRetiros,
  RetiroAnimal,
  obtenerDistribucionHato
} from "../actions/actions.dashboard"

export function useTotalAnimales() {
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarTotal() {
      try {
        setLoading(true)
        const resultado = await obtenerTotalAnimalesActivos()
        setTotal(resultado)
      } catch (err) {
        console.error("Error al obtener total de animales:", err)
        setError("No se pudo cargar el total")
      } finally {
        setLoading(false)
      }
    }

    cargarTotal()
  }, [])

  return { total, loading, error }
}

export function useVacasEnOrdeno() {
  const [vacasOrdeno, setVacasOrdeno] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarVacasOrdeno() {
      try {
        setLoading(true)
        const resultado = await obtenerVacasEnOrdenoHoy()
        setVacasOrdeno(resultado)
      } catch (err) {
        console.error("Error al cargar vacas en ordeño:", err)
        setError("No se pudo cargar el dato")
      } finally {
        setLoading(false)
      }
    }

    cargarVacasOrdeno()
  }, [])

  return { vacasOrdeno, loading, error }
}

export function useDiasLactancia(vacaSeleccionada: string) {
  const [dias, setDias] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarDiasLactancia() {
      try {
        setLoading(true)
        const resultado = await obtenerDiasLactancia(vacaSeleccionada)
        setDias(resultado)
      } catch (err) {
        console.error("Error al cargar días de lactancia:", err)
        setError("No se pudo calcular")
      } finally {
        setLoading(false)
      }
    }

    cargarDiasLactancia()
  }, [vacaSeleccionada])

  return { dias, loading, error }
}

export function useProduccionTotalHoy(vacaSeleccionada: string) {
  const [produccion, setProduccion] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarProduccion() {
      try {
        setLoading(true)
        const resultado = await obtenerProduccionTotalHoy(vacaSeleccionada)
        setProduccion(resultado)
      } catch (err) {
        console.error("Error al cargar producción de leche:", err)
        setError("No se pudo calcular")
      } finally {
        setLoading(false)
      }
    }

    cargarProduccion()
  }, [vacaSeleccionada])

  return { produccion, loading, error }
}

export function useListaBovinos() {
  const [bovinos, setBovinos] = useState<BovinoOption[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function cargarBovinos() {
      try {
        setLoading(true)
        const resultado = await obtenerListaBovinos()
        setBovinos(resultado)
      } catch (err) {
        console.error("Error al cargar lista de bovinos:", err)
      } finally {
        setLoading(false)
      }
    }

    cargarBovinos()
  }, [])

  return { bovinos, loading }
}

export function useGraficaLeche(vacaSeleccionada: string, escalaTiempo: "dia" | "mes" | "anio" = "dia") {
  const [datos, setDatos] = useState<PuntoProduccion[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarGrafica() {
      try {
        setLoading(true)
        const resultado = await obtenerDatosGraficaLeche(vacaSeleccionada, escalaTiempo)
        setDatos(resultado)
      } catch (err) {
        console.error("Error al cargar la gráfica de leche:", err)
        setError("No se pudo cargar la gráfica")
      } finally {
        setLoading(false)
      }
    }

    cargarGrafica()
  }, [vacaSeleccionada, escalaTiempo])

  return { datos, loading, error }
}

export function useGraficaPesaje(vacaSeleccionada: string, escalaTiempo: "dias" | "meses" | "anios" = "meses") {
  const [datos, setDatos] = useState<PuntoPesaje[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarGraficaPesaje() {
      try {
        setLoading(true)
        const resultado = await obtenerDatosGraficaPesaje(vacaSeleccionada, escalaTiempo)
        setDatos(resultado)
      } catch (err) {
        console.error("Error al cargar la gráfica de pesaje:", err)
        setError("No se pudo cargar la gráfica de pesaje")
      } finally {
        setLoading(false)
      }
    }

    cargarGraficaPesaje()
  }, [vacaSeleccionada, escalaTiempo])

  return { datos, loading, error }
}


export function useAlertasRetiros() {
  const [retiros, setRetiros] = useState<RetiroAnimal[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarRetiros() {
      try {
        setLoading(true)
        const resultado = await obtenerAlertasRetiros()
        setRetiros(resultado)
      } catch (err) {
        console.error("Error al cargar alertas de retiros:", err)
        setError("No se pudieron cargar las alertas")
      } finally {
        setLoading(false)
      }
    }

    cargarRetiros()
  }, [])

  return { retiros, loading, error }
}

export function useGraficaEstadoHato() {
  const [datos, setDatos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true)
        const resultado = await obtenerDistribucionHato()
        setDatos(resultado)
      } catch (error) {
        console.error("Error al cargar la distribución del hato:", error)
        setDatos([])
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  return { datos, loading }
}