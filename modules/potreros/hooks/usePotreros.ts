'use client';

import { useState, useEffect, useCallback } from 'react';
import { Potrero } from '../types/potrero.types';
import { EventoBitacora } from '@/modules/potreros/types/potrero.types';
import { getPotrerosData } from '@/modules/potreros/api/get-potreros-data';

export type ModoDrawer = 
  | 'CREAR_POTRERO' 
  | 'EDITAR_POTRERO' 
  | 'REGISTRAR_OCUPACION' 
  | 'REGISTRAR_ABONO' 
  | null;

export const usePotreros = () => {
  // Estados de datos
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [eventos, setEventos] = useState<EventoBitacora[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI y selección
  const [potreroSeleccionado, setPotreroSeleccionado] = useState<Potrero | null>(null);
  const [modoDrawer, setModoDrawer] = useState<ModoDrawer>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Carga inicial y refetch de datos desde Supabase / API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { potrerosData, eventosData } = await getPotrerosData();

      setPotreros(potrerosData || []);
      setEventos(eventosData || []);

      // Si había un potrero seleccionado, actualizamos sus datos con la nueva información
      if (potreroSeleccionado) {
        const actualizado = potrerosData?.find(
          (p) => String(p.id) === String(potreroSeleccionado.id)
        );
        setPotreroSeleccionado(actualizado || null);
      }
    } catch (err: any) {
      console.error('Error al cargar información de potreros:', err);
      setError(err?.message || 'Error al cargar los potreros.');
    } finally {
      setLoading(false);
    }
  }, [potreroSeleccionado]);

  useEffect(() => {
    fetchData();
  }, []);

  // Handler para seleccionar potrero desde el mapa o la lista
  const seleccionarPotrero = (potrero: Potrero) => {
    if (potreroSeleccionado?.id === potrero.id) {
      // Toggle: Si se vuelve a tocar el mismo, se deselecciona
      setPotreroSeleccionado(null);
    } else {
      setPotreroSeleccionado(potrero);
    }
  };

  // Control de apertura del Drawer
  const abrirDrawer = (modo: ModoDrawer) => {
    setModoDrawer(modo);
    setIsDrawerOpen(true);
  };

  // Control de cierre del Drawer
  const cerrarDrawer = () => {
    setIsDrawerOpen(false);
    setModoDrawer(null);
  };

  return {
    // Datos
    potreros,
    eventos,
    loading,
    error,

    // Selección
    potreroSeleccionado,
    potreroSeleccionadoId: potreroSeleccionado?.id ?? null,
    seleccionarPotrero,

    // Modal / Drawer
    isDrawerOpen,
    modoDrawer,
    abrirDrawer,
    cerrarDrawer,

    // Acciones de recarga
    refetchData: fetchData,
  };
};