"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Clock, AlertTriangle, Pill } from "lucide-react"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"

export function AlertasRetiros() {
  const { data, loading } = useDashboardContext()

  const retiros = data?.alertasRetiro ?? []

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
          <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
          <span>Alertas de Retiro Farmacológico</span>
        </CardTitle>
        <Badge variant="secondary" className="text-xs shrink-0 font-medium">
          {loading ? "..." : `${retiros.length} Activos`}
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-3 px-3 sm:px-6">
        {loading ? (
          <div className="flex h-[120px] w-full items-center justify-center text-muted-foreground text-sm">
            Cargando alertas de retiro...
          </div>
        ) : retiros.length === 0 ? (
          <div className="flex h-[120px] w-full flex-col items-center justify-center text-muted-foreground text-sm gap-1">
            <ShieldAlert className="h-6 w-6 text-muted-foreground/40 mb-1" />
            <span>No hay animales en periodo de retiro actualmente.</span>
          </div>
        ) : (
          /* Contenedor en lista compacta con scroll si hay muchos elementos */
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {retiros.map((item) => {
              const esUrgente = item.diasRestantes <= 3

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    esUrgente 
                      ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10" 
                      : "border-border/60 bg-card hover:bg-muted/40"
                  }`}
                >
                  {/* Info Principal: Animal + Medicamento */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    <div className={`p-2 rounded-full shrink-0 ${esUrgente ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                      <Pill className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                          {item.codigoAnimal}
                        </span>
                        {item.nombreAnimal && (
                          <span className="text-xs text-muted-foreground truncate">
                            • {item.nombreAnimal}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-4 border ${
                            item.tipo === "Leche"
                              ? "border-blue-500/30 text-blue-600 bg-blue-500/10"
                              : "border-amber-500/30 text-amber-600 bg-amber-500/10"
                          }`}
                        >
                          {item.tipo}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5" title={item.medicamento}>
                        {item.medicamento}
                      </p>
                    </div>
                  </div>

                  {/* Contador de Días Restantes */}
                  <div className="flex items-center gap-1.5 shrink-0 text-right">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                      esUrgente 
                        ? "bg-destructive text-destructive-foreground" 
                        : "bg-muted text-foreground"
                    }`}>
                      {esUrgente && <AlertTriangle className="h-3 w-3 shrink-0" />}
                      {!esUrgente && <Clock className="h-3 w-3 shrink-0 opacity-70" />}
                      <span>{item.diasRestantes} {item.diasRestantes === 1 ? "día" : "días"}</span>
                    </div>
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