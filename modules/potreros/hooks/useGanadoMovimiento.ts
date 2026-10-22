'use client';

import { useState, useEffect } from 'react';
import { BovinoOption } from '../types/potrero.types';
import { createClient } from '@/lib/supabase/client';

export const useGanado = (potreroId?: string | number, estaOcupado: boolean = false) => {
  const [bovinosDisponibles, setBovinosDisponibles] = useState<BovinoOption[]>([]);
  const [loadingGanado, setLoadingGanado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchBovinos = async () => {
    try {
      setLoadingGanado(true);
      setError(null);

      console.log("🔍 DEBUG - potreroId:", potreroId, "estaOcupado:", estaOcupado);

      if (estaOcupado && potreroId) {
        // 1. POTRERO OCUPADO: Traemos los registros del historial sin fecha_salida
        const { data: historial, error: errHistorial } = await supabase
          .from('historial_ocupacion_potreros')
          .select('bovino_id')
          .eq('potrero_id', potreroId)
          .is('fecha_salida', null);

        console.log("📊 DEBUG - Historial encontrado para este potrero:", historial);

        if (errHistorial) throw errHistorial;

        const idsBovinosAdentro = (historial || []).map((item: any) => item.bovino_id).filter(Boolean);

        console.log("IDs de animales adentro:", idsBovinosAdentro);

        if (idsBovinosAdentro.length === 0) {
          // Si por alguna razón no hay registros individuales en el historial, mostramos bovinos activos como respaldo
          const { data: respaldo } = await supabase
            .from('bovinos')
            .select('id, arete, nombre, raza')
            .eq('condicion', 'Activo');

          const mapeados = (respaldo || []).map((b: any) => ({
            id: b.id,
            nombre: `Arete: ${b.arete} ${b.nombre ? `- ${b.nombre}` : ''} (${b.raza})`,
          }));
          setBovinosDisponibles(mapeados);
          return;
        }

        // Consultamos la información de los bovinos con esos IDs
        const { data: bovinosAdentro, error: errBovinos } = await supabase
          .from('bovinos')
          .select('id, arete, nombre, raza')
          .in('id', idsBovinosAdentro);

        if (errBovinos) throw errBovinos;

        if (bovinosAdentro) {
          const mapeados: BovinoOption[] = bovinosAdentro.map((item: any) => ({
            id: item.id,
            nombre: `Arete: ${item.arete} ${item.nombre ? `- ${item.nombre}` : ''} (${item.raza})`,
          }));

          setBovinosDisponibles(mapeados);
        }
      } else {
        // 2. POTRERO VACÍO: Traemos todos los bovinos activos para ingresar
        const { data, error: err } = await supabase
          .from('bovinos')
          .select('id, arete, nombre, raza, condicion')
          .eq('condicion', 'Activo');

        if (err) throw err;

        if (data) {
          const mapeados: BovinoOption[] = data.map((item: any) => ({
            id: item.id,
            nombre: `Arete: ${item.arete} ${item.nombre ? `- ${item.nombre}` : ''} (${item.raza})`,
          }));

          setBovinosDisponibles(mapeados);
        }
      }
    } catch (err: any) {
      console.error('Error al cargar bovinos:', err);
      setError(err.message || 'No se pudieron cargar los bovinos');
    } finally {
      setLoadingGanado(false);
    }
  };

  useEffect(() => {
    fetchBovinos();
  }, [potreroId, estaOcupado]);

  return {
    bovinosDisponibles,
    loadingGanado,
    error,
    refetchGanado: fetchBovinos,
  };
};