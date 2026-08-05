'use client';

import { useState, useEffect, useMemo } from 'react';
import { Inseminacion } from '../schemas';
import { fetchInseminacionesAction, deleteInseminacionAction } from '../actions/inseminacionActions';

export function useInseminacion() {
  const [inseminaciones, setInseminaciones] = useState<Inseminacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInseminacion, setSelectedInseminacion] = useState<Inseminacion | null>(null);

  const loadInseminaciones = async () => {
    setLoading(true);
    const { data } = await fetchInseminacionesAction();
    if (data) setInseminaciones(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInseminaciones();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedInseminacion(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Inseminacion) => {
    setSelectedInseminacion(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar este registro de inseminación?')) return;
    const { error } = await deleteInseminacionAction(id);
    if (!error) loadInseminaciones();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  // Estadísticas reales
  const total = inseminaciones.length;
  const gestantes = inseminaciones.filter((i) => i.estado === 'Gestante' || i.estado === 'Confirmada').length;
  const pendientes = inseminaciones.filter((i) => i.estado === 'Pendiente').length;
  const efectividad = total > 0 ? Math.round((gestantes / total) * 100) : 0;

  // Agenda Dinámica
  const agendaEventos = useMemo(() => {
    const eventos: {
      id: string;
      fecha: string;
      titulo: string;
      subtitulo: string;
      tipo: 'chequeo' | 'parto';
      bovinoInfo: string;
    }[] = [];

    inseminaciones.forEach((item) => {
      if (item.fecha_chequeo && item.estado === 'Pendiente') {
        eventos.push({
          id: item.id + '-chk',
          fecha: item.fecha_chequeo,
          titulo: 'Chequeo Palpación',
          subtitulo: 'Pendiente de confirmación',
          tipo: 'chequeo',
          bovinoInfo: `Arete: ${item.bovinos?.arete || 'S/N'} ${item.bovinos?.nombre ? `(${item.bovinos.nombre})` : ''}`,
        });
      }
      if (item.fecha_probable_parto && (item.estado === 'Gestante' || item.estado === 'Confirmada')) {
        eventos.push({
          id: item.id + '-prt',
          fecha: item.fecha_probable_parto,
          titulo: 'Probable Parto',
          subtitulo: 'Preñez activa',
          tipo: 'parto',
          bovinoInfo: `Arete: ${item.bovinos?.arete || 'S/N'} ${item.bovinos?.nombre ? `(${item.bovinos.nombre})` : ''}`,
        });
      }
    });

    return eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [inseminaciones]);

  // Filtrado de la lista principal
  const filteredData = inseminaciones.filter((item) => {
    const arete = item.bovinos?.arete?.toLowerCase() || '';
    const nombre = item.bovinos?.nombre?.toLowerCase() || '';
    const toro = item.toro_pajilla?.toLowerCase() || '';
    const matchesQuery = arete.includes(searchQuery.toLowerCase()) || nombre.includes(searchQuery.toLowerCase()) || toro.includes(searchQuery.toLowerCase());

    if (selectedFilter === 'Gestantes') return matchesQuery && (item.estado === 'Gestante' || item.estado === 'Confirmada');
    if (selectedFilter === 'Pendientes') return matchesQuery && item.estado === 'Pendiente';
    if (selectedFilter === 'Fallidas') return matchesQuery && item.estado === 'Fallida';
    return matchesQuery;
  });

  return {
    inseminaciones,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    isModalOpen,
    setIsModalOpen,
    selectedInseminacion,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleDelete,
    formatDate,
    total,
    gestantes,
    pendientes,
    efectividad,
    agendaEventos,
    filteredData,
    loadInseminaciones,
  };
}