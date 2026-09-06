// componentes/metricas/TarjetaNacimientos.tsx
import React from "react";
import TarjetaBase from "./TarjetaBase";

interface Props {
  nacimientosHoy?: number;
  totalMovimientos?: number;
}

export default function TarjetaNacimientos({ nacimientosHoy = 2, totalMovimientos = 4 }: Props) {
  return (
    <TarjetaBase
      titulo="Movimiento de Animales"
      valorPrincipal={totalMovimientos}
      cambioTexto="+1 vs semana pasada"
      esCambioPositivo={true}
      datosSecundarios={`Nacimientos Hoy: ${nacimientosHoy}`}
    />
  );
}