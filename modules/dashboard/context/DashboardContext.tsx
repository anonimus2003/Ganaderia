"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { DashboardData } from "../types/dashboard"
import { getDashboardData } from "../actions/dashboardActions"

interface DashboardContextType {
  data: DashboardData | null
  loading: boolean
  vacaSeleccionada: string
  setVacaSeleccionada: (id: string) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [vacaSeleccionada, setVacaSeleccionada] = useState("general")
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const result = await getDashboardData(vacaSeleccionada)
        setData(result)
      } catch (err) {
        console.error("Error al cargar datos del Dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [vacaSeleccionada])

  return (
    <DashboardContext.Provider value={{ data, loading, vacaSeleccionada, setVacaSeleccionada }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboardContext debe ser usado dentro de un DashboardProvider")
  }
  return context
}