'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePotreros } from './hooks/usePotreros';
import MapaPotreros from './components/MapaPotreros';
import HeaderPotreros from './components/HeaderPotreros';
import { PotreroDrawer } from './components/PotreroDrawer';
import { BitacoraPotrero, EventoBitacora } from './components/BitacoraPotrero';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function PotrerosModule() {
  const {
    potreros,
    potreroActivo,
    seleccionarPotrero,
    actualizarGanadoLocal
  } = usePotreros();

  const [bitacoraEventos, setBitacoraEventos] = useState<EventoBitacora[]>([]);
  const [eventoEnEdicion, setEventoEnEdicion] = useState<EventoBitacora | null>(null);
  const [cargandoBitacora, setCargandoBitacora] = useState<boolean>(true);

  const [potreroFiltradoBitacoraId, setPotreroFiltradoBitacoraId] = useState<string | number | null>(null);
  const [isPlanificadorOpen, setIsPlanificadorOpen] = useState<boolean>(false);

  // Carga unificada de historial generando eventos tanto de Ingreso como de Salida
  const cargarDatosBitacora = useCallback(async () => {
    try {
      setCargandoBitacora(true);

      const [resGanado, resAbonos] = await Promise.all([
        supabase
          .from('historial_ocupacion_potreros')
          .select('id, potrero_id, bovino_id, fecha_entrada, fecha_salida, notas, bovinos(id, arete, nombre), potreros(nombre)')
          .order('fecha_entrada', { ascending: false }),
        supabase
          .from('historial_abonos')
          .select('*, potreros(nombre)')
          .order('creado_at', { ascending: false })
      ]);

      if (resGanado.error) console.error('Error en historial ganado:', resGanado.error.message || resGanado.error);
      if (resAbonos.error) console.error('Error en historial abonos:', resAbonos.error.message || resAbonos.error);

      let eventosUnificados: EventoBitacora[] = [];

      if (resGanado.data) {
        const eventosGanado: EventoBitacora[] = [];

        resGanado.data.forEach((item: any) => {
          const infoBovino = Array.isArray(item.bovinos) ? item.bovinos[0] : item.bovinos;
          const infoPotrero = Array.isArray(item.potreros) ? item.potreros[0] : item.potreros;

          const identificacionBovino = infoBovino 
            ? `${infoBovino.arete || 'Sin arete'} - ${infoBovino.nombre || 'Sin nombre'}` 
            : item.bovino_id ? `Bovino ID: ${item.bovino_id}` : 'Bovino registrado';

          const nombrePotrero = infoPotrero?.nombre || `Potrero #${item.potrero_id}`;

          // 1. Evento de INGRESO
          if (item.fecha_entrada) {
            eventosGanado.push({
              id: `p_ingreso_${item.id}`,
              potrero_id: item.potrero_id,
              potrero_nombre: nombrePotrero,
              tipo: 'ingreso',
              titulo: 'Ingreso de Bovino',
              detalle: item.notas ? `${identificacionBovino} (${item.notas})` : identificacionBovino,
              fecha: new Date(item.fecha_entrada).toISOString().split('T')[0],
              animales: [identificacionBovino]
            });
          }

          // 2. Evento de SALIDA
          if (item.fecha_salida) {
            eventosGanado.push({
              id: `p_salida_${item.id}`,
              potrero_id: item.potrero_id,
              potrero_nombre: nombrePotrero,
              tipo: 'salida',
              titulo: 'Salida / Retiro de Bovino',
              detalle: `Retiro de ${identificacionBovino}`,
              fecha: new Date(item.fecha_salida).toISOString().split('T')[0],
              animales: [identificacionBovino]
            });
          }
        });

        eventosUnificados = [...eventosUnificados, ...eventosGanado];
      }

      if (resAbonos.data) {
        const eventosAbonos: EventoBitacora[] = resAbonos.data.map((item: any) => {
          const infoPotrero = Array.isArray(item.potreros) ? item.potreros[0] : item.potreros;
          return {
            id: `a_${item.id}`,
            potrero_id: item.potrero_id,
            potrero_nombre: infoPotrero?.nombre || `Potrero #${item.potrero_id}`,
            tipo: 'abono',
            titulo: `Aplicación de Abono: ${item.insumo || item.tipo_abono || 'Abono'}`,
            detalle: `Cantidad: ${item.cantidad || item.unidades || ''} ${item.responsable ? `- ${item.responsable}` : ''}`,
            fecha: item.fecha_aplicacion ? new Date(item.fecha_aplicacion).toISOString().split('T')[0] : 'Fecha no registrada',
          };
        });
        eventosUnificados = [...eventosUnificados, ...eventosAbonos];
      }

      setBitacoraEventos(eventosUnificados);
    } catch (err: any) {
      console.error('Error cargando la bitácora:', err?.message || err);
    } finally {
      setCargandoBitacora(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosBitacora();
  }, [cargarDatosBitacora]);

  const handleOperarGanado = async (
    accion: 'ingreso' | 'salida', 
    cantidad: number, 
    tipo: string, 
    fecha: string, 
    animalesSeleccionados: any[],
    potreroIdDestino?: string | number
  ) => {
    const potreroIdFinal = potreroIdDestino || potreroActivo?.id;
    if (!potreroIdFinal) return;

    const potreroIdNum = Number(potreroIdFinal);

    if (eventoEnEdicion && eventoEnEdicion.id.includes('_')) {
      const parts = eventoEnEdicion.id.split('_');
      const rawId = parts[parts.length - 1];
      const realId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      
      const updateData = accion === 'ingreso' 
        ? { fecha_entrada: new Date(fecha).toISOString() }
        : { fecha_salida: new Date(fecha).toISOString() };

      const { error } = await supabase
        .from('historial_ocupacion_potreros')
        .update(updateData)
        .eq('id', realId);

      if (error) {
        alert('Error al actualizar en Supabase: ' + error.message);
        return;
      }
    } else {
      if (accion === 'ingreso') {
        if (!animalesSeleccionados || animalesSeleccionados.length === 0) {
          alert('Debes seleccionar al menos un bovino');
          return;
        }

        const registrosAInsertar = animalesSeleccionados.map(anim => {
          const bovinoId = typeof anim === 'object' ? anim.id : anim;
          return {
            potrero_id: potreroIdNum,
            bovino_id: bovinoId,
            fecha_entrada: new Date(fecha).toISOString(),
            fecha_salida: null
          };
        });

        const { error } = await supabase
          .from('historial_ocupacion_potreros')
          .insert(registrosAInsertar);

        if (error) {
          alert('Error al guardar el movimiento: ' + error.message);
          return;
        }

        await supabase
          .from('potreros')
          .update({ estado: 'Ocupado' })
          .eq('id', potreroIdNum);
      }

      if (actualizarGanadoLocal) {
        actualizarGanadoLocal(potreroIdNum, accion === 'ingreso' ? 'ingreso' : 'salida', animalesSeleccionados);
      }
    }

    // Resetear estados y cerrar drawer tras operar exitosamente
    await cargarDatosBitacora();
    setEventoEnEdicion(null);
    seleccionarPotrero(null);
    setIsPlanificadorOpen(false);
  };

  const handleOperarAbono = async (
    unidades: number, 
    tipoAbono: string, 
    fecha: string, 
    detalleExtra: string, 
    potreroIdDestino?: string | number
  ) => {
    const potreroIdFinal = potreroIdDestino || potreroActivo?.id;
    if (!potreroIdFinal) return;

    const potreroIdNum = Number(potreroIdFinal);

    if (eventoEnEdicion && eventoEnEdicion.id.startsWith('a_')) {
      // ✅ Se mantiene realId como string (UUID) sin forzar Number()
      const realId = eventoEnEdicion.id.replace('a_', '');
      const { error } = await supabase
        .from('historial_abonos')
        .update({
          insumo: tipoAbono,
          cantidad: `${unidades} Unidades`,
          fecha_aplicacion: fecha,
          responsable: detalleExtra || 'Administrador'
        })
        .eq('id', realId);

      if (error) {
        alert('Error al actualizar el abono: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('historial_abonos')
        .insert({
          potrero_id: potreroIdNum,
          insumo: tipoAbono,
          cantidad: `${unidades} Unidades`,
          fecha_aplicacion: fecha,
          responsable: detalleExtra || 'Administrador'
        });

      if (error) {
        alert('Error al guardar el abono: ' + error.message);
        return;
      }
    }

    // Resetear estados y cerrar drawer tras operar exitosamente
    await cargarDatosBitacora();
    setEventoEnEdicion(null);
    seleccionarPotrero(null);
    setIsPlanificadorOpen(false);
  };

  const handleEliminarEventoBitacora = async (eventoId: string) => {
    if (confirm('¿Estás seguro de eliminar este registro del historial?')) {
      if (eventoId.startsWith('p_salida_')) {
        const rawId = eventoId.replace('p_salida_', '');
        const realId = isNaN(Number(rawId)) ? rawId : Number(rawId);
        const { error } = await supabase
          .from('historial_ocupacion_potreros')
          .update({ fecha_salida: null })
          .eq('id', realId);

        if (error) {
          alert('Error al revertir la salida: ' + error.message);
          return;
        }
      } else if (eventoId.startsWith('p_ingreso_') || eventoId.startsWith('p_')) {
        const rawId = eventoId.replace('p_ingreso_', '').replace('p_', '');
        const realId = isNaN(Number(rawId)) ? rawId : Number(rawId);
        const { error } = await supabase
          .from('historial_ocupacion_potreros')
          .delete()
          .eq('id', realId);

        if (error) {
          alert('Error al eliminar ingreso: ' + error.message);
          return;
        }
      } else if (eventoId.startsWith('a_')) {
        // ✅ Se mantiene realId como string (UUID) sin forzar Number()
        const realId = eventoId.replace('a_', '');
        const { error } = await supabase
          .from('historial_abonos')
          .delete()
          .eq('id', realId);

        if (error) {
          alert('Error al eliminar abono: ' + error.message);
          return;
        }
      }

      await cargarDatosBitacora();
    }
  };

  const handleIniciarEdicionEvento = (evento: EventoBitacora) => {
    const potreroAsociado = potreros.find(p => String(p.id) === String(evento.potrero_id));
    seleccionarPotrero(potreroAsociado || null);
    setEventoEnEdicion(evento);
    setIsPlanificadorOpen(true);
  };

  const handleEliminarPotrero = () => {
    if (!potreroActivo) return;
    if (confirm(`¿Estás seguro de eliminar el potrero #${potreroActivo.nombre}?`)) {
      seleccionarPotrero(null);
    }
  };

  const handleGuardarPuntosPotrero = async (potreroId: string | number, nuevosPuntos: Array<{ x: number; y: number }>) => {
    const { error } = await supabase
      .from('potreros')
      .update({ puntos: nuevosPuntos })
      .eq('id', Number(potreroId));

    if (error) {
      alert('Error al guardar la posición: ' + error.message);
    }
  };

  const handleAbrirPlanificador = () => {
    seleccionarPotrero(null);
    setEventoEnEdicion(null);
    setIsPlanificadorOpen(true);
  };

  const idFiltroActivo = potreroFiltradoBitacoraId || potreroActivo?.id;
  
  const potreroSeleccionadoInfo = useMemo(() => {
    if (!idFiltroActivo) return null;
    return potreros.find(p => String(p.id) === String(idFiltroActivo));
  }, [potreros, idFiltroActivo]);

  const eventosFiltrados = useMemo(() => {
    return idFiltroActivo 
      ? bitacoraEventos.filter(e => String(e.potrero_id) === String(idFiltroActivo))
      : bitacoraEventos;
  }, [bitacoraEventos, idFiltroActivo]);

  // Key única para forzar el re-render y desmontaje del Drawer cuando cambia la selección
  const drawerKey = eventoEnEdicion 
    ? `edit-${eventoEnEdicion.id}` 
    : potreroActivo 
    ? `potrero-${potreroActivo.id}` 
    : 'planificador-nuevo';

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 relative overflow-x-hidden">
      <HeaderPotreros 
        onAbrirPlanificador={handleAbrirPlanificador}
        totalPotreros={potreros.length}
        totalLibres={potreros.filter(p => p.estado?.toLowerCase() === 'libre' || p.estado?.toLowerCase() === 'disponible').length}
        totalOcupados={potreros.filter(p => p.estado?.toLowerCase() === 'ocupado').length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <MapaPotreros
            potreros={potreros}
            potreroSeleccionadoId={idFiltroActivo}
            onSelectPotrero={(potrero) => {
              setPotreroFiltradoBitacoraId(potrero.id);
            }}
            onDoubleClickPotrero={(potrero) => {
              setIsPlanificadorOpen(false);
              seleccionarPotrero(potrero);
              setPotreroFiltradoBitacoraId(potrero.id);
              setEventoEnEdicion(null);
            }}
            onGuardarPuntos={handleGuardarPuntosPotrero}
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          {cargandoBitacora ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 py-6">
              Cargando historial de potreros...
            </div>
          ) : (
            <BitacoraPotrero 
              eventos={eventosFiltrados}
              potreroActivoNombre={
                potreroSeleccionadoInfo 
                  ? String(potreroSeleccionadoInfo.nombre || idFiltroActivo)
                  : undefined
              }
              areaPotrero={potreroSeleccionadoInfo?.area_m2}
              pastoPotrero={potreroSeleccionadoInfo?.tipo_pasto}
              aforoEst={potreroSeleccionadoInfo?.aforo}
              progresoPasto={potreroSeleccionadoInfo?.progreso_pasto}
              onEditarSeleccionado={handleIniciarEdicionEvento}
              onEliminarEvento={handleEliminarEventoBitacora}
            />
          )}
        </div>
      </div>

      {(potreroActivo || isPlanificadorOpen) && (
        <PotreroDrawer
          key={drawerKey}
          potrero={potreroActivo}
          eventoEnEdicion={eventoEnEdicion}
          onClose={() => {
            seleccionarPotrero(null);
            setEventoEnEdicion(null);
            setIsPlanificadorOpen(false);
          }}
          onOperarGanado={handleOperarGanado}
          onOperarAbono={handleOperarAbono}
          onEliminar={handleEliminarPotrero}
        />
      )}
    </div>
  );
}