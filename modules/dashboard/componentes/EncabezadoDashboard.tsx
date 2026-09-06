'use client'

import { Bell } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EncabezadoDashboardProps {
  nombreUsuario?: string
  listaBovinos: any[]
  vacaSeleccionada: any
  setVacaSeleccionada: (id: any) => void
}

export default function EncabezadoDashboard({
  nombreUsuario = 'Olmer',
  listaBovinos,
  vacaSeleccionada,
  setVacaSeleccionada,
}: EncabezadoDashboardProps) {
  const animalActual = listaBovinos.find((b) => b.id === vacaSeleccionada)

  const items = [
    { label: "Seleccionar animal", value: "" },
    ...listaBovinos.map((bovino) => ({
      label: `${bovino.nombre || 'Sin nombre'} (${bovino.arete || 'Sin arete'})`,
      value: bovino.id,
    }))
  ]

  return (
    <header className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
          GESTIÓN PECUARIA
        </h1>
        <p className="text-[11px] text-slate-500 font-medium">
          Panel operativo — Bienvenido, <span className="text-slate-900 font-semibold">{nombreUsuario}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-full sm:w-80">
          <Select 
            value={vacaSeleccionada ?? ""} 
            onValueChange={(val) => setVacaSeleccionada(val === "" ? null : val)}
          >
            <SelectTrigger className="w-full bg-white text-slate-900 opacity-100 font-medium">
              <SelectValue placeholder="Seleccionar animal">
                {animalActual 
                  ? `${animalActual.nombre || 'Sin nombre'} (${animalActual.arete || 'Sin arete'})` 
                  : "Seleccionar animal"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white opacity-100">
              <SelectGroup>
                <SelectLabel className="text-slate-500 font-bold">Bovinos</SelectLabel>
                {items.map((item) => (
                  <SelectItem 
                    key={item.value ?? "default"} 
                    value={item.value ?? ""}
                    className="text-slate-900 opacity-100 font-medium cursor-pointer hover:bg-slate-100 focus:bg-slate-100"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <button aria-label="Notificaciones" className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shrink-0 relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}