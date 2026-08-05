import React from "react";

interface Props {
  dias?: number;
}

export default function TarjetaLactancia({ dias = 142 }: Props) {
  return (
    <div className="border border-purple-900/50 bg-[#17131b] p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-gray-400">DÍAS EN LACTANCIA (DEL)</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-white">{dias}</span>
          <span className="text-xs text-gray-400">días</span>
        </div>
        <p className="text-xs text-purple-400 mt-1">Promedio general</p>
      </div>
      {/* Mini onda morada decorativa */}
      <div className="h-6 w-full flex items-end">
        <svg className="w-full h-full text-purple-500" fill="none" viewBox="0 0 100 20" stroke="currentColor" strokeWidth="2">
          <path d="M0 10 Q 40 20, 70 5 T 100 15" />
        </svg>
      </div>
    </div>
  );
}