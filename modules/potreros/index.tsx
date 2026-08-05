'use client';

import React from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { usePotreros } from './hooks/usePotreros';
import { insertPotrero, updatePotreroCompleto, deletePotreroDb } from './actions/potreros.actions';

import MapaPotreros from './components/MapaPotreros';
import PanelDetalle from './components/PanelDetalle';
import ModalNuevoPotrero from './components/ModalNuevoPotrero';
import ModalEditarPotrero from './components/ModalEditarPotrero';

export default function GestionPotrerosModule() {
  const {
    potreros,
    loading,
    selectedId,
    setSelectedId,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    historialPotrero,
    creandoDesdeMapa,
    setCreandoDesdeMapa,
    nuevoX,
    setNuevoX,
    nuevoY,
    setNuevoY,
    isModalOpen,
    setIsModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    potreroSeleccionado,
    potrerosFiltrados,
    moverPin,
    fetchPotrerosData,
    fetchHistorialData,
  } = usePotreros();

  const handleManejarClickMapa = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!creandoDesdeMapa) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;
    setNuevoX(Math.round((xClick / rect.width) * 100));
    setNuevoY(Math.round((yClick / rect.height) * 100));
    setCreandoDesdeMapa(false);
    setIsModalOpen(true);
  };

  const agregarNuevoPotrero = async (datos: { nombre: string; area: number; pasto: string; aforo: number }) => {
    try {
      const nuevoPotreroDb = {
        nombre: datos.nombre.trim() || 'Nuevo Potrero',
        estado: 'En Descanso',
        area_m2: Number(datos.area),
        tipo_pasto: datos.pasto,
        bovinos_actuales: 0,
        dias_descanso: 0,
        crecimiento: 0,
        aforo: Number(datos.aforo),
        x: Number(nuevoX),
        y: Number(nuevoY),
      };
      const data = await insertPotrero(nuevoPotreroDb);
      setFiltroEstado('todos');
      await fetchPotrerosData();
      if (data && data.length > 0) setSelectedId(data[0].id);
      setIsModalOpen(false);
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const guardarEdicionPotrero = async (datos: {
    nombre: string;
    area: number;
    pasto: string;
    aforo: number;
    bovinos: number;
    fechaEntrada: string;
    fechaSalida: string;
  }) => {
    const bovinosFinal = Number(datos.bovinos);
    const nuevoEstado = bovinosFinal > 0 ? 'Ocupado' : 'En Descanso';
    const estadoAnterior = potreroSeleccionado?.estado || 'En Descanso';

    let diasDescansoCalculados = 0;
    if (nuevoEstado === 'En Descanso' && datos.fechaSalida) {
      const diffTime = Math.abs(new Date().getTime() - new Date(datos.fechaSalida).getTime());
      diasDescansoCalculados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    const datosActualizados = {
      nombre: datos.nombre,
      area_m2: Number(datos.area),
      estado: nuevoEstado,
      bovinos_actuales: bovinosFinal,
      tipo_pasto: datos.pasto,
      aforo: Number(datos.aforo),
      fecha_entrada_ganado: datos.fechaEntrada || null,
      fecha_salida_ganado: datos.fechaSalida || null,
      dias_descanso: diasDescansoCalculados,
    };

    const historialData = {
      potrero_id: selectedId,
      potrero_nombre: datos.nombre,
      estado_anterior: estadoAnterior,
      estado_nuevo: nuevoEstado,
      bovinos_actuales: bovinosFinal,
      fecha_entrada: datos.fechaEntrada || null,
      fecha_salida: datos.fechaSalida || null,
    };

    try {
      await updatePotreroCompleto(selectedId, datosActualizados, historialData);
      await fetchPotrerosData();
      await fetchHistorialData(selectedId);
      setIsEditModalOpen(false);
    } catch (error: any) {
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const eliminarPotrero = async (id: number) => {
    if (potreros.length <= 1) {
      alert('Debe conservar al menos un potrero en el sistema.');
      return;
    }
    if (confirm('¿Está seguro de eliminar este potrero?')) {
      try {
        await deletePotreroDb(id);
        fetchPotrerosData();
      } catch (error: any) {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando potreros desde Supabase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-100 font-sans text-slate-800 flex flex-col overflow-hidden p-4 gap-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setFiltroEstado('todos')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              filtroEstado === 'todos' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({potreros.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('Ocupado')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              filtroEstado === 'Ocupado' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ocupados
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('En Descanso')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              filtroEstado === 'En Descanso' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En Descanso
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar Potrero..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56 transition"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Potrero</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex overflow-hidden gap-4 min-h-0">
        <MapaPotreros
          potreros={potrerosFiltrados}
          selectedId={selectedId}
          onSelectPotrero={setSelectedId}
          creandoDesdeMapa={creandoDesdeMapa}
          onCrearDesdeMapa={handleManejarClickMapa}
        />

        <PanelDetalle
          potrero={potreroSeleccionado}
          historial={historialPotrero}
          onEditar={() => setIsEditModalOpen(true)}
          onEliminar={eliminarPotrero}
          onMoverPin={moverPin}
        />
      </div>

      {/* Modales */}
      <ModalNuevoPotrero
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={agregarNuevoPotrero}
        onActivarSeleccionMapa={() => {
          setIsModalOpen(false);
          setCreandoDesdeMapa(true);
        }}
      />

      <ModalEditarPotrero
        isOpen={isEditModalOpen}
        potrero={potreroSeleccionado}
        onClose={() => setIsEditModalOpen(false)}
        onSave={guardarEdicionPotrero}
      />
    </div>
  );
}