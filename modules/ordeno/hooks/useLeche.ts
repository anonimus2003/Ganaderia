// modules/ordeno/hooks/useLeche.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bovino, ProduccionLeche } from '../schemas';
import { getBovinosLista, getProduccionLechePaginated, getMetricasLeche, deleteProduccionLeche } from '../actions/leche.actions';

export const PAGE_SIZE = 10;

export function useLeche() {
  const supabase = createClient();

  const [registros, setRegistros] = useState<ProduccionLeche[]>([]);
  const [bovinosLista, setBovinosLista] = useState<Bovino[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [bovinoFiltroId, setBovinoFiltroId] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Métricas
  const [litrosTotales, setLitrosTotales] = useState<number>(0);
  const [concentradoTotal, setConcentradoTotal] = useState<number>(0);
  const [promedioOrdeno, setPromedioOrdeno] = useState<string>('0');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroBovinoModal, setFiltroBovinoModal] = useState<string>('');
  const [formData, setFormData] = useState({
    bovino_id: '',
    fecha: new Date().toISOString().split('T')[0],
    litros: '',
    jornada: 'Mañana' as 'Mañana' | 'Tarde',
    concentrado_kg: '0',
    observaciones: '',
  });

  const fetchDataBovinos = useCallback(async () => {
    try {
      const data = await getBovinosLista(supabase);
      setBovinosLista(data);
    } catch (error) {
      console.error(error);
    }
  }, [supabase]);

  const fetchDataTabla = useCallback(async () => {
    setLoading(true);
    try {
      const { registros, totalCount } = await getProduccionLechePaginated(supabase, {
        page,
        busqueda,
        bovinoFiltroId,
        fechaInicio,
        fechaFin,
      });
      setRegistros(registros);
      setTotalCount(totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [supabase, page, busqueda, bovinoFiltroId, fechaInicio, fechaFin]);

  const fetchMetricasData = useCallback(async () => {
    try {
      // Si no hay filtros activos, usamos la función RPC para traer el total histórico real completo
      if (!busqueda && !bovinoFiltroId && !fechaInicio && !fechaFin) {
        const { data: totalReal, error } = await supabase.rpc("obtener_suma_total_litros");
        if (!error) {
          setLitrosTotales(Number(totalReal) || 0);
        }
      } else {
        // Si el usuario aplicó filtros, usa la función basada en los filtros
        const metricas = await getMetricasLeche(supabase, {
          busqueda,
          bovinoFiltroId,
          fechaInicio,
          fechaFin,
        });
        setLitrosTotales(metricas.litrosTotales);
      }

      // Las demás métricas generales de concentrado y promedio
      const metricasGenerales = await getMetricasLeche(supabase, {
        busqueda,
        bovinoFiltroId,
        fechaInicio,
        fechaFin,
      });
      setConcentradoTotal(metricasGenerales.concentradoTotal);
      setPromedioOrdeno(metricasGenerales.promedioOrdeno);

    } catch (error) {
      console.error(error);
    }
  }, [supabase, busqueda, bovinoFiltroId, fechaInicio, fechaFin]);

  useEffect(() => {
    fetchDataBovinos();
  }, [fetchDataBovinos]);

  useEffect(() => {
    fetchDataTabla();
    fetchMetricasData();
  }, [fetchDataTabla, fetchMetricasData]);

  const resetFiltros = () => {
    setBusqueda('');
    setBovinoFiltroId('');
    setFechaInicio('');
    setFechaFin('');
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Deseas eliminar este registro de ordeño?')) {
      try {
        await deleteProduccionLeche(supabase, id);
        fetchDataTabla();
        fetchMetricasData();
      } catch (error: any) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const handleOpenEdit = (item: ProduccionLeche) => {
    setEditingId(item.id);
    setFormData({
      bovino_id: item.bovino_id,
      fecha: item.fecha,
      litros: item.litros.toString(),
      jornada: item.jornada,
      concentrado_kg: (item.concentrado_kg || 0).toString(),
      observaciones: item.observaciones || '',
    });
    setFiltroBovinoModal('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFiltroBovinoModal('');
    setFormData({
      bovino_id: bovinosLista[0]?.id || '',
      fecha: new Date().toISOString().split('T')[0],
      litros: '',
      jornada: 'Mañana',
      concentrado_kg: '0',
      observaciones: '',
    });
  };

  return {
    supabase,
    registros,
    bovinosLista,
    totalCount,
    page,
    setPage,
    loading,
    busqueda,
    setBusqueda,
    bovinoFiltroId,
    setBovinoFiltroId,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    litrosTotales,
    concentradoTotal,
    promedioOrdeno,
    isModalOpen,
    setIsModalOpen,
    editingId,
    filtroBovinoModal,
    setFiltroBovinoModal,
    formData,
    setFormData,
    resetFiltros,
    handleDelete,
    handleOpenEdit,
    closeModal,
    fetchDataTabla,
    fetchMetricasData,
  };
}