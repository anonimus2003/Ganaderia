import React from "react";
import TarjetaBase from "./TarjetaBase";

interface Props {
  valor: number;
  porcentajeCambio?: string;
}

export default function TarjetaLecheHoy({ valor }: Props) {
  return (
    <TarjetaBase
      titulo="Producción Total Histórica"
      valorPrincipal={
        <>
          {valor.toLocaleString()} <span className="text-sm font-normal text-gray-500">Lts</span>
        </>
      }
      esCambioPositivo={true}
      datosSecundarios="Acumulado Supabase"
    />
  );
}