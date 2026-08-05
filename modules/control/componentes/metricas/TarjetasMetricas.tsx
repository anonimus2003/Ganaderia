import React from "react";
import TarjetaLecheHoy from "./TarjetaLecheHoy";
import TarjetaPromedioDiario from "./TarjetaPromedioDiario";
import TarjetaLactancia from "./TarjetaLactancia";
import TarjetaEstadoProductivo from "./TarjetaEstadoProductivo";

interface TarjetasMetricasProps {
  totalLitrosHoy: number; // Aquí entra el totalHistorico
  promedioDiario: number;
}

export default function TarjetasMetricas({ totalLitrosHoy, promedioDiario }: TarjetasMetricasProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Asegúrate de pasar el valor histórico global */}
      <TarjetaLecheHoy valor={totalLitrosHoy} />
      <TarjetaPromedioDiario valor={promedioDiario} />
      <TarjetaLactancia />
      <TarjetaEstadoProductivo />
    </div>
  );
}