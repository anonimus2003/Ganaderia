'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Syringe,
  CheckCircle2,
  Clock,
  Percent,
} from 'lucide-react';
import { useInseminacion } from './hooks/useInseminacion';
import { InseminacionModal } from './components/InseminacionModal';
import { InseminacionTable } from './components/InseminacionTable';
import { InseminacionCalendarModal } from './components/InseminacionCalendar';
import { InseminacionStats } from './components/InseminacionStats';

export default function InseminacionPage() {
  const {
    inseminaciones,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    isModalOpen,
    setIsModalOpen,
    selectedInseminacion,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleDelete,
    formatDate,
    total,
    gestantes,
    pendientes,
    efectividad,
    agendaEventos,
    filteredData,
    loadInseminaciones,
  } = useInseminacion();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 md:p-8 space-y-6 text-slate-900 font-sans">
      
      {/* 1. SECCIÓN SUPERIOR: TÍTULO Y BOTÓN REGISTRAR */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Reproducción</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Control reproductivo, técnico y seguimiento por fechas</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-slate-100 transition shadow-2xs"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>Calendario</span>
            {agendaEventos.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {agendaEventos.length}
              </span>
            )}
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none bg-[#047857] hover:bg-[#065f46] text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Inseminación</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de arete o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Gestantes">Gestantes</option>
            <option value="Pendientes">Pendientes</option>
            <option value="Fallidas">Fallidas</option>
          </select>
        </div>
      </div>

      {/* 3. TARJETAS DE MÉTRICAS INFERIORES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Registros</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gestantes</p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{gestantes}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pendientes</p>
            <p className="text-xl font-black text-amber-600 mt-0.5">{pendientes}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Efectividad</p>
            <p className="text-xl font-black text-sky-700 mt-0.5">{efectividad}%</p>
          </div>
        </div>
      </div>

      {/* 4. TABLA PRINCIPAL */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Listado de Inseminaciones</h2>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl">
            {filteredData.length} resultados
          </span>
        </div>

        <InseminacionTable
          data={filteredData}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          formatDate={formatDate}
        />
      </div>

      {/* MODAL DE CREAR / EDITAR */}
      <InseminacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadInseminaciones}
        inseminacionToEdit={selectedInseminacion}
      />

      {/* CALENDARIO FLOTANTE COMPACTO */}
      {/* CALENDARIO FLOTANTE COMPACTO */}
<InseminacionCalendarModal
  eventos={agendaEventos}
  isOpen={isCalendarOpen}
  onClose={() => setIsCalendarOpen(false)}
  formatDate={formatDate}
/>
    </div>
  );
}