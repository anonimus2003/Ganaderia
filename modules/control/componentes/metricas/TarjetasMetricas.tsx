// componentes/metricas/TarjetasMetricas.tsx
import React from "react";
import TarjetaLecheHoy from "./TarjetaLecheHoy";
import TarjetaPromedioDiario from "./TarjetaPromedioDiario";
import TarjetaLactancia from "./TarjetaLactancia";
import TarjetaEstadoProductivo from "./TarjetaEstadoProductivo";

interface TarjetasMetricasProps {
  totalLitrosHoy: number;
  promedioDiario: number;
}

export default function TarjetasMetricas({ totalLitrosHoy, promedioDiario }: TarjetasMetricasProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <TarjetaLecheHoy valor={totalLitrosHoy} />
      <TarjetaPromedioDiario />
      <TarjetaLactancia />
      <TarjetaEstadoProductivo />
    </div>
  );
}