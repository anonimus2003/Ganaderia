// modules/dashboard/componentes/tablas/TablaRetiros.tsx
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Clock, AlertTriangle } from "lucide-react"
import { useAlertasRetiros } from "@/modules/dashboard/hooks/useDashboard"

export function AlertasRetiros() {
  const { retiros, loading } = useAlertasRetiros()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          Alertas de Retiro Farmacológico
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          {loading ? "..." : `${retiros.length} Activos`}
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex h-[120px] w-full items-center justify-center text-muted-foreground text-sm">
            Cargando alertas de retiro...
          </div>
        ) : retiros.length === 0 ? (
          <div className="flex h-[120px] w-full flex-col items-center justify-center text-muted-foreground text-sm gap-1">
            <ShieldAlert className="h-6 w-6 text-muted-foreground/50 mb-1" />
            <span>No hay animales en periodo de retiro actualmente.</span>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {retiros.map((item) => {
              const esUrgente = item.diasRestantes <= 3
              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-sm ${
                    esUrgente ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-foreground">{item.codigoAnimal}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.medicamento}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 ${
                        item.tipo === "Leche"
                          ? "border-blue-500/30 text-blue-600 bg-blue-500/10"
                          : item.tipo === "Carne"
                          ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                          : "border-purple-500/30 text-purple-600 bg-purple-500/10"
                      }`}
                    >
                      {item.tipo}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Tiempo restante:
                    </span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${esUrgente ? "text-destructive" : "text-foreground"}`}>
                      {esUrgente && <AlertTriangle className="h-3 w-3" />}
                      {item.diasRestantes} {item.diasRestantes === 1 ? "día" : "días"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}