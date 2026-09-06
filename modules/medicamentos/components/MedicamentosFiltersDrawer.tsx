// modules/tratamientos/components/TratamientoFiltersDrawer.tsx
'use client';

import React from "react";
import { X, Search, RotateCcw } from "lucide-react";

interface TratamientoFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  viaSeleccionada: string;
  onViaChange: (value: string) => void;
  fechaInicio: string;
  onFechaInicioChange: (value: string) => void;
  fechaFin: string;
  onFechaFinChange: (value: string) => void;
  onReset: () => void;
}

export default function TratamientoFiltersDrawer({
  isOpen,
  onClose,
  search,
  onSearchChange,
  viaSeleccionada,
  onViaChange,
  fechaInicio,
  onFechaInicioChange,
  fechaFin,
  onFechaFinChange,
  onReset,
}: TratamientoFiltersDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-all">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Filtrar Tratamientos</h3>
            <p className="text-xs text-slate-500">Aplica filtros para refinar la búsqueda</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Drawer / Filtros */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Búsqueda general */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Búsqueda (Arete, Medicamento, Veterinario)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por arete, nombre..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 text-slate-800"
              />
            </div>
          </div>

          {/* Vía de aplicación */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Vía de Aplicación
            </label>
            <select
              value={viaSeleccionada}
              onChange={(e) => onViaChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 text-slate-800 cursor-pointer"
            >
              <option value="">Todas las vías</option>
              <option value="Intramuscular">Intramuscular</option>
              <option value="Subcutánea">Subcutánea</option>
              <option value="Endovenosa">Endovenosa</option>
              <option value="Tópica">Tópica</option>
              <option value="Oral">Oral</option>
            </select>
          </div>

          {/* Rango de Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Desde
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => onFechaInicioChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Hasta
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => onFechaFinChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Footer del Drawer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Aplicar Filtros
          </button>
        </div>

      </div>
    </div>
  );
}