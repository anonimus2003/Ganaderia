import React from "react";
import TarjetaBase from "./TarjetaBase";
import { Milk } from "lucide-react"; // Opcional, por si deseas añadir un icono representativo

interface Props {
  valor: number;
  porcentajeCambio?: string;
}

export default function TarjetaTotalLeche({ valor }: Props) {
  return (
    <TarjetaBase
      titulo="Total de Leche"
      valorPrincipal={
        <>
          {valor.toLocaleString()} <span className="text-sm font-normal text-gray-500">Lts</span>
        </>
      }
      esCambioPositivo={true}
      datosSecundarios="Acumulado histórico general"
    />
  );
}