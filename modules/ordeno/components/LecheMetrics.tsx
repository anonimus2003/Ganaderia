// modules/leche/components/LecheMetrics.tsx
import { Droplet, Scale, BarChart3, Database } from 'lucide-react';

interface LecheMetricsProps {
  litrosTotales: number;
  concentradoTotal: number;
  promedioOrdeno: string;
  totalCount: number;
}

export function LecheMetrics({ litrosTotales, concentradoTotal, promedioOrdeno, totalCount }: LecheMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Litros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Droplet className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Litros Totales</p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{litrosTotales.toLocaleString()} L</p>
        </div>
      </div>

      {/* Promedio por Ordeño */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Promedio / Ordeño</p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{promedioOrdeno} L</p>
        </div>
      </div>

      {/* Concentrado Total */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Concentrado Total</p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{concentradoTotal.toLocaleString()} kg</p>
        </div>
      </div>

      {/* Registros Encontrados */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registros</p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{totalCount}</p>
        </div>
      </div>
    </div>
  );
}