"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Clock, AlertTriangle } from "lucide-react"
import { useDashboardContext } from "@/modules/dashboard/context/DashboardContext"

export function AlertasRetiros() {
  const { data, loading } = useDashboardContext()

  const retiros = data?.alertasRetiro ?? []

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold">
          <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
          <span>Alertas de Retiro Farmacológico</span>
        </CardTitle>
        <Badge variant="secondary" className="text-xs shrink-0">
          {loading ? "..." : `${retiros.length} Activos`}
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-4 px-3 sm:px-6">
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
          /* Grid optimizado: 1 col en móviles, 2 col en tablets/laptops pequeñas, 3 col en monitores grandes (xl) */
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {retiros.map((item) => {
              const esUrgente = item.diasRestantes <= 3
              
              const textoAnimal = item.nombreAnimal 
                ? `${item.codigoAnimal} - ${item.nombreAnimal}` 
                : item.codigoAnimal

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-xl border p-3.5 sm:p-4 transition-all hover:shadow-sm min-w-0 ${
                    esUrgente ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      {/* Arete + Nombre: usando line-clamp-2 para permitir 2 líneas de texto si es largo en laptop */}
                      <span 
                        className="font-bold text-sm text-foreground block line-clamp-2 leading-snug break-words" 
                        title={textoAnimal}
                      >
                        {textoAnimal}
                      </span>
                      
                      {/* Medicamento */}
                      <p 
                        className="text-xs text-muted-foreground mt-1 line-clamp-1 break-all" 
                        title={item.medicamento}
                      >
                        {item.medicamento}
                      </p>
                    </div>

                    {/* Badge de tipo de retiro */}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 shrink-0 whitespace-nowrap border ${
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

                  {/* Pie de la tarjeta */}
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-border/60">
                    <span className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> Tiempo restante:
                    </span>
                    <span className={`text-[11px] sm:text-xs font-bold flex items-center gap-1 shrink-0 ${esUrgente ? "text-destructive" : "text-foreground"}`}>
                      {esUrgente && <AlertTriangle className="h-3 w-3 shrink-0" />}
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