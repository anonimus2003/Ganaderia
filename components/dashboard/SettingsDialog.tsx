"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [nombreFinca, setNombreFinca] = useState("Unidad Ganadera Agronova")
  const [unidadLeche, setUnidadLeche] = useState("Litros (L)")
  const [unidadPeso, setUnidadPeso] = useState("Kilogramos (kg)")
  const [alertasRetiro, setAlertasRetiro] = useState(true)

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toast.success("Preferencias del sistema guardadas")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustes del Sistema</DialogTitle>
          <DialogDescription>
            Configuración general de la unidad productiva y unidades de medida.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="set-finca">Nombre de la finca / unidad</Label>
            <Input
              id="set-finca"
              value={nombreFinca}
              onChange={(e) => setNombreFinca(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="set-leche">Medida de ordeño</Label>
              <select
                id="set-leche"
                value={unidadLeche}
                onChange={(e) => setUnidadLeche(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <option value="Litros (L)">Litros (L)</option>
                <option value="Botellas">Botellas</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="set-peso">Medida de pesaje</Label>
              <select
                id="set-peso"
                value={unidadPeso}
                onChange={(e) => setUnidadPeso(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <option value="Kilogramos (kg)">Kilogramos (kg)</option>
                <option value="Arrobas (@)">Arrobas (@)</option>
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 p-3 text-sm">
            <div>
              <p className="font-medium">Alertas automáticas de retiro</p>
              <p className="text-xs text-muted-foreground">
                Avisar cuando un bovino esté en tiempo de retiro sanitario.
              </p>
            </div>
            <input
              type="checkbox"
              checked={alertasRetiro}
              onChange={(e) => setAlertasRetiro(e.target.checked)}
              className="size-4 accent-emerald-600"
            />
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar ajustes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}