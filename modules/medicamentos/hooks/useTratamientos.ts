import { useState, useEffect } from 'react';
import { Bovino, Tratamiento, TratamientoFormData, ViaAplicacion } from '../schemas';
import { getBovinos, getTratamientos, saveTratamiento, deleteTratamiento } from '../actions/medicamentos.actions';

export function useTratamientos() {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterVia, setFilterVia] = useState<string>('Todas');
  const [filterFecha, setFilterFecha] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [formData, setFormData] = useState<TratamientoFormData>({
    bovino_id: '',
    medicamento: '',
    dosis: '',
    via: 'Intramuscular',
    fecha_aplicacion: new Date().toISOString().split('T')[0],
    tiempo_retiro: 0,
    veterinario: '',
    motivo: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bovinosData, tratamientosData] = await Promise.all([
        getBovinos(),
        getTratamientos(),
      ]);
      setBovinos(bovinosData);
      setTratamientos(tratamientosData);
    } catch (error) {
      console.error('Error consultando Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterVia, filterFecha]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      bovino_id: bovinos[0]?.id || '',
      medicamento: '',
      dosis: '',
      via: 'Intramuscular',
      fecha_aplicacion: new Date().toISOString().split('T')[0],
      tiempo_retiro: 0,
      veterinario: '',
      motivo: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tratamiento: Tratamiento) => {
    setEditingId(tratamiento.id);
    setFormData({
      bovino_id: tratamiento.bovino_id,
      medicamento: tratamiento.medicamento,
      dosis: tratamiento.dosis,
      via: tratamiento.via,
      fecha_aplicacion: tratamiento.fecha_aplicacion,
      tiempo_retiro: tratamiento.tiempo_retiro,
      veterinario: tratamiento.veterinario,
      motivo: tratamiento.motivo || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTratamiento(formData, editingId);
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Ocurrió un error al guardar el registro.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro de tratamiento?')) {
      try {
        await deleteTratamiento(id);
        await fetchData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el tratamiento');
      }
    }
  };

  const isEnRetiro = (fechaAplicacion: string, diasRetiro: number) => {
    if (diasRetiro <= 0) return false;
    const fechaApp = new Date(fechaAplicacion);
    const fechaFin = new Date(fechaApp);
    fechaFin.setDate(fechaFin.getDate() + diasRetiro);
    return new Date() <= fechaFin;
  };

  const filteredTratamientos = tratamientos.filter((item) => {
    const bovinoInfo = `${item.bovino?.arete || ''} ${item.bovino?.nombre || ''}`.toLowerCase();
    const matchSearch =
      bovinoInfo.includes(searchTerm.toLowerCase()) ||
      item.medicamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.veterinario.toLowerCase().includes(searchTerm.toLowerCase());

    const matchVia = filterVia === 'Todas' || item.via === filterVia;
    const matchFecha = !filterFecha || item.fecha_aplicacion === filterFecha;

    return matchSearch && matchVia && matchFecha;
  });

  const totalPages = Math.ceil(filteredTratamientos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTratamientos = filteredTratamientos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return {
    bovinos,
    tratamientos,
    loading,
    searchTerm,
    setSearchTerm,
    filterVia,
    setFilterVia,
    filterFecha,
    setFilterFecha,
    isModalOpen,
    setIsModalOpen,
    editingId,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    ITEMS_PER_PAGE,
    formData,
    setFormData,
    paginatedTratamientos,
    filteredTratamientos,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSubmit,
    handleDelete,
    isEnRetiro,
  };
}