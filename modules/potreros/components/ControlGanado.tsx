'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Potrero } from '../schemas';
import { createClient } from '@/lib/supabase/client';
import { Calendar, CheckSquare, Square, ArrowRightLeft, Loader2, Tag, LockKeyhole, Leaf } from 'lucide-react';

interface ControlGanadoProps {
  potrero: Potrero;
  onIngresarGanado: (potreroId: number, bovinosIds: string[], fecha: string) => Promise<void>;
  onSacarGanado: (potreroId: number, fecha: string) => Promise<void>;
}

interface Bovino {
  id: string;
  arete: string;
  nombre?: string | null;
  estado?: string | null;
}

export default function ControlGanado({ potrero, onIngresarGanado, onSacarGanado }: ControlGanadoProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [cargandoBovinos, setCargandoBovinos] = useState(false);
  const [bovinosLista, setBovinosLista] = useState<Bovino[]>([]);
  const [bovinosSeleccionados, setBovinosSeleccionados] = useState<string[]>([]);

  const fechaActual = new Date().toISOString().split('T')[0];
  const [fechaEntrada, setFechaEntrada] = useState(fechaActual);
  const [fechaSalida, setFechaSalida] = useState(fechaActual);

  const estado = useMemo(() => potrero.estado?.toLowerCase().trim() || '', [potrero.estado]);
  const isDisponible = estado === 'disponible';
  const isOcupado = estado === 'ocupado';
  const estaEnDescanso = estado === 'en descanso';

  /* eslint-disable react-hooks/set-state-in-effect -- availability changes reset the local cattle selection. */
 useEffect(() => {
    if (!isDisponible) {
      setBovinosLista([]);
      setBovinosSeleccionados([]);
      return;
    }

    let cancelado = false;
    async function fetchBovinos() {
      setCargandoBovinos(true);
      try {
        const { data, error } = await supabase
          .from('bovinos')
          .select('id, arete, nombre, condicion') // Añadimos condicion para traerla
          .order('arete', { ascending: true }); // Sin filtros de estado: trae todos

        if (!error && !cancelado) {
          // Mapeamos 'condicion' a la propiedad 'estado' de tu interfaz Bovino
          const bovinosMapeados = (data ?? []).map(b => ({
            id: b.id,
            arete: b.arete,
            nombre: b.nombre,
            estado: b.condicion, 
          }));
          setBovinosLista(bovinosMapeados);
        }
      } finally {
        if (!cancelado) setCargandoBovinos(false);
      }
    }
    fetchBovinos();
    return () => { cancelado = true; };
  }, [isDisponible, supabase]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleBovino = (id: string) => {
    setBovinosSeleccionados(actuales => 
      actuales.includes(id) ? actuales.filter(bId => bId !== id) : [...actuales, id]
    );
  };

  const todosSeleccionados = bovinosLista.length > 0 && bovinosSeleccionados.length === bovinosLista.length;
  const toggleSeleccionarTodo = () => {
    setBovinosSeleccionados(todosSeleccionados ? [] : bovinosLista.map(b => b.id));
  };

  const handleAccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estaEnDescanso || (!isDisponible && !isOcupado)) return;

    setLoading(true);
    try {
      if (isOcupado) {
        if (!fechaSalida) { alert('Selecciona la fecha de salida.'); return; }

        await onSacarGanado(potrero.id, fechaSalida);

        const { error: updateError } = await supabase
          .from('potreros')
          .update({ estado: 'En Descanso', bovinos_actuales: 0, fecha_salida_ganado: fechaSalida })
          .eq('id', potrero.id);

        if (updateError) throw updateError;
        setBovinosSeleccionados([]);
        alert('Salida registrada correctamente. El potrero ahora está en descanso.');

      } else if (isDisponible) {
        if (!fechaEntrada) { alert('Selecciona la fecha de ingreso.'); return; }
        if (bovinosSeleccionados.length === 0) { alert('Selecciona al menos un bovino.'); return; }

        if (potrero.progreso_pasto !== undefined && potrero.progreso_pasto < 70) {
          if (!window.confirm(`Este potrero tiene un crecimiento de pasto del ${potrero.progreso_pasto}%. ¿Quieres ingresar el ganado de todas formas?`)) {
            setLoading(false);
            return;
          }
        }

        await onIngresarGanado(potrero.id, bovinosSeleccionados, fechaEntrada);

        const { error: updateError } = await supabase
          .from('potreros')
          .update({
            estado: 'Ocupado',
            progreso_pasto: 0,
            bovinos_actuales: bovinosSeleccionados.length,
            fecha_entrada_ganado: fechaEntrada,
            fecha_salida_ganado: null,
          })
          .eq('id', potrero.id);

        if (updateError) throw updateError;
        setBovinosSeleccionados([]);
        alert('Ganado ingresado correctamente. El potrero ahora está ocupado.');
      }
    } catch (error) {
      console.error('Error procesando operación:', error);
      alert('No fue posible completar la operación.');
    } finally {
      setLoading(false);
    }
  };

  const config = isOcupado
    ? { background: 'bg-rose-50/40', border: 'border-rose-200', icon: 'bg-rose-600', title: 'text-rose-900', titleText: 'Gestión de salida', description: 'Registra la salida del ganado.' }
    : isDisponible
    ? { background: 'bg-emerald-50/40', border: 'border-emerald-200', icon: 'bg-emerald-600', title: 'text-emerald-900', titleText: 'Ingreso de bovinos', description: 'Selecciona los animales.' }
    : { background: 'bg-amber-50/50', border: 'border-amber-200', icon: 'bg-amber-500', title: 'text-amber-900', titleText: 'Potrero en descanso', description: 'En recuperación.' };

  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-all ${config.background} ${config.border}`}>
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl text-white ${config.icon}`}>
            {estaEnDescanso ? <LockKeyhole size={18} /> : <ArrowRightLeft size={18} />}
          </div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider ${config.title}`}>{config.titleText}</h4>
            <p className="text-[11px] text-slate-500">{config.description}</p>
          </div>
        </div>
      </div>

      {/* POTRERO EN DESCANSO */}
      {estaEnDescanso && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-amber-200">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600"><Leaf size={18} /></div>
            <div>
              <p className="text-xs font-bold text-amber-900">Recuperación del potrero</p>
              <p className="text-[11px] text-slate-500 mt-1">El ganado fue retirado y está en recuperación.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <span className="block text-[10px] text-slate-400 font-semibold">Estado</span>
              <span className="text-xs font-bold text-amber-600">En descanso</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <span className="block text-[10px] text-slate-400 font-semibold">Pasto</span>
              <span className="text-xs font-bold text-slate-800">{potrero.progreso_pasto ?? 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* DISPONIBLE / OCUPADO */}
      {!estaEnDescanso && (
        <form onSubmit={handleAccion} className="space-y-4">
          {isOcupado && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-rose-600" /> Fecha de salida</span>
              </label>
              <input type="date" value={fechaSalida} onChange={e => setFechaSalida(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600" required />
            </div>
          )}

          {isDisponible && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-emerald-600" /> Fecha de ingreso</span>
                </label>
                <input type="date" value={fechaEntrada} onChange={e => setFechaEntrada(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" required />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-700">Animales seleccionados: <span className="text-emerald-600">{bovinosSeleccionados.length}</span></span>
                  {bovinosLista.length > 0 && (
                    <button type="button" onClick={toggleSeleccionarTodo} className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800">
                      {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white space-y-1.5">
                  {cargandoBovinos ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
                      <Loader2 size={16} className="animate-spin" /> Cargando bovinos...
                    </div>
                  ) : bovinosLista.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No hay bovinos activos disponibles.</p>
                  ) : (
                    bovinosLista.map(bovino => {
                      const seleccionado = bovinosSeleccionados.includes(bovino.id);
                      return (
                        <button type="button" key={bovino.id} onClick={() => toggleBovino(bovino.id)} className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${seleccionado ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'border-slate-100 hover:bg-slate-50 text-slate-700'}`}>
                          <div className="flex items-center gap-2.5">
                            {seleccionado ? <CheckSquare size={16} className="text-emerald-600" /> : <Square size={16} className="text-slate-300" />}
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1.5"><Tag size={12} className="text-slate-400" /> Arete: {bovino.arete}</div>
                              {bovino.nombre && <div className="text-[11px] text-slate-500">{bovino.nombre}</div>}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{bovino.estado || 'Activo'}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN */}
          <button type="submit" disabled={loading || (isDisponible && bovinosSeleccionados.length === 0)} className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${isOcupado ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'} ${loading || (isDisponible && bovinosSeleccionados.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {loading ? <><Loader2 size={15} className="animate-spin" /> Procesando operación...</> : isOcupado ? 'Registrar salida y pasar a descanso' : `Ingresar ganado${bovinosSeleccionados.length > 0 ? ` (${bovinosSeleccionados.length})` : ''}`}
          </button>
        </form>
      )}
    </div>
  );
}
