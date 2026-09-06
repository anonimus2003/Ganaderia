'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, ArrowRightLeft, Sprout, X, RefreshCw } from 'lucide-react';
import { usePotreros } from './hooks/usePotreros';
import MapaPotreros from './components/MapaPotreros';
import VistaPotreros from './components/vistaPotreros';
import EditarPotreroModal from './components/EditarPotreroModal';
import HistorialList from './components/HistorialList';
import ControlGanado from './components/ControlGanado';
import ControlAbono from './components/ControlAbono';
import RecuperacionPotrero from './components/RecuperarcionPotrero';

export default function PotrerosPage() {
  const {
    potreros,
    loading,
    selectedId,
    setSelectedId,
    ingresarGanado,
    sacarGanado,
    registrarAbono,
    guardarPotrero,
    eliminarPotrero,
  } = usePotreros();

  const supabase = createClient();

  const [historialRotacion, setHistorialRotacion] = useState<any[]>([]);
  const [historialAbonos, setHistorialAbonos] = useState<any[]>([]);
  const [progresoCrecimiento, setProgresoCrecimiento] = useState<number>(0);

  const [mostrarModalEdicion, setMostrarModalEdicion] = useState<boolean>(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState<boolean>(false);
  const [mostrarMenuFlotante, setMostrarMenuFlotante] = useState<boolean>(false);
  const [accionActiva, setAccionActiva] = useState<'ganado' | 'abono' | 'recuperacion' | null>(null);
  const [creandoDesdeMapa, setCreandoDesdeMapa] = useState<boolean>(false);

  const potreroSeleccionado = potreros.find((p) => p.id === selectedId) || null;
  const estadoPotrero = potreroSeleccionado?.estado?.toLowerCase().trim() || '';
  const estaOcupado = estadoPotrero === 'ocupado';
  const estaEnDescanso = estadoPotrero === 'en descanso';

  const abrirAccion = (accion: 'ganado' | 'abono' | 'recuperacion') => {
    if (!potreroSeleccionado) return;
    setMostrarMenuFlotante(true);
    setAccionActiva(accionActiva === accion ? null : accion);
  };

  const fetchHistoriales = useCallback(async () => {
    try {
      let qR = supabase.from('historial_potreros').select('*').order('id', { ascending: false });
      let qA = supabase.from('historial_abonos').select('*').order('fecha_aplicacion', { ascending: false });

      if (selectedId !== null) {
        qR = qR.eq('potrero_id', selectedId);
        qA = qA.eq('potrero_id', selectedId);
      }

      const [{ data: rotaciones }, { data: abonos }] = await Promise.all([qR, qA]);
      setHistorialRotacion(rotaciones || []);
      setHistorialAbonos(abonos || []);
    } catch (error) {
      console.error('Error cargando historiales:', error);
    }
  }, [selectedId, supabase]);

  /* eslint-disable react-hooks/set-state-in-effect -- selection changes reset the local pasture controls. */
  useEffect(() => {
    queueMicrotask(() => { void fetchHistoriales(); });
  }, [fetchHistoriales]);

  useEffect(() => {
    if (potreroSeleccionado) {
      setProgresoCrecimiento(potreroSeleccionado.progreso_pasto || 0);
    } else {
      setProgresoCrecimiento(0);
      setMostrarMenuFlotante(false);
      setAccionActiva(null);
    }
  }, [potreroSeleccionado]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleGuardarPotrero = async (datos: any) => {
    if (!potreroSeleccionado) return;
    await guardarPotrero(datos, potreroSeleccionado.id);
    await fetchHistoriales();
  };

  const handleEliminarPotrero = async () => {
    if (!potreroSeleccionado || !eliminarPotrero) return;
    await eliminarPotrero(potreroSeleccionado.id);
    setSelectedId(null);
    setMostrarMenuFlotante(false);
    setAccionActiva(null);
    await fetchHistoriales();
  };

  // RECUPERACIÓN: Disponible solo si el progreso es exactamente 100%
  const handleRecuperacion = async (potreroId: number, progreso: number, fecha: string, observacion?: string) => {
    try {
      const progresoNormalizado = Math.min(100, Math.max(0, Number(progreso) || 0));
      const potreroActual = potreros.find((p) => p.id === potreroId);

      if (!potreroActual) throw new Error('No se encontró el potrero.');

      const estadoActual = potreroActual.estado?.toLowerCase().trim();
      let nuevoEstado = potreroActual.estado;

      if (estadoActual === 'en descanso') {
        nuevoEstado = progresoNormalizado === 100 ? 'Disponible' : 'En Descanso';
      }

      await guardarPotrero({ progreso_pasto: progresoNormalizado, estado: nuevoEstado } as any, potreroId);
      setProgresoCrecimiento(progresoNormalizado);
      await fetchHistoriales();
      setAccionActiva(null);
      setMostrarMenuFlotante(false);

      if (estadoActual === 'en descanso' && progresoNormalizado === 100) {
        alert('Recuperación registrada correctamente. El potrero ya está disponible.');
      } else {
        alert('Recuperación registrada correctamente.');
      }
    } catch (error) {
      console.error('Error registrando recuperación:', error);
      alert('No se pudo registrar la recuperación del potrero.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 relative pb-24">
      {/* CABECERA */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <span className="inline-flex text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Módulo Ganadero
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">Gestión de Potreros</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Controla animales, fertilización y recuperación del terreno.</p>

            {potreroSeleccionado && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Potrero:</span>
                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {potreroSeleccionado.nombre}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    estaOcupado
                      ? 'bg-amber-50 text-amber-700'
                      : estaEnDescanso
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {potreroSeleccionado.estado}
                </span>
              </div>
            )}
          </div>

          {/* ACCIONES PRINCIPALES */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!potreroSeleccionado}
              onClick={() => abrirAccion('ganado')}
              className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                accionActiva === 'ganado'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
              } ${!potreroSeleccionado ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowRightLeft size={17} className={accionActiva === 'ganado' ? 'text-white' : 'text-emerald-600'} />
              <span>{estaOcupado ? 'Sacar Animales' : 'Control Bovinos'}</span>
            </button>

            <button
              type="button"
              disabled={!potreroSeleccionado}
              onClick={() => abrirAccion('abono')}
              className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                accionActiva === 'abono'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
              } ${!potreroSeleccionado ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Sprout size={17} className={accionActiva === 'abono' ? 'text-white' : 'text-amber-600'} />
              <span>Abonos</span>
            </button>

            <button
              type="button"
              disabled={!potreroSeleccionado || !estaEnDescanso}
              onClick={() => abrirAccion('recuperacion')}
              className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                accionActiva === 'recuperacion'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
              } ${!potreroSeleccionado || !estaEnDescanso ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={17} className={accionActiva === 'recuperacion' ? 'text-white' : 'text-blue-600'} />
              <span>Recuperación</span>
            </button>

            <button
              type="button"
              onClick={() => setMostrarModalCreacion(true)}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              <PlusCircle size={16} />
              <span>Crear Potrero</span>
            </button>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapaPotreros
            potreros={potreros}
            selectedId={selectedId}
            onSelectPotrero={setSelectedId}
            creandoDesdeMapa={creandoDesdeMapa}
            onCrearDesdeMapa={(_coords) => {
              setCreandoDesdeMapa(true);
              setMostrarModalCreacion(true);
            }}
          />
        </div>

        <VistaPotreros
          potreroSeleccionado={potreroSeleccionado}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          setMostrarModalEdicion={setMostrarModalEdicion}
          setMostrarModalControl={() => {
            if (potreroSeleccionado) setMostrarMenuFlotante(true);
          }}
          progresoCrecimiento={progresoCrecimiento}
        />
      </div>

      {/* MODAL EDICIÓN */}
      <EditarPotreroModal
        potrero={potreroSeleccionado}
        isOpen={mostrarModalEdicion}
        onClose={() => setMostrarModalEdicion(false)}
        onSave={handleGuardarPotrero}
        onDelete={handleEliminarPotrero}
      />

      {/* FORMULARIO DE ACCIÓN */}
      {potreroSeleccionado && mostrarMenuFlotante && accionActiva && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setAccionActiva(null);
                setMostrarMenuFlotante(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-5 pr-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gestión de Potrero</span>
              <h2 className="text-xl font-black text-slate-800 mt-1">{potreroSeleccionado.nombre}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Estado actual: <span className="font-bold text-slate-700">{potreroSeleccionado.estado}</span>
              </p>
            </div>

            {accionActiva === 'ganado' && (
              <ControlGanado
                potrero={potreroSeleccionado}
                onIngresarGanado={async (id, bovinos, fecha) => {
                  await ingresarGanado(id, bovinos, fecha);
                  await fetchHistoriales();
                  setAccionActiva(null);
                  setMostrarMenuFlotante(false);
                }}
                onSacarGanado={async (id, fecha) => {
                  await sacarGanado(id, fecha);
                  await fetchHistoriales();
                  setAccionActiva(null);
                  setMostrarMenuFlotante(false);
                }}
              />
            )}

            {accionActiva === 'abono' && (
              <ControlAbono
                potreroId={potreroSeleccionado.id}
                onRegistrarAbono={async (id, insumo, cantidad, fecha) => {
                  await registrarAbono(id, insumo, cantidad, fecha);
                  await fetchHistoriales();
                  setAccionActiva(null);
                  setMostrarMenuFlotante(false);
                }}
              />
            )}

            {accionActiva === 'recuperacion' && (
              <RecuperacionPotrero potrero={potreroSeleccionado} onActualizar={handleRecuperacion} />
            )}
          </div>
        </div>
      )}

      {/* HISTORIALES */}
      <HistorialList rotaciones={historialRotacion} abonos={historialAbonos} />
    </div>
  );
}
