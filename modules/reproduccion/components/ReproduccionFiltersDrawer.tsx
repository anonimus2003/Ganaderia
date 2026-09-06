// modules/reproduccion/components/FiltrosReproduccionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { FiltrosReproduccion } from '../schemas';

interface FiltrosReproduccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filtros: FiltrosReproduccion) => void;
  filtrosActuales: FiltrosReproduccion;
}

export default function FiltrosReproduccionModal({
  isOpen,
  onClose,
  onApplyFilters,
  filtrosActuales,
}: FiltrosReproduccionModalProps) {
  
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosReproduccion>(filtrosActuales);

  useEffect(() => {
    if (isOpen) {
      setFiltrosLocales(filtrosActuales);
    }
  }, [isOpen, filtrosActuales]);

  const handleChange = (campo: keyof FiltrosReproduccion, valor: string) => {
    setFiltrosLocales(prev => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    const vacios: FiltrosReproduccion = { 
      bovino: "", 
      estado: "", 
      tipo: "", 
      fechaInicio: "", 
      fechaFin: "" 
    };
    setFiltrosLocales(vacios);
    onApplyFilters(vacios);
  };

  const handleAplicar = () => {
    onApplyFilters(filtrosLocales);
    onClose();
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="bg-white max-h-[85vh] p-6 text-xs">
        <DrawerHeader className="px-0 pb-4 border-b border-zinc-100 text-left">
          <DrawerTitle className="font-bold text-sm text-zinc-800">Filtrar Reproducción</DrawerTitle>
        </DrawerHeader>

        <div className="py-4 space-y-4 overflow-y-auto max-h-[50vh] pr-1">
          {/* Bovino */}
          <div>
            <label className={labelClass}>Bovino (Arete o Nombre)</label>
            <input 
              type="text"
              value={filtrosLocales.bovino}
              onChange={(e) => handleChange("bovino", e.target.value)}
              className={inputClass}
              placeholder="Ej. 001, Lucero..."
            />
          </div>

          {/* Estado */}
          <div>
            <label className={labelClass}>Estado</label>
            <select
              value={filtrosLocales.estado}
              onChange={(e) => handleChange("estado", e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Preñada">Preñada</option>
              <option value="Vacía">Vacía</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo</label>
            <select
              value={filtrosLocales.tipo}
              onChange={(e) => handleChange("tipo", e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              <option value="I.Artificial">I. Artificial</option>
              <option value="Monta Natural">Monta Natural</option>
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className={labelClass}>Fecha Desde</label>
            <input 
              type="date"
              value={filtrosLocales.fechaInicio}
              onChange={(e) => handleChange("fechaInicio", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className={labelClass}>Fecha Hasta</label>
            <input 
              type="date"
              value={filtrosLocales.fechaFin}
              onChange={(e) => handleChange("fechaFin", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <DrawerFooter className="px-0 pt-4 border-t border-zinc-100 flex flex-row gap-2">
          <button 
            type="button"
            onClick={limpiarFiltros}
            className="w-full py-3 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 cursor-pointer transition-colors text-center text-sm"
          >
            Limpiar
          </button>
          <button 
            type="button"
            onClick={handleAplicar}
            className="w-full py-3 bg-[#01684c] text-white rounded-xl font-medium hover:bg-[#01523c] cursor-pointer transition-colors text-center text-sm"
          >
            Listo
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}