"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BellIcon, ShieldAlertIcon, CheckCircle2Icon } from "lucide-react"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsDialog({
  open,
  onOpenChange,
}: NotificationsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellIcon className="size-4" />
            Alertas y Notificaciones
          </DialogTitle>
          <DialogDescription>
            Avisos operativos, retiros de medicamentos y novedades del hato.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
            <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <div className="space-y-0.5 text-xs">
              <p className="font-semibold text-foreground">
                Control de retiro de medicamentos
              </p>
              <p className="text-muted-foreground">
                Revisa en el módulo de Sanidad los animales con tiempo de retiro
                vigente antes de registrar ordeño comercial.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div className="space-y-0.5 text-xs">
              <p className="font-semibold text-foreground">
                Sistema sincronizado
              </p>
              <p className="text-muted-foreground">
                Tus registros de inventario, pesajes y ordeño están conectados en
                tiempo real con Agronova.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}