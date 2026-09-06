// componentes/metricas/TarjetaLactancia.tsx
import React from "react";
import TarjetaBase from "./TarjetaBase";

interface Props {
  dias?: number;
}

export default function TarjetaLactancia({ dias = 142 }: Props) {
  return (
    <TarjetaBase
      titulo="Días en Lactancia (DEL)"
      valorPrincipal={
        <>
          {dias} <span className="text-sm font-normal text-gray-500">días</span>
        </>
      }
      datosSecundarios="Promedio general del hato"
    />
  );
}