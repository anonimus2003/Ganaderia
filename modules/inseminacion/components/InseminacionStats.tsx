'use client';

import React from 'react';
import { Activity, PieChart } from 'lucide-react';
import { Inseminacion } from '../schemas';

interface InseminacionStatsProps {
  inseminaciones: Inseminacion[];
  total: number;
}

export function InseminacionStats({ inseminaciones, total }: InseminacionStatsProps) {
  const iaCount = inseminaciones.filter(i => i.tipo === 'I.A.' || !i.tipo).length;
  const montaCount = inseminaciones.filter(i => i.tipo === 'Monta Natural').length;
  
  const iaPorcentaje = total > 0 ? Math.round((iaCount / total) * 100) : 0;
  const montaPorcentaje = total > 0 ? Math.round((montaCount / total) * 100) : 0;

  const promedioServicios = total > 0 
    ? (inseminaciones.reduce((acc, curr) => acc + (curr.numero_servicios || 1), 0) / total).toFixed(1) 
    : '1.0';

  return (
    <div className="bg-white rounded-[2.5rem] p-6 border border-emerald-900/10 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800">
          <PieChart className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-emerald-950 tracking-tight">Métodos y Análisis</h2>
          <p className="text-[11px] text-emerald-600 font-medium">Distribución y rendimiento</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Barra I.A. */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
          <div className="flex justify-between text-xs font-bold text-emerald-900">
            <span>Inseminación Artificial (I.A.)</span>
            <span className="text-emerald-700">{iaPorcentaje}%</span>
          </div>
          <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${iaPorcentaje}%` }} />
          </div>
        </div>

        {/* Barra Monta Natural */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
          <div className="flex justify-between text-xs font-bold text-emerald-900">
            <span>Monta Natural</span>
            <span className="text-emerald-700">{montaPorcentaje}%</span>
          </div>
          <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${montaPorcentaje}%` }} />
          </div>
        </div>

        {/* Promedio de Servicios */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-900">Promedio Servicios / Preñez</span>
          </div>
          <span className="text-xs font-extrabold bg-emerald-200/60 text-emerald-950 px-2.5 py-1 rounded-lg">
            {promedioServicios} serv.
          </span>
        </div>
      </div>
    </div>
  );
}