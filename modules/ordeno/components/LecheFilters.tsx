
"use client";// modules/leche/components/LecheFilters.tsx
import { Search, Calendar, Filter, X, RotateCcw } from 'lucide-react';
import { useLeche } from '../hooks/useLeche';

interface LecheFiltersProps {
  state: ReturnType<typeof useLeche>;
}

export function LecheFilters({ state }: LecheFiltersProps) {
  const {
    busqueda,
    setBusqueda,
    bovinosLista,
    bovinoFiltroId,
    setBovinoFiltroId,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    resetFiltros,
    setPage,
  } = state;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        
        {/* Búsqueda por texto (Arete o Nombre) */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de arete o nombre..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {busqueda && (
            <button 
              onClick={() => setBusqueda('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtro por Bovino Específico */}
        <div className="w-full lg:w-64">
          <select
            value={bovinoFiltroId}
            onChange={(e) => {
              setBovinoFiltroId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          >
            <option value="">Todos los bovinos</option>
            {bovinosLista.map((b) => (
              <option key={b.id} value={b.id}>
                 {b.arete} {b.nombre ? `- ${b.nombre}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Inicio */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 lg:w-48">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-col w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Desde</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Fecha Fin */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 lg:w-48">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-col w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Botón Reset */}
        <button
          onClick={resetFiltros}
          title="Limpiar filtros"
          className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="lg:hidden">Limpiar filtros</span>
        </button>

      </div>
    </div>
  );
}