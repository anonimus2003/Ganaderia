// modules/leche/index.tsx
'use client';

import { Milk, Plus } from 'lucide-react';
import { useLeche } from './hooks/useLeche';
import { LecheMetrics } from './components/LecheMetrics';
import { LecheFilters } from './components/LecheFilters';
import { LecheTable } from './components/LecheTable';
import { LecheModal } from './components/LecheModal';

export default function DashboardProduccionLeche() {
  const milkState = useLeche();

  return (
<main className="w-full min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-6 font-sans text-slate-800 overflow-x-hidden">      
      {/* ENCABEZADO PRINCIPAL */}
      <header className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
             Producción de Leche
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Control de ordeño, concentrado y filtrado por fechas
          </p>
        </div>

        <button
          onClick={() => {
            if (milkState.bovinosLista.length > 0 && !milkState.formData.bovino_id) {
              milkState.setFormData((prev) => ({ ...prev, bovino_id: milkState.bovinosLista[0].id }));
            }
            milkState.setIsModalOpen(true);
          }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-[0.98] transition-all duration-200">     <div className="bg-white/20 p-1 rounded-xl">
                <Plus className="w-4 h-4 text-white" />
                </div>
               <span>Registrar Leche</span>
        </button>

      </header>

      {/* FILTROS */}
      <LecheFilters state={milkState} />

      {/* MÉTRICAS */}
      <LecheMetrics 
        litrosTotales={milkState.litrosTotales}
        concentradoTotal={milkState.concentradoTotal}
        promedioOrdeno={milkState.promedioOrdeno}
        totalCount={milkState.totalCount}
      />

      {/* TABLA DE REGISTROS */}
      <LecheTable state={milkState} />

      {/* MODAL */}
      <LecheModal state={milkState} />

    </main>
  );
}