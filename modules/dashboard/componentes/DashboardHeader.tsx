// modules/dashboard/componentes/DashboardHeader.tsx
"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListaBovinos } from "@/modules/dashboard/hooks/useDashboard"

interface DashboardHeaderProps {
  nombreUsuario: string
  vacaSeleccionada: string
  onVacaChange: (vaca: string) => void
}

export function DashboardHeader({
  nombreUsuario,
  vacaSeleccionada,
  onVacaChange,
}: DashboardHeaderProps) {
  const { bovinos, loading } = useListaBovinos()

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          ¡Bienvenido, {nombreUsuario}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Panel de control y seguimiento del hato ganadero.
        </p>
      </div>

      {/* Selector de Vaca o Animal dinámico */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-[240px]">
        <Select
          value={vacaSeleccionada}
          onValueChange={(value) => {
            if (value !== null) {
              onVacaChange(value)
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder={loading ? "Cargando animales..." : "Seleccionar animal..."} />
          </SelectTrigger>
          <SelectContent>
            {/* Opción fija para ver todo el hato global */}
            <SelectItem value="general">🐮 Todo el Hato (General)</SelectItem>

            {/* Listado dinámico: Usa el ID por detrás pero muestra Arete - Nombre */}
            {bovinos.map((vaca) => (
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