'use client';

import React from 'react';
import { Potrero } from '../../types/potrero.types';
import { EventoBitacora } from '@/modules/potreros/types/potrero.types';

interface StatsBadgesProps {
  potreros: Potrero[];
  eventos: EventoBitacora[];
}

export const StatsBadges: React.FC<StatsBadgesProps> = ({ potreros, eventos }) => {
  const totalPotreros = potreros.length;

  const potrerosOcupados = potreros.filter(
    (p) => p.estado?.toLowerCase() === 'ocupado' || p.estado?.toLowerCase() === 'en_uso'
  ).length;

  const potrerosDisponibles = totalPotreros - potrerosOcupados;

  // Usa 'area_hectareas' o 'area' según tu tipo Potrero
  const areaTotalHa = potreros
    .reduce((acc, p: any) => acc + (Number(p.area_hectareas || p.area || p.hectareas) || 0), 0)
    .toFixed(1);

  // Filtra de forma segura según la estructura de EventoBitacora
  const totalBovinosActivos = eventos
    .filter((e: any) => e.tipo === 'OCUPACION' && (e.estado_registro === 'ACTIVO' || e.estado === 'ACTIVO' || !e.fecha_salida))
    .reduce((acc, e: any) => acc + (Number(e.cantidad_bovinos || e.bovinos || e.cantidad) || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Total Potreros</span>
          <span className="text-base">📐</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{totalPotreros}</span>
          <span className="text-[11px] text-slate-400 font-normal">{areaTotalHa} ha total</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Disponibles</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">{potrerosDisponibles}</span>
          <span className="text-[11px] text-slate-400 font-normal">en descanso</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Ocupados</span>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-400">{potrerosOcupados}</span>
          <span className="text-[11px] text-slate-400 font-normal">con ganado</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Bovinos Pastoreando</span>
          <span className="text-base">🐄</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{totalBovinosActivos}</span>
          <span className="text-[11px] text-slate-400 font-normal">cabezas</span>
        </div>
      </div>
    </div>
  );
};