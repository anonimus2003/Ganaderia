'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Weight, Activity, Scale, Pencil, Trash2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import PesajeModal from './PesajeModal';
import { Pesaje } from '../schemas';
import { createClient } from '@/lib/supabase/client';

export default function PesajeTable() {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pesajeAEditar, setPesajeAEditar] = useState<Pesaje | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCondicion, setFiltroCondicion] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const supabase = createClient();

  const cargarPesajes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pesajes')
        .select('*, bovinos(arete, nombre)')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error de Supabase:', error.message);
      } else if (data) {
        setPesajes(data);
      }
    } catch (error) {
      console.error('Error al cargar pesajes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPesajes();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro de pesaje?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pesajes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar:', error.message);
        alert('Hubo un error al eliminar el registro.');
      } else {
        cargarPesajes();
      }
    } catch (error) {
      console.error('Error al eliminar pesaje:', error);
    }
  };

  const handleEdit = (pesaje: Pesaje) => {
    setPesajeAEditar(pesaje);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setPesajeAEditar(null);
    setIsModalOpen(false);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroCondicion('TODOS');
    setFechaInicio('');
    setFechaFin('');
  };

  // Filtrado Corregido y Robusto
  const pesajesFiltrados = pesajes.filter((p: any) => {
    // 1. Filtro por arete o nombre
    const coincideTexto = 
      p.bovinos?.arete?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bovinos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtro por condición corporal (convertido a string para evitar problemas de tipos numéricos vs textos)
    const condicionPesaje = p.condicion_corporal !== null && p.condicion_corporal !== undefined ? String(p.condicion_corporal).trim() : '';
    const coincideCondicion = filtroCondicion === 'TODOS' || condicionPesaje === filtroCondicion;

    // 3. Filtro por rango de fechas
    let coincideFecha = true;
    if (fechaInicio && p.fecha < fechaInicio) coincideFecha = false;
    if (fechaFin && p.fecha > fechaFin) coincideFecha = false;

    return coincideTexto && coincideCondicion && coincideFecha;
  });

  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filtroCondicion, fechaInicio, fechaFin]);

  // Paginación lógica
  const totalRegistrosFiltrados = pesajesFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistrosFiltrados / registrosPorPagina) || 1;
  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const pesajesPaginados = pesajesFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  // Métricas
  const totalPesajes = pesajes.length;
  const pesoPromedio = totalPesajes > 0 
    ? Math.round(pesajes.reduce((acc, curr) => acc + curr.peso_kgs, 0) / totalPesajes) 
    : 0;

  return (
    <div className="space-y-6">
      {/* 1. CABECERA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Control de Pesajes
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Control de peso, condición corporal y filtrado por fechas
          </p>
        </div>
        <button
          onClick={() => {
            setPesajeAEditar(null);
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 text-sm"
        >
          <Plus className="w-5 h-5" />
          Registrar Pesaje
        </button>
      </div>

      {/* 2. BARRA DE FILTROS HORIZONTAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar arete o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Selector de Condición Corporal */}
        <div>
          <select
            value={filtroCondicion}
            onChange={(e) => setFiltroCondicion(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-700"
          >
            <option value="TODOS">Todas las condiciones</option>
            <option value="1">Condición 1</option>
            <option value="2">Condición 2</option>
            <option value="3">Condición 3</option>
            <option value="4">Condición 4</option>
            <option value="5">Condición 5</option>
          </select>
        </div>

        {/* Desde */}
        <div>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-600"
          />
        </div>

        {/* Hasta */}
        <div>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-600"
          />
        </div>

        {/* Botón Resetear Filtros */}
        <div>
          <button
            onClick={limpiarFiltros}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* 3. TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL REGISTROS</p>
            <h3 className="text-2xl font-black text-slate-800">{totalPesajes}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Weight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PESO PROMEDIO</p>
            <h3 className="text-2xl font-black text-slate-800">{pesoPromedio} kg</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CONTROL ACTIVO</p>
            <h3 className="text-2xl font-black text-slate-800">Al día</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FILTRADOS</p>
            <h3 className="text-2xl font-black text-slate-800">{totalRegistrosFiltrados}</h3>
          </div>
        </div>
      </div>

      {/* 4. TABLA DE DATOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-gray-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Bovino</th>
                <th className="py-4 px-6">Peso (kg)</th>
                <th className="py-4 px-6">Condición Corporal</th>
                <th className="py-4 px-6">Estado Fisiológico</th>
                <th className="py-4 px-6">Observaciones</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Cargando registros...
                  </td>
                </tr>
              ) : pesajesPaginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No se encontraron registros con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                pesajesPaginados.map((pesaje: any) => (
                  <tr key={pesaje.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-2 text-slate-500">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      {pesaje.fecha}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {pesaje.bovinos?.arete || 'N/A'}{' '}
                      <span className="block text-xs font-normal text-slate-400">
                        {pesaje.bovinos?.nombre || 'Sin nombre'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-emerald-600 text-base">
                      {pesaje.peso_kgs} kg
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                        Nivel {pesaje.condicion_corporal || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {pesaje.estado_fisiologico || 'Normal'}
                    </td>
                    <td className="py-4 px-6 text-slate-400 italic max-w-xs truncate">
                      {pesaje.observaciones || 'Sin observaciones'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(pesaje)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pesaje.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {!loading && totalRegistrosFiltrados > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-gray-100 text-xs text-slate-500">
            <span>
              Mostrando <strong className="text-slate-700">{indicePrimerRegistro + 1}</strong> a{' '}
              <strong className="text-slate-700">{Math.min(indiceUltimoRegistro, totalRegistrosFiltrados)}</strong> de{' '}
              <strong className="text-slate-700">{totalRegistrosFiltrados}</strong> registros
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="px-3.5 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <span className="px-3 font-semibold text-slate-700">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-3.5 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PesajeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={cargarPesajes} 
        pesajeAEditar={pesajeAEditar} 
      />
    </div>
  );
}