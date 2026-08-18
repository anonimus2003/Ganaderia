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
    <div className="border border-gray-100 bg-white p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
        Salud del Hato
      </h3>

      <div className="flex items-center justify-between">
        {/* Indicador Circular adaptado a fondo blanco */}
        <div className="relative w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin-slow"></div>
          <div className="text-center">
            <span className="text-lg font-black text-gray-900">{porcentajeSaludables}%</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-gray-600 font-medium">Saludables</span>
            <span className="font-bold text-gray-900 ml-auto">{porcentajeSaludables}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-gray-600 font-medium">En observación</span>
            <span className="font-bold text-gray-900 ml-auto">{porcentajeObservacion}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-gray-600 font-medium">En tratamiento</span>
            <span className="font-bold text-gray-900 ml-auto">{porcentajeTratamiento}%</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 text-right">
        <a href="#" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
          Ver detalle de salud &gt;
        </a>
      </div>
    </div>
  );
}