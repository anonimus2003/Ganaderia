'use client';

import React from 'react';
import { Plus, Calendar, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Potrero, BovinoOption } from '@/modules/potreros/types/potrero.types';

interface HeaderPotrerosProps {
  total?: number;
  potreroSeleccionado?: Potrero | null;
  bovinosDisponibles?: BovinoOption[];
  vistaActual?: 'ocupacion' | 'abonos';
  onCambiarVista?: (vista: 'ocupacion' | 'abonos') => void;
  onSuccess?: () => void;
  onNuevaOcupacion?: () => void; 
  permisos?: {
    puede_crear?: boolean;
  };
}

export const HeaderPotreros: React.FC<HeaderPotrerosProps> = ({
  total,
  potreroSeleccionado,
  vistaActual = 'ocupacion',
  onCambiarVista,
  onNuevaOcupacion,
  permisos = { puede_crear: true },
}) => {
  const cambiarYDesplazar = (vista: 'ocupacion' | 'abonos') => {
    if (onCambiarVista) onCambiarVista(vista);
    
    // Hace scroll suave hacia el contenedor de las tablas abajo
    const seccionTablas = document.getElementById('seccion-tablas-expedientes');
    if (seccionTablas) {
      seccionTablas.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      {/* TÍTULO Y SUBTOTAL */}
      <div>
        <h2 className="font-semibold text-slate-900 uppercase tracking-tight text-sm sm:text-base">
          GESTIÓN PASTOREO
        </h2>
        <p className="text-xs text-slate-500">
          Total Potreros: {typeof total === 'number' ? total : 0}
        </p>
      </div>

      {/* ACCIONES */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
        
        {/* Botón Nueva Ocupación */}
        <Button
          onClick={onNuevaOcupacion}
          disabled={!permisos.puede_crear || !potreroSeleccionado}
          title={!potreroSeleccionado ? "Selecciona un potrero en el mapa primero" : ""}
          className="w-full sm:w-auto h-11 sm:h-9 text-sm text-slate-900 order-1 sm:order-2 font-medium shadow-xs bg-[#D1F843] hover:bg-[#bedf3b] active:bg-[#a9c92e] rounded-xl border-none disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2 text-slate-900" />
          Nueva ocupación
        </Button>

        {/* Botones de Ocupación / Abonos en el Header */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
          <Button
            variant={vistaActual === 'ocupacion' ? 'default' : 'outline'}
            onClick={() => cambiarYDesplazar('ocupacion')}
            className={`text-xs h-9 w-full sm:w-auto justify-center font-medium rounded-xl cursor-pointer ${
              vistaActual === 'ocupacion'
                ? 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'
                : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Ocupación
          </Button>

          <Button
            variant={vistaActual === 'abonos' ? 'default' : 'outline'}
            onClick={() => cambiarYDesplazar('abonos')}
            className={`text-xs h-9 w-full sm:w-auto justify-center font-medium rounded-xl cursor-pointer ${
              vistaActual === 'abonos'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent'
                : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 mr-1.5" />
            Abonos
          </Button>
        </div>

      </div>

    </div>
  );
};