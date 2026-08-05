import React from "react";

interface Props {
  totalLitros: number;
  promedioDiario: number;
  vacaDestacada?: string;
  rendimientoVaca?: string;
  ultimoOrdeño?: string;
}

export default function ResumenInferiorGrafica({
  totalLitros,
  promedioDiario,
  vacaDestacada = "Luna 2047",
  rendimientoVaca = "28.7 Lts/día",
  ultimoOrdeño = "06:15 AM",
}: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-800">
      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-wider">PRODUCCIÓN TOTAL</p>
        <p className="text-lg font-black text-white mt-1">{totalLitros.toLocaleString()} <span className="text-xs font-normal text-gray-400">Lts</span></p>
        <p className="text-[10px] text-emerald-400 mt-0.5">Últimos 7 días</p>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-wider">PROMEDIO DIARIO</p>
        <p className="text-lg font-black text-white mt-1">{promedioDiario.toFixed(1)} <span className="text-xs font-normal text-gray-400">Lts</span></p>
        <p className="text-[10px] text-emerald-400 mt-0.5">Últimos 7 días</p>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-wider">VACA MÁS PRODUCTIVA</p>
        <p className="text-base font-black text-white mt-1 truncate">{vacaDestacada}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{rendimientoVaca}</p>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-wider">ÚLTIMO ORDEÑO</p>
        <p className="text-base font-black text-white mt-1">{ultimoOrdeño}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Hoy</p>
      </div>
    </div>
  );
}