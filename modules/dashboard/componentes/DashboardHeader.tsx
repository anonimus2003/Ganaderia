"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"

interface DashboardHeaderProps {
  nombreUsuario?: string
}

export function DashboardHeader({ nombreUsuario: nombreProp }: DashboardHeaderProps) {
  const [nombreUsuario, setNombreUsuario] = useState<string>(nombreProp || "")
  const [cargandoUsuario, setCargandoUsuario] = useState<boolean>(!nombreProp)

  const { data, loading, vacaSeleccionada, setVacaSeleccionada } = useDashboardContext()

  useEffect(() => {
    if (nombreProp) return

    async function obtenerPerfil() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: perfil } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", user.id)
          .single()

        if (perfil?.nombre) {
          setNombreUsuario(perfil.nombre)
        }
      }
      setCargandoUsuario(false)
    }

    obtenerPerfil()
  }, [nombreProp])

  const vacaEncontrada = data?.bovinos?.find((vaca) => vaca.id === vacaSeleccionada)

  const textoMostrado = 
    vacaSeleccionada === "general" || !vacaSeleccionada
      ? "General"
      : vacaEncontrada
      ? `${vacaEncontrada.arete} - ${vacaEncontrada.nombre}`
      : "Seleccionar animal..."

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {cargandoUsuario ? "Cargando..." : `¡Bienvenido, ${nombreUsuario || "Usuario"}!`}
        </h1>
        <p className="text-sm text-muted-foreground">
          Panel de control y seguimiento del hato ganadero.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-[240px]">
        <Select
          value={vacaSeleccionada}
          onValueChange={(value) => {
            if (value !== null) {
              setVacaSeleccionada(value)
            }
          }}
        >
          {/* Aplicación del color #D1F843 con estilos del botón */}
          <SelectTrigger className="w-full sm:w-[230px] h-10 font-medium shadow-xs bg-[#D1F843] hover:bg-[#bedf3b] text-slate-900 border-none rounded-xl transition-colors focus:ring-2 focus:ring-[#D1F843]">
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-slate-900 shrink-0" />
              <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar animal..."}>
                {loading ? "Cargando..." : textoMostrado}
              </SelectValue>
            </div>
          </SelectTrigger>
          
          <SelectContent>
            <SelectItem value="general" className="font-medium">
              General
            </SelectItem>

            {(data?.bovinos ?? []).map((vaca) => (
              <SelectItem key={vaca.id} value={vaca.id}>
                <span className="font-semibold">{vaca.arete}</span> - {vaca.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}