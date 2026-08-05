import React from "react";

interface Props {
  valor: number;
  porcentajeCambio?: string;
}

export default function TarjetaLecheHoy({ valor, porcentajeCambio = "+12.5% vs ayer" }: Props) {
  return (
    <div className="border border-emerald-900/50 bg-[#121816] p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
      <div>
        {/* Cambiamos el título para que refleje que es el histórico global de la BD */}
        <p className="text-[10px] font-bold tracking-wider text-gray-400">PRODUCCIÓN TOTAL HISTÓRICA</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-white">{valor.toLocaleString()}</span>
          <span className="text-xs text-gray-400">Lts</span>
        </div>
        <p className="text-xs text-emerald-400 mt-1">Acumulado Supabase</p>
      </div>
      <div className="h-6 w-full flex items-end">
        <svg className="w-full h-full text-emerald-500" fill="none" viewBox="0 0 100 20" stroke="currentColor" strokeWidth="2">
          <path d="M0 15 Q 25 5, 50 12 T 100 5" />
        </svg>
      </div>
    </div>
  );
}