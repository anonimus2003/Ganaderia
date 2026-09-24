'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Potrero {
  id: string | number;
  nombre?: string;
  numero?: number;
  area_m2?: number;
  tipo_pasto?: string;
  aforo?: number;
  progreso_pasto?: number;
  estado: string;
  bovinos_actuales?: number;
  puntos?: any;
}

export function usePotreros() {
  // Instanciación memorizada para evitar re-creación en cada render
  const supabase = useMemo(() => createClient(), []);
  
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [potreroActivo, setPotreroActivo] = useState<Potrero | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  const cargarPotreros = useCallback(async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('potreros')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error al cargar potreros:', error.message);
      } else if (data) {
        setPotreros(data);
      }
    } catch (err) {
      console.error('Error inesperado al cargar potreros:', err);
    } finally {
      setCargando(false);
    }
  }, [supabase]);

  useEffect(() => {
    cargarPotreros();
  }, [cargarPotreros]);

  const seleccionarPotrero = (potrero: Potrero | null) => {
    setPotreroActivo(potrero);
  };

  const actualizarGanadoLocal = (
    potreroId: number | string, 
    accion: 'ingreso' | 'salida', 
    animales: string[],
    bovinosRestantes?: number
  ) => {
    const determinarEstado = (): string => {
      if (accion === 'ingreso') return 'Ocupado';
      if (bovinosRestantes !== undefined) {
        return bovinosRestantes > 0 ? 'Ocupado' : 'Disponible';
      }
      return 'Disponible';
    };

    setPotreros((prev) =>
      prev.map((p) => {
        if (String(p.id) === String(potreroId)) {
          const nuevoEstado = determinarEstado();
          const nuevaCantidad = bovinosRestantes !== undefined 
            ? bovinosRestantes 
            : (accion === 'ingreso' ? (p.bovinos_actuales || 0) + animales.length : 0);

          return {
            ...p,
            estado: nuevoEstado,
            bovinos_actuales: nuevaCantidad,
          };
        }
        return p;
      })
    );

    setPotreroActivo((prev) => {
      if (prev && String(prev.id) === String(potreroId)) {
        const nuevoEstado = determinarEstado();
        const nuevaCantidad = bovinosRestantes !== undefined 
          ? bovinosRestantes 
          : (accion === 'ingreso' ? (prev.bovinos_actuales || 0) + animales.length : 0);

        return {
          ...prev,
          estado: nuevoEstado,
          bovinos_actuales: nuevaCantidad,
        };
      }
      return prev;
    });
  };

  return {
    potreros,
    potreroActivo,
    cargando,
    seleccionarPotrero,
    actualizarGanadoLocal,
    recargarPotreros: cargarPotreros,
  };
}