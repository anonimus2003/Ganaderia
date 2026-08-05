'use client';

import React, { useState } from 'react';
import { Syringe, Calendar, User, MoreHorizontal, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Inseminacion } from '../schemas';

interface InseminacionTableProps {
  data: Inseminacion[];
  loading: boolean;
  onEdit: (item: Inseminacion) => void;
  onDelete: (id: string) => void;
  formatDate: (dateStr: string | null) => string;
}

export function InseminacionTable({
  data,
  loading,
  onEdit,
  onDelete,
  formatDate,
}: InseminacionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cálculos de paginación
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-emerald-800/60 space-y-2">
        <Syringe className="w-10 h-10 mx-auto text-emerald-400" />
        <p className="text-sm font-semibold">No se encontraron registros de inseminación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contenedor de la tabla */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-emerald-50/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-emerald-100 bg-emerald-50/60 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
              <th className="py-3 px-4">Bovino</th>
              <th className="py-3 px-4">Toro / Pajilla</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Técnico</th>
              <th className="py-3 px-4">Inseminación</th>
              <th className="py-3 px-4">Probable Parto</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100/60 text-xs font-medium text-emerald-950">
            {currentData.map((item) => {
              const arete = item.bovinos?.arete || 'S/N';
              const nombreVaca = item.bovinos?.nombre ? `- ${item.bovinos.nombre}` : '';

              // Estilos de estado
              let badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
              if (item.estado === 'Gestante' || item.estado === 'Confirmada') {
                badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
              } else if (item.estado === 'Fallida') {
                badgeStyle = 'bg-rose-100 text-rose-800 border-rose-200';
              }

              return (
                <tr key={item.id} className="hover:bg-emerald-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-emerald-900">
                    {arete} {nombreVaca}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-800">
                    {item.toro_pajilla}
                    {item.raza_toro && <span className="block text-[10px] text-emerald-600/70 font-normal">{item.raza_toro}</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100/60 text-emerald-800 text-[10px] font-bold">
                      {item.tipo || 'I.A.'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-900/80">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.tecnico || 'N/D'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-emerald-900">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formatDate(item.fecha_inseminacion)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                    {formatDate(item.fecha_probable_parto)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] border inline-block ${badgeStyle}`}>
                      {item.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-xl bg-emerald-100/60 text-emerald-800 hover:bg-emerald-200 transition"
                        title="Editar registro"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        title="Eliminar registro"
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

      {/* Controles de Paginación (Anterior / Siguiente) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs">
          <span className="text-emerald-800 font-medium">
            Mostrando del <span className="font-bold">{startIndex + 1}</span> al{' '}
            <span className="font-bold">{Math.min(startIndex + itemsPerPage, data.length)}</span> de{' '}
            <span className="font-bold">{data.length}</span> registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 hover:bg-emerald-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="px-3 py-1.5 bg-[#062c19] text-emerald-300 font-bold rounded-xl">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 hover:bg-emerald-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}