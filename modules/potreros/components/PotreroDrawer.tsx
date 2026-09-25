'use client';

import React, { useState, useEffect } from 'react';
import { Potrero } from '../schemas';
import { Button } from '@/components/ui/button';
import { EventoBitacora } from './BitacoraPotrero';
import { createClient } from '@/lib/supabase/client';

interface PotreroDrawerProps {
  potrero: Potrero | null;
  eventoEnEdicion?: EventoBitacora | null;
  onClose: () => void;
  onOperarGanado: (accion: 'ingreso' | 'salida', cantidad: number, tipo: string, fecha: string, animalesSeleccionados: string[], potreroIdDestino: string | number) => Promise<void> | void;
  onOperarAbono: (unidades: number, tipoAbono: string, fecha: string, detalleExtra: string, potreroIdDestino: string | number, responsable?: string) => Promise<void> | void;
  onEliminar?: () => void;
  onIniciarTrazo?: () => void;
}

export const PotreroDrawer: React.FC<PotreroDrawerProps> = ({
  potrero: potreroProp,
  eventoEnEdicion,
  onClose,
  onOperarGanado,
  onOperarAbono,
}) => {
  const supabase = createClient();

  const [todosLosPotreros, setTodosLosPotreros] = useState<Potrero[]>([]);
  const [potreroSeleccionadoId, setPotreroSeleccionadoId] = useState<string>('');
  const [cargandoPotreros, setCargandoPotreros] = useState<boolean>(false);

  const [tipoAnimal] = useState<string>('Vaca de Ordeño');
  const [fechaIngresoSalida, setFechaIngresoSalida] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [vacasDisponibles, setVacasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [cargandoBovinos, setCargandoBovinos] = useState<boolean>(false);
  const [vacasSeleccionadas, setVacasSeleccionadas] = useState<string[]>([]);

  // Estados para Abono
  const [unidadesAbono, setUnidadesAbono] = useState<string>('1');
  const [unidadMedida, setUnidadMedida] = useState<string>('kg');
  const [tipoAbono, setTipoAbono] = useState<string>('Urea');
  const [fechaAbono, setFechaAbono] = useState<string>(new Date().toISOString().split('T')[0]);
  const [responsableAbono, setResponsableAbono] = useState<string>('');
  const [detalleExtraAbono, setDetalleExtraAbono] = useState<string>('');
  const [guardandoAbono, setGuardandoAbono] = useState<boolean>(false);

  // 1. Cargar potreros
  useEffect(() => {
    const fetchAllPotreros = async () => {
      setCargandoPotreros(true);
      try {
        let { data, error } = await supabase
          .from('v_potreros_estado')
          .select('*')
          .order('nombre', { ascending: true });

        if (error) {
          const resFallback = await supabase
            .from('potreros')
            .select('*')
            .order('nombre', { ascending: true });

          if (resFallback.error) throw resFallback.error;
          data = resFallback.data;
        }

        if (data) {
          const potrerosMapeados = data.map((p: any) => ({
            ...p,
            estado: p.estado_calculado || p.estado || 'Disponible'
          }));
          setTodosLosPotreros(potrerosMapeados);
        }
      } catch (error: any) {
        console.error('Error al cargar todos los potreros:', error?.message || JSON.stringify(error));
      } finally {
        setCargandoPotreros(false);
      }
    };

    fetchAllPotreros();
  }, [supabase]);

  useEffect(() => {
    if (potreroProp) {
      setPotreroSeleccionadoId(potreroProp.id.toString());
    } else {
      setPotreroSeleccionadoId('');
    }
  }, [potreroProp]);

  const potreroActual = todosLosPotreros.find(p => p.id.toString() === potreroSeleccionadoId) || potreroProp;

  const estadoNormalizado = potreroActual?.estado?.toLowerCase() || '';
  const estaOcupado = estadoNormalizado === 'ocupado';

  // 2. Cargar bovinos según el estado del potrero (Solo Activos)
  useEffect(() => {
    const fetchBovinosYEstado = async () => {
      if (!potreroActual) {
        setVacasDisponibles([]);
        setVacasSeleccionadas([]);
        return;
      }
      
      setCargandoBovinos(true);

      try {
        if (estaOcupado) {
          const { data: historialData, error: histError } = await supabase
            .from('historial_ocupacion_potreros')
            .select('bovino_id')
            .eq('potrero_id', potreroActual.id)
            .is('fecha_salida', null);

          if (histError) throw histError;

          if (historialData && historialData.length > 0) {
            const idsBovinos = historialData.map((item: any) => item.bovino_id).filter(Boolean);

            if (idsBovinos.length > 0) {
              const { data: bovinosEnPotrero, error: bovError } = await supabase
                .from('bovinos')
                .select('id, nombre, arete')
                .in('id', idsBovinos)
                .eq('condicion', 'Activo'); // 👈 Filtra solo bovinos activos en este potrero

              if (!bovError && bovinosEnPotrero) {
                const lista = bovinosEnPotrero.map((b: any) => ({
                  id: b.id.toString(),
                  nombre: `${b.nombre || 'Sin nombre'} (Arete: ${b.arete || 'S/N'})`
                }));
                setVacasDisponibles(lista);
                setVacasSeleccionadas(lista.map(v => v.id));
              }
            }
          } else {
            setVacasDisponibles([]);
            setVacasSeleccionadas([]);
          }
        } else {
          const { data, error } = await supabase
            .from('bovinos')
            .select('id, nombre, arete')
            .eq('condicion', 'Activo') // 👈 Filtra todos los bovinos activos disponibles
            .order('nombre', { ascending: true });

          if (error) throw error;

          if (data) {
            const listaFormateada = data.map((bovino: any) => ({
              id: bovino.id.toString(),
              nombre: `${bovino.nombre || 'Sin nombre'} (Arete: ${bovino.arete || 'S/N'})`
            }));
            setVacasDisponibles(listaFormateada);
            setVacasSeleccionadas([]);
          }
        }
      } catch (error: any) {
        console.error('Error al cargar los bovinos:', error?.message || error);
      } finally {
        setCargandoBovinos(false);
      }
    };

    fetchBovinosYEstado();
  }, [potreroActual, estaOcupado, supabase]);

  useEffect(() => {
    if (eventoEnEdicion) {
      if (eventoEnEdicion.fecha) {
        setFechaIngresoSalida(eventoEnEdicion.fecha);
        setFechaAbono(eventoEnEdicion.fecha);
      }
      if (eventoEnEdicion.animales && eventoEnEdicion.animales.length > 0) {
        setVacasSeleccionadas(eventoEnEdicion.animales);
      }
    }
  }, [eventoEnEdicion]);

  const handleToggleVaca = (idVaca: string) => {
    if (vacasSeleccionadas.includes(idVaca)) {
      setVacasSeleccionadas(vacasSeleccionadas.filter(id => id !== idVaca));
    } else {
      setVacasSeleccionadas([...vacasSeleccionadas, idVaca]);
    }
  };

  const handleSalidaLote = async (potreroId: string | number) => {
    if (!potreroId) {
      alert('Por favor selecciona un potrero primero.');
      return;
    }

    try {
      const fechaIso = fechaIngresoSalida ? new Date(fechaIngresoSalida).toISOString() : new Date().toISOString();

      const { error: errHistorial } = await supabase
        .from('historial_ocupacion_potreros')
        .update({ fecha_salida: fechaIso })
        .eq('potrero_id', Number(potreroId))
        .is('fecha_salida', null);

      if (errHistorial) throw errHistorial;

      const { error: errPotrero } = await supabase
        .from('potreros')
        .update({ estado: 'Disponible' })
        .eq('id', Number(potreroId));

      if (errPotrero) throw errPotrero;

      await onOperarGanado('salida', vacasSeleccionadas.length, tipoAnimal, fechaIngresoSalida, vacasSeleccionadas, potreroId);

      alert("¡Salida registrada con éxito!");
      onClose();
    } catch (error: any) {
      console.error("No se pudo registrar la salida:", error);
      alert("Ocurrió un error al registrar la salida: " + (error.message || JSON.stringify(error)));
    }
  };

  const handleGanadoSubmit = async (accion: 'ingreso' | 'salida') => {
    if (!potreroSeleccionadoId) {
      alert('Por favor selecciona un potrero primero.');
      return;
    }
    if (vacasSeleccionadas.length === 0) {
      alert('Selecciona al menos un animal de la lista.');
      return;
    }
    await onOperarGanado(accion, vacasSeleccionadas.length, tipoAnimal, fechaIngresoSalida, vacasSeleccionadas, potreroSeleccionadoId);
    onClose();
  };

  // Función de ingreso de abono guardando en Supabase
  const handleAbonoSubmit = async () => {
    if (!potreroSeleccionadoId) {
      alert('Por favor selecciona un potrero primero.');
      return;
    }
    const cantidadNumerica = parseFloat(unidadesAbono);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      alert('Ingresa una cantidad válida mayor a 0');
      return;
    }
    if (!tipoAbono.trim()) {
      alert('Especifica el tipo de abono');
      return;
    }

    setGuardandoAbono(true);

    try {
      // Inserción en la tabla public.historial_abonos
      const { error } = await supabase
        .from('historial_abonos')
        .insert({
          potrero_id: Number(potreroSeleccionadoId),
          insumo: tipoAbono,
          cantidad: cantidadNumerica,
          unidad_medida: unidadMedida,
          fecha_aplicacion: fechaAbono,
          responsable: responsableAbono || null,
          "Detalles": detalleExtraAbono || null,
        });

      if (error) throw error;

      // Callback padre
      if (onOperarAbono) {
        await onOperarAbono(cantidadNumerica, tipoAbono, fechaAbono, detalleExtraAbono, potreroSeleccionadoId, responsableAbono);
      }

      alert('¡Abono registrado con éxito en la base de datos!');
      setDetalleExtraAbono('');
      setResponsableAbono('');
      setUnidadesAbono('1');
      onClose();
    } catch (error: any) {
      console.error('Error al registrar abono:', error);
      alert('Error al guardar el registro de abono: ' + (error.message || JSON.stringify(error)));
    } finally {
      setGuardandoAbono(false);
    }
  };

  return (
    <aside className="drawer absolute top-0 right-0 h-full w-full sm:w-[460px] bg-white/95 backdrop-blur-2xl z-40 p-6 flex flex-col justify-between shadow-2xl border-l border-slate-200 overflow-y-auto">
      <div>
        <div className="flex justify-between items-start pb-4 mb-4 border-b border-slate-100">
          <div className="w-full pr-2">
            <div className="flex items-center gap-2 mb-2">
              {potreroActual && (
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase border tracking-wide ${
                  estaOcupado ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {estaOcupado ? 'Ocupado' : 'Disponible'}
                </span>
              )}
            </div>

            <div className="mb-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seleccionar Potrero</label>
              <select
                value={potreroSeleccionadoId}
                onChange={(e) => setPotreroSeleccionadoId(e.target.value)}
                disabled={cargandoPotreros}
                className="w-full px-3 py-2 text-sm font-black bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-lime-600 shadow-sm cursor-pointer"
              >
                <option value="" disabled>-- Seleccione un potrero --</option>
                {todosLosPotreros.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    Potrero N° {p.numero || p.nombre || p.id} {p.nombre ? `- ${p.nombre}` : ''} ({p.estado})
                  </option>
                ))}
              </select>
            </div>

            {potreroActual && (
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Área: {potreroActual.area_m2} m² <span className="text-slate-300">|</span> Pasto: {potreroActual.tipo_pasto}
              </p>
            )}
          </div>
          
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {eventoEnEdicion && (
          <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-800 font-bold"> Editando registro: {eventoEnEdicion.titulo}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Sección Movimiento Ganado */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>
                   {estaOcupado ? 'Animales en este Potrero' : 'Selección de Ganado para Ingreso'}
                </span>
              </label>
              <span className="text-[11px] font-normal text-slate-500">Disponibles: <strong className="text-slate-700">{vacasDisponibles.length}</strong></span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto bg-white p-2.5 rounded-xl border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 mb-1">
                {estaOcupado ? 'Animales para retirar:' : 'Selecciona las vacas a ingresar:'}
              </p>
              
              {!potreroActual ? (
                <p className="text-xs text-slate-400 text-center py-4">Seleccione un potrero primero.</p>
              ) : cargandoBovinos ? (
                <p className="text-xs text-slate-400 text-center py-4">Cargando animales...</p>
              ) : vacasDisponibles.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  {estaOcupado ? 'No hay registro de animales dentro del potrero.' : 'No hay bovinos activos disponibles.'}
                </p>
              ) : (
                vacasDisponibles.map((vaca) => (
                  <label key={vaca.id} className="flex items-center gap-2.5 text-xs text-slate-700 py-1 px-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={vacasSeleccionadas.includes(vaca.id)}
                      onChange={() => handleToggleVaca(vaca.id)}
                      className="rounded border-slate-300 text-lime-600 focus:ring-lime-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-medium">{vaca.nombre}</span>
                  </label>
                ))
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha de Movimiento</label>
              <input 
                type="date"
                value={fechaIngresoSalida}
                onChange={(e) => setFechaIngresoSalida(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-lime-600 shadow-sm"
              />
            </div>

            <div>
              {estaOcupado ? (
                <button 
                  type="button"
                  onClick={() => handleSalidaLote(potreroSeleccionadoId)}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Confirmar Salida de Ganado
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleGanadoSubmit('ingreso')}
                  className="w-full py-2.5 bg-lime-50 hover:bg-lime-100 text-lime-700 border border-lime-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                   Confirmar Ingreso de Ganado
                </button>
              )}
            </div>
          </div>

          {/* Sección Registro de Abono */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Registro Completo de Abono</label>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cantidad</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.1"
                  value={unidadesAbono}
                  onChange={(e) => setUnidadesAbono(e.target.value)}
                  placeholder="Ej: 50" 
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-lime-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unidad</label>
                <select
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  className="w-full px-2 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-lime-600 shadow-sm cursor-pointer"
                >
                  <option value="kg">kg</option>
                  <option value="bultos">bultos</option>
                  <option value="litros">litros</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Abono / Insumo</label>
              <select 
                value={tipoAbono}
                onChange={(e) => setTipoAbono(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-lime-600 shadow-sm cursor-pointer"
              >
                <option value="Urea">Urea</option>
                <option value="NPK">Fertilizante NPK</option>
                <option value="Abono Orgánico">Abono Orgánico / Estiércol</option>
                <option value="Cal Agrícola">Cal Agrícola</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Responsable / Operador</label>
              <input 
                type="text" 
                value={responsableAbono}
                onChange={(e) => setResponsableAbono(e.target.value)}
                placeholder="Ej: Juan Pérez" 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-lime-600 transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha de Aplicación</label>
              <input 
                type="date"
                value={fechaAbono}
                onChange={(e) => setFechaAbono(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-lime-600 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detalles Relevantes (Opcional)</label>
              <input 
                type="text" 
                value={detalleExtraAbono}
                onChange={(e) => setDetalleExtraAbono(e.target.value)}
                placeholder="Ej: Aplicado manualmente tras lluvia" 
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-lime-600 transition shadow-sm"
              />
            </div>

            <Button 
              type="button"
              disabled={guardandoAbono}
              onClick={handleAbonoSubmit}
              className="w-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-9 cursor-pointer disabled:opacity-50"
            >
              {guardandoAbono ? 'Guardando...' : 'Guardar Registro de Abono'}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};