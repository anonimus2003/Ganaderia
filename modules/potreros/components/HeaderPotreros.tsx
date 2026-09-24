'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface HeaderPotrerosProps {
  onAbrirPlanificador: () => void;
  totalPotreros?: number;
  totalLibres?: number;
  totalOcupados?: number;
}

export default function HeaderPotreros({ 
  onAbrirPlanificador,
  totalPotreros = 0,
  totalLibres = 0,
  totalOcupados = 0
}: HeaderPotrerosProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Lado izquierdo: Título y totales */}
        <div>
          <h2 className="font-semibold text-slate-900 tracking-tight">
            GESTIÓN Y CONTROL DE POTREROS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total potreros: <span className="font-semibold text-slate-700">{totalPotreros}</span>
          </p>
        </div>

        {/* Lado derecho: Acciones y Estados */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">

          {/* Botón Principal */}
          <Button
            onClick={onAbrirPlanificador}
            className="w-full sm:w-auto h-11 sm:h-9 text-sm order-1 sm:order-2 font-medium shadow-xs bg-[#D1F843] hover:bg-[#bedf3b] text-slate-900 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Planificar Rotación
          </Button>

          {/* Grupo de estados: Solo Libres y Ocupados */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
            
            {/* Estado: Libres */}
            <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 text-emerald-900 border border-emerald-200/70 shadow-2xs text-xs w-full sm:w-auto transition-all hover:border-emerald-300">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate font-medium text-emerald-800/90">
                Disponibles: <strong className="font-bold text-emerald-950 ml-0.5">{totalLibres}</strong>
              </span>
            </div>

            {/* Estado: Ocupados */}
            <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br from-rose-50/80 to-rose-100/40 text-rose-900 border border-rose-200/70 shadow-2xs text-xs w-full sm:w-auto transition-all hover:border-rose-300">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="truncate font-medium text-rose-800/90">
                Ocupados: <strong className="font-bold text-rose-950 ml-0.5">{totalOcupados}</strong>
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}