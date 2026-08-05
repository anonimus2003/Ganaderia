'use client';

import { Activity, Scale, HeartPulse, Database } from "lucide-react";

interface BovinoStatsProps {
  totalBovinos: number;
  totalHembras: number;
  totalMachos: number;
  enProduccionCount: number;
  pesoPromedio: string;
}

export default function BovinoStats({
  totalBovinos,
  totalHembras,
  totalMachos,
  enProduccionCount,
  pesoPromedio,
}: BovinoStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Bovinos */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inventario</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalBovinos}</h3>
          <span className="text-xs text-slate-500 mt-1 block">
            {totalHembras} Hembras / {totalMachos} Machos
          </span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <Database className="w-6 h-6" />
        </div>
      </div>

      {/* En Producción */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">En Producción</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{enProduccionCount}</h3>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Activas en ordeño</span>
        </div>
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <HeartPulse className="w-6 h-6" />
        </div>
      </div>

      {/* Peso Promedio */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Peso Promedio Inicial</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{pesoPromedio} <span className="text-sm font-normal text-slate-500">kg</span></h3>
          <span className="text-xs text-slate-500 mt-1 block">Base del lote registrado</span>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Scale className="w-6 h-6" />
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estado del Módulo</p>
          <h3 className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sincronizado
          </h3>
          <span className="text-xs text-slate-500 mt-1 block">Conectado a Supabase</span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <Activity className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}