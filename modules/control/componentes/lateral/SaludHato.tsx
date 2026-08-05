import React from "react";

interface Props {
  porcentajeSaludables?: number;
  porcentajeObservacion?: number;
  porcentajeTratamiento?: number;
}

export default function SaludHato({
  porcentajeSaludables = 92,
  porcentajeObservacion = 6,
  porcentajeTratamiento = 2,
}: Props) {
  return (
    <div className="border border-gray-800 bg-[#0d1110] p-6 rounded-2xl space-y-4 shadow-sm">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Salud del Hato
      </h3>

      <div className="flex items-center justify-between">
        {/* Indicador Circular simulado */}
        <div className="relative w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow"></div>
          <div className="text-center">
            <span className="text-lg font-black text-white">{porcentajeSaludables}%</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-300">Saludables</span>
            <span className="font-bold text-white ml-auto">{porcentajeSaludables}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-gray-300">En observación</span>
            <span className="font-bold text-white ml-auto">{porcentajeObservacion}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-gray-300">En tratamiento</span>
            <span className="font-bold text-white ml-auto">{porcentajeTratamiento}%</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-800 text-right">
        <a href="#" className="text-xs text-emerald-400 hover:underline">Ver detalle de salud &gt;</a>
      </div>
    </div>
  );
}