import React from "react";

interface Props {
  valor: number;
  porcentajeCambio?: string;
}

export default function TarjetaPromedioDiario({ valor, porcentajeCambio = "+8.3% vs promedio" }: Props) {
  return (
    <div className="border border-amber-900/50 bg-[#1a1712] p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-gray-400">PROMEDIO DIARIO</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-white">{valor.toFixed(1)}</span>
          <span className="text-xs text-gray-400">Lts/vaca</span>
        </div>
        <p className="text-xs text-amber-400 mt-1">↑ {porcentajeCambio}</p>
      </div>
      {/* Mini onda amarilla decorativa */}
      <div className="h-6 w-full flex items-end">
        <svg className="w-full h-full text-amber-500" fill="none" viewBox="0 0 100 20" stroke="currentColor" strokeWidth="2">
          <path d="M0 12 Q 30 18, 60 8 T 100 14" />
        </svg>
      </div>
    </div>
  );
}