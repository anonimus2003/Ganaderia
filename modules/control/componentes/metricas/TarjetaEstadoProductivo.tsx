import React from "react";

interface Props {
  estado?: string;
  raza?: string;
}

export default function TarjetaEstadoProductivo({ estado = "Excelente", raza = "75% GYR - 25% HOLSTEIN" }: Props) {
  return (
    <div className="border border-blue-900/50 bg-[#12161f] p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-gray-400">ESTADO PRODUCTIVO</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-white">{estado}</span>
        </div>
        <p className="text-[11px] text-blue-400 mt-1 truncate">Raza: {raza}</p>
      </div>
      {/* Mini onda azul decorativa */}
      <div className="h-6 w-full flex items-end">
        <svg className="w-full h-full text-blue-500" fill="none" viewBox="0 0 100 20" stroke="currentColor" strokeWidth="2">
          <path d="M0 14 Q 25 2, 50 10 T 100 8" />
        </svg>
      </div>
    </div>
  );
}