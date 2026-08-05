import React from 'react';
import { 
  Search, Filter, Calendar, X, Pencil, Trash2, 
  Clock, UserCheck, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { Tratamiento } from '../schemas';

interface TratamientosTableProps {
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterVia: string;
  setFilterVia: (val: string) => void;
  filterFecha: string;
  setFilterFecha: (val: string) => void;
  paginatedTratamientos: Tratamiento[];
  filteredTratamientos: Tratamiento[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  startIndex: number;
  ITEMS_PER_PAGE: number;
  handleOpenEditModal: (t: Tratamiento) => void;
  handleDelete: (id: string) => void;
  isEnRetiro: (fechaAplicacion: string, diasRetiro: number) => boolean;
}

export const TratamientosTable: React.FC<TratamientosTableProps> = ({
  loading,
  searchTerm,
  setSearchTerm,
  filterVia,
  setFilterVia,
  filterFecha,
  setFilterFecha,
  paginatedTratamientos,
  filteredTratamientos,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  ITEMS_PER_PAGE,
  handleOpenEditModal,
  handleDelete,
  isEnRetiro,
}) => {
  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por arete, nombre, medicamento o vet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <label htmlFor="select-via" className="text-xs font-semibold text-slate-500 shrink-0">Vía:</label>
            <select
              id="select-via"
              value={filterVia}
              onChange={(e) => setFilterVia(e.target.value)}
              className="bg-transparent text-xs md:text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas</option>
              <option value="Intramuscular">Intramuscular</option>
              <option value="Subcutánea">Subcutánea</option>
              <option value="Oral">Oral</option>
              <option value="Tópica">Tópica</option>
              <option value="Intrauterina">Intrauterina</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <label htmlFor="input-fecha" className="text-xs font-semibold text-slate-500 shrink-0">Fecha:</label>
            <input
              id="input-fecha"
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="bg-transparent text-xs md:text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            />
            {filterFecha && (
              <button
                type="button"
                onClick={() => setFilterFecha('')}
                className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-4 px-6">Bovino / Arete</th>
                <th className="py-4 px-6">Medicamento / Dosis</th>
                <th className="py-4 px-6">Vía</th>
                <th className="py-4 px-6">Fecha Aplicación</th>
                <th className="py-4 px-6">Tiempo Retiro</th>
                <th className="py-4 px-6">Veterinario / Motivo</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-emerald-600" size={20} />
                      <span>Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTratamientos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                paginatedTratamientos.map((t) => {
                  const enRetiro = isEnRetiro(t.fecha_aplicacion, t.tiempo_retiro);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{t.bovino?.arete || 'Sin arete'}</div>
                        <div className="text-xs text-slate-400">{t.bovino?.nombre || 'Sin nombre'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{t.medicamento}</div>
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-600 font-mono mt-0.5">
                          {t.dosis}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {t.via}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{t.fecha_aplicacion}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {t.tiempo_retiro > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${enRetiro ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                            <Clock size={12} />
                            {t.tiempo_retiro} días
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Sin retiro</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <UserCheck size={14} className="text-slate-400" />
                          {t.veterinario}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenEditModal(t)} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Mostrando <span className="font-semibold">{filteredTratamientos.length > 0 ? startIndex + 1 : 0}</span> a{' '}
            <span className="font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredTratamientos.length)}</span> de{' '}
            <span className="font-semibold">{filteredTratamientos.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold">Página {currentPage} de {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || totalPages === 0 || loading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};