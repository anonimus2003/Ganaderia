// componentes/metricas/TarjetaSaludHato.tsx
import React from "react";
import TarjetaBase from "./TarjetaBase";

interface Props {
  enfermos?: number;
  observacion?: number;
}

export default function TarjetaSaludHato({ enfermos = 3, observacion = 7 }: Props) {
  return (
    <TarjetaBase
      titulo="Salud del Hato"
      valorPrincipal={enfermos}
      cambioTexto="-3 vs mes anterior"
      esCambioPositivo={true} // Positivo porque bajaron los enfermos
      datosSecundarios={`En observación: ${observacion}`}
 
    />
  );
}