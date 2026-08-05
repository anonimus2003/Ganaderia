'use client';

import React, { useState, useMemo } from "react";
import { Bovino, ESTADOS_BOVINOS, getEstadoBadgeStyle } from "../schemas";
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface BovinoTableProps {
  bovinos: Bovino[];
  loading: boolean;
  onView: (bovino: Bovino) => void;
  onEdit: (bovino: Bovino) => void;
  onDelete: (id: string, arete: string) => void;
}

export default function BovinoTable({
  bovinos,
  loading,
  onView,
  onEdit,
  onDelete,
}: BovinoTableProps) {
  // Estados de paginación, filtros locales y buscador
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterGenero, setFilterGenero] = useState("Todos");
  const itemsPerPage = 5;

  // Filtrar los bovinos según búsqueda (Arete o Nombre), etapa (estado) y género
  const filteredBovinos = useMemo(() => {
    return bovinos.filter((bovino) => {
      const matchesSearch = 
        bovino.arete.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bovino.nombre && bovino.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchEstado = filterEstado === "Todos" || bovino.estado === filterEstado;
      const matchGenero = filterGenero === "Todos" || bovino.genero === filterGenero;
      
      return matchesSearch && matchEstado && matchGenero;
    });
  }, [bovinos, searchTerm, filterEstado, filterGenero]);

  // Cálculos de paginación basados en los datos filtrados
  const totalPages = Math.ceil(filteredBovinos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBovinos = filteredBovinos.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Resetear la página actual al interactuar con filtros o buscador
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterEstado(e.target.value);
    setCurrentPage(1);
  };

  const handleGeneroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterGenero(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center text-slate-400">
        Cargando registros del hato...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* BARRA DE BÚSQUEDA Y FILTROS INTERNOS */}
      <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Buscador por Arete o Nombre */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por arete o nombre..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
          />
        </div>

        {/* Filtros por Etapa y Género */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={filterEstado}
            onChange={handleEstadoChange}
            className="px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          >
            <option value="Todos">Todas las etapas</option>
            {ESTADOS_BOVINOS.map((est) => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>

          <select
            value={filterGenero}
            onChange={handleGeneroChange}
            className="px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          >
            <option value="Todos">Todos los géneros</option>
            <option value="Hembra">Hembra</option>
            <option value="Macho">Macho</option>
          </select>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      {filteredBovinos.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          No se encontraron registros que coincidan con la búsqueda o filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 md:py-4 md:px-6">Arete</th>
                <th className="py-3 px-3 md:py-4 md:px-6">Nombre</th>
                <th className="py-3 px-3 md:py-4 md:px-6">Género</th>
                <th className="py-3 px-3 md:py-4 md:px-6">Raza</th>
                <th className="py-3 px-3 md:py-4 md:px-6">Peso Inicial</th>
                <th className="py-3 px-3 md:py-4 md:px-6">Etapa</th>
                <th className="py-3 px-3 md:py-4 md:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
              {currentBovinos.map((bovino) => (
                <tr key={bovino.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-semibold text-slate-800">
                    {bovino.arete}
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-slate-600">
                    {bovino.nombre || <span className="text-slate-300 italic">Sin nombre</span>}
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-slate-600 font-medium">
                    {bovino.genero || <span className="text-slate-300 italic">No asignado</span>}
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-slate-800 font-medium">
                    {bovino.raza || <span className="text-slate-300 italic">No asignada</span>}
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-slate-600 font-medium">
                    {bovino.peso_inicial} kg
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold border ${getEstadoBadgeStyle(bovino.estado)}`}>
                      {bovino.estado || 'No asignado'}
                    </span>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-right space-x-0.5 md:space-x-1">
                    <button
                      onClick={() => onView(bovino)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(bovino)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(bovino.id, bovino.arete)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINACIÓN INFERIOR */}
      {filteredBovinos.length > 0 && (
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Mostrando <span className="font-semibold text-slate-700">{startIndex + 1}</span> a{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(startIndex + itemsPerPage, filteredBovinos.length)}
            </span>{" "}
            de <span className="font-semibold text-slate-700">{filteredBovinos.length}</span> registros
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 px-1">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}