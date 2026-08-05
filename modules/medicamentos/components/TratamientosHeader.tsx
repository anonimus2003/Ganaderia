import React from 'react';
import { Stethoscope, Plus, AlertTriangle } from 'lucide-react';
import { Tratamiento, Bovino } from '../schemas';

interface TratamientosHeaderProps {
  bovinos: Bovino[];
  tratamientos: Tratamiento[];
  onOpenCreateModal: () => void;
  isEnRetiro: (fechaAplicacion: string, diasRetiro: number) => boolean;
}

export const TratamientosHeader: React.FC<TratamientosHeaderProps> = ({
  bovinos,
  tratamientos,
  onOpenCreateModal,
  isEnRetiro,
}) => {
  const totalRetiros = tratamientos.filter((t) => isEnRetiro(t.fecha_aplicacion, t.tiempo_retiro)).length;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Stethoscope size={14} />
            <span>Control Sanitario Veterinario</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Gestión de Tratamientos
          </h1>
          <p className="text-emerald-100/80 text-xs md:text-sm mt-1 max-w-xl">
            Registro clínico de medicamentos, vías de aplicación y periodos de resguardo sanitario para el hato.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-3 rounded-2xl transition-all shadow-lg hover:shadow-emerald-400/20 active:scale-95 text-sm cursor-pointer"
        >
          <Plus size={18} />
          <span>Registrar Tratamiento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-700/50">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <span className="text-xs text-emerald-200 font-medium">Total Tratamientos</span>
          <div className="text-2xl font-bold mt-1">{tratamientos.length}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <span className="text-xs text-emerald-200 font-medium">Animales en Retiro Sanitario</span>
          <div className="text-2xl font-bold mt-1 text-amber-300 flex items-center gap-2">
            {totalRetiros}
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <span className="text-xs text-emerald-200 font-medium">Bovinos Registrados</span>
          <div className="text-2xl font-bold mt-1">{bovinos.length}</div>
        </div>
      </div>
    </div>
  );
};