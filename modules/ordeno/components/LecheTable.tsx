// modules/leche/components/LecheTable.tsx
import { Edit2, Trash2, Sun, Moon, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeche, PAGE_SIZE } from '../hooks/useLeche';

interface LecheTableProps {
  state: ReturnType<typeof useLeche>;
}

export function LecheTable({ state }: LecheTableProps) {
  const { registros, loading, totalCount, page, setPage, handleOpenEdit, handleDelete } = state;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  if (loading && registros.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs font-medium text-slate-400">Cargando registros de producción...</p>
      </div>
    );
  }

  if (!loading && registros.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-bold text-slate-600">No se encontraron registros de ordeño</p>
        <p className="text-[11px] text-slate-400">Intenta ajustando los filtros de búsqueda o fechas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Fecha</th>
              <th className="py-3.5 px-4">Bovino</th>
              <th className="py-3.5 px-4">Jornada</th>
              <th className="py-3.5 px-4 text-right">Litros (L)</th>
              <th className="py-3.5 px-4 text-right">Concentrado (kg)</th>
              <th className="py-3.5 px-4">Observaciones</th>
              <th className="py-3.5 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {registros.map((item) => {
              const isMañana = item.jornada === 'Mañana';
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-semibold">{item.fecha}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">
                      {item.bovinos?.arete || 'S/N'}
                    </div>
                    {item.bovinos?.nombre && (
                      <div className="text-[10px] text-slate-400 font-normal">{item.bovinos.nombre}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isMañana ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {isMañana ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                      {item.jornada}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                    {item.litros} L
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                    {item.concentrado_kg} kg
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {item.observaciones || <span className="text-slate-300 italic">Sin observaciones</span>}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Editar registro"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Eliminar registro"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINADOR INFERIOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50/50 border-t border-slate-200">
        <p className="text-xs text-slate-500 font-medium">
          Mostrando página <span className="font-bold text-slate-800">{page}</span> de <span className="font-bold text-slate-800">{totalPages}</span> (Total registros: {totalCount})
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </button>
          
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            Siguiente <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}