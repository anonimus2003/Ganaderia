// componentes/metricas/TarjetasMetricas.tsx
import React from "react";
import TarjetaLecheHoy from "./TarjetaLecheHoy";
import TarjetaPromedioDiario from "./TarjetaPromedioDiario";
import TarjetaLactancia from "./TarjetaLactancia";
import TarjetaEstadoProductivo from "./TarjetaEstadoProductivo";

interface TarjetasMetricasProps {
  litrosHoy: number // Aquí recibe el total histórico que le mandas desde el page.tsx
  pesoReciente: number
  totalAnimales: number
  totalPotreros: number
}

export default function TarjetasMetricas({ 
  litrosHoy, 
  pesoReciente, 
  totalAnimales, 
  totalPotreros 
}: TarjetasMetricasProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {/* Aquí le pasas la variable que contiene el acumulado histórico de la vaca */}
      <TarjetaLecheHoy valor={litrosHoy} />
      
      <TarjetaPromedioDiario />
      <TarjetaLactancia />
      <TarjetaEstadoProductivo />
    </div>
  );
}