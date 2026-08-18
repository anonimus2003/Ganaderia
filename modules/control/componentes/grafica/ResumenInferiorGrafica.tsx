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
  vacaDestacada = "Arete 402",
  rendimientoVaca = "28.5 Lts hoy",
  ultimoOrdeño = "Hace 2 horas",
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-gray-100">
      
      {/* Tarjeta 1: Total Período */}
      <div className="bg-gray-50/80 border border-gray-200/60 p-3.5 rounded-xl shadow-2xs hover:border-gray-300 transition">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Volumen Acumulado</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <p className="text-xl font-extrabold text-gray-900">{totalLitros.toLocaleString()}</p>
          <span className="text-xs font-semibold text-gray-500">Litros</span>
        </div>
        <p className="text-[11px] font-medium text-emerald-600 mt-0.5">En el rango seleccionado</p>
      </div>

      {/* Tarjeta 2: Promedio Diario */}
      <div className="bg-gray-50/80 border border-gray-200/60 p-3.5 rounded-xl shadow-2xs hover:border-gray-300 transition">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Promedio Diario</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <p className="text-xl font-extrabold text-gray-900">{promedioDiario.toFixed(1)}</p>
          <span className="text-xs font-semibold text-gray-500">Lts / día</span>
        </div>
        <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Rendimiento estable</p>
      </div>

      {/* Tarjeta 3: Vaca Destacada */}
      <div className="bg-gray-50/80 border border-gray-200/60 p-3.5 rounded-xl shadow-2xs hover:border-gray-300 transition">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mejor Productora</p>
        <p className="text-base font-extrabold text-gray-900 mt-1 truncate">{vacaDestacada}</p>
        <p className="text-[11px] font-medium text-gray-600 mt-0.5">{rendimientoVaca}</p>
      </div>

      {/* Tarjeta 4: Último Ordeño / Estado */}
      <div className="bg-gray-50/80 border border-gray-200/60 p-3.5 rounded-xl shadow-2xs hover:border-gray-300 transition">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Último Registro</p>
        <p className="text-base font-extrabold text-gray-900 mt-1">{ultimoOrdeño}</p>
        <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Sincronizado al día</p>
      </div>

    </div>
  );
}