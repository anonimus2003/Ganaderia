// src/modules/potreros/hooks/usePotreros.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Potrero } from '../schemas';

export function usePotreros() {
  const supabase = createClient();
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchPotreros = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('potreros')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al cargar potreros:', error);
    } else {
      setPotreros(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => { void fetchPotreros(); });
  }, [fetchPotreros]);

  // Ingresar ganado: cambia estado a 'Ocupado' y reinicia el pasto a 0% por el consumo
  const ingresarGanado = async (potreroId: number, bovinosIds: string[], fechaEntrada: string) => {
    const cantidadBovinos = bovinosIds.length;

    const { data: bovinosInfo } = await supabase
      .from('bovinos')
      .select('nombre, arete')
      .in('id', bovinosIds);

    const listaNombres = bovinosInfo 
      ? bovinosInfo.map((b: { nombre?: string; arete: string }) => 
          b.nombre ? `${b.nombre} (${b.arete})` : `Arete: ${b.arete}`
        ).join(', ')
      : '';

    const { data: potreroData } = await supabase
      .from('potreros')
      .select('nombre, estado')
      .eq('id', potreroId)
      .single();

    const estadoAnterior = potreroData?.estado || 'Disponible';
    const nombrePotrero = potreroData?.nombre || '';

    const { error: updateError } = await supabase
      .from('potreros')
      .update({
        estado: 'ocupado',
        bovinos_actuales: cantidadBovinos,
        fecha_entrada_ganado: fechaEntrada,
        progreso_pasto: 0, // El pasto se consume al ingresar los animales
      })
      .eq('id', potreroId);

    if (updateError) {
      console.error('Error al actualizar potrero:', updateError);
      throw updateError;
    }

    const { error: histError } = await supabase.from('historial_potreros').insert([
      {
        potrero_id: potreroId,
        potrero_nombre: nombrePotrero,
        estado_anterior: estadoAnterior,
        estado_nuevo: 'Ocupado',
        bovinos_actuales: cantidadBovinos,
        fecha_entrada: fechaEntrada,
        bovinos_ids: bovinosIds,
        nombres_bovinos: listaNombres,
      },
    ]);

    if (histError) {
      console.error('Error al insertar en historial_potreros:', histError);
      throw histError;
    }

    await fetchPotreros();
  };

  // Sacar ganado: actualiza la fila existente en el historial manteniendo la cantidad de bovinos y el estado
  const sacarGanado = async (potreroId: number, fechaSalida: string) => {
    const { error: updateError } = await supabase
      .from('potreros')
      .update({
        estado: 'En Descanso',
        bovinos_actuales: 0,
        fecha_salida_ganado: fechaSalida,
        dias_descanso: 0,
      })
      .eq('id', potreroId);

    if (updateError) throw updateError;

    // ACTUALIZAR la fila pendiente de salida: 
    // Solo añadimos la fecha de salida. NO sobrescribimos 'bovinos_actuales' ni el 'estado_anterior' 
    // para que la cantidad (ej. 7) y los datos originales sigan apareciendo intactos en esa misma fila.
    const { error: histError } = await supabase
      .from('historial_potreros')
      .update({
        estado_nuevo: 'En Descanso',
        fecha_salida: fechaSalida,
      })
      .eq('potrero_id', potreroId)
      .is('fecha_salida', null); // Busca la fila abierta actual

    if (histError) throw histError;

    await fetchPotreros();
  };

  const registrarAbono = async (potreroId: number, insumo: string, cantidad: string, fecha: string) => {
    const { error } = await supabase.from('historial_abonos').insert([
      {
        potrero_id: potreroId,
        insumo,
        cantidad,
        fecha_aplicacion: fecha,
      },
    ]);

    if (error) throw error;

    await supabase
      .from('potreros')
      .update({
        ultimo_abono: insumo,
        fecha_abono: fecha,
      })
      .eq('id', potreroId);

    await fetchPotreros();
  };

  const guardarPotrero = async (datos: { nombre: string; area_m2?: number; tipo_pasto?: string; progreso_pasto?: number; aforo?: number; x?: number; y?: number }, id?: number) => {
    if (id) {
      const { error } = await supabase
        .from('potreros')
        .update(datos)
        .eq('id', id);

      if (error) {
        console.error("Detalle del error Supabase (Update):", JSON.stringify(error, null, 2));
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('potreros')
        .insert([{ 
          ...datos, 
          estado: 'Disponible', 
          bovinos_actuales: 0, 
          progreso_pasto: datos.progreso_pasto ?? 0, 
          x: datos.x ?? 50, 
          y: datos.y ?? 50 
        }]);

      if (error) {
        console.error("Detalle del error Supabase (Insert):", JSON.stringify(error, null, 2));
        throw error;
      }
    }

    await fetchPotreros();
  };

  const moverPotrero = async (potreroId: number, nuevoX: number, nuevoY: number) => {
    const { error } = await supabase
      .from('potreros')
      .update({ x: nuevoX, y: nuevoY })
      .eq('id', potreroId);

    if (error) {
      console.error('Error al mover el potrero:', error);
      throw error;
    }

    await fetchPotreros();
  };

  const eliminarPotrero = async (potreroId: number) => {
    const { error } = await supabase
      .from('potreros')
      .delete()
      .eq('id', potreroId);

    if (error) {
      console.error('Error al eliminar el potrero:', error);
      throw error;
    }

    await fetchPotreros();
  };

  return {
    potreros,
    loading,
    selectedId,
    setSelectedId,
    ingresarGanado,
    sacarGanado,
    registrarAbono,
    guardarPotrero,
    moverPotrero,
    eliminarPotrero,
    refetch: fetchPotreros,
  };
}
