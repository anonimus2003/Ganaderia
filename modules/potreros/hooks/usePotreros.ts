import { useState, useEffect, useCallback } from 'react';
import { Potrero, HistorialItem } from '../schemas';
import {
  getPotreros,
  getHistorialPotrero,
  updatePotreroCoordenadas,
  insertPotrero,
  updatePotreroCompleto,
  deletePotreroDb,
} from '../actions/potreros.actions';

export function usePotreros() {
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [historialPotrero, setHistorialPotrero] = useState<HistorialItem[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);
  const [paginaHistorial, setPaginaHistorial] = useState<number>(1);
  const [mostrarControlesMover, setMostrarControlesMover] = useState<boolean>(false);

  const [creandoDesdeMapa, setCreandoDesdeMapa] = useState<boolean>(false);
  const [nuevoX, setNuevoX] = useState<number>(50);
  const [nuevoY, setNuevoY] = useState<number>(50);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Quitamos 'selectedId' de las dependencias para evitar ciclos innecesarios
  const fetchPotrerosData = useCallback(async () => {
    try {
      setLoading(true);
      const formatted = await getPotreros();
      setPotreros(formatted);
    } catch (error) {
      console.error('Error al cargar potreros:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistorialData = useCallback(async (id: number) => {
    setPaginaHistorial(1);
    const data = await getHistorialPotrero(id);
    setHistorialPotrero(data);
  }, []);

  // Carga inicial de los potreros
  useEffect(() => {
    fetchPotrerosData();
  }, [fetchPotrerosData]);

  // 2. CORREGIDO: Se removió 'potreros' de las dependencias. Solo debe cargar el historial cuando cambie el ID seleccionado.
  useEffect(() => {
    if (selectedId) {
      fetchHistorialData(selectedId);
    }
  }, [selectedId, fetchHistorialData]);

  // Si el id seleccionado no es válido tras un cambio, seleccionamos el primero por defecto de forma segura
  const potreroSeleccionado = potreros.find((p) => p.id === selectedId) || potreros[0];

  const moverPin = async (direccion: 'arriba' | 'abajo' | 'izquierda' | 'derecha') => {
    if (!potreroSeleccionado) return;
    let x = potreroSeleccionado.x;
    let y = potreroSeleccionado.y;
    const paso = 1.5;

    if (direccion === 'arriba') y = Math.max(0, Number((y - paso).toFixed(1)));
    if (direccion === 'abajo') y = Math.min(100, Number((y + paso).toFixed(1)));
    if (direccion === 'izquierda') x = Math.max(0, Number((x - paso).toFixed(1)));
    if (direccion === 'derecha') x = Math.min(100, Number((x + paso).toFixed(1)));

    try {
      await updatePotreroCoordenadas(potreroSeleccionado.id, x, y);
      setPotreros(potreros.map((p) => (p.id === potreroSeleccionado.id ? { ...p, x, y } : p)));
    } catch (error) {
      console.error("Error al mover el pin:", error);
    }
  };

  const potrerosFiltrados = potreros.filter((p) => {
    const coincideFiltro = filtroEstado === 'todos' || p.estado.toLowerCase() === filtroEstado.toLowerCase();
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.id.toString().includes(busqueda);
    return coincideFiltro && coincideBusqueda;
  });

  return {
    potreros,
    loading,
    selectedId,
    setSelectedId,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    historialPotrero,
    mostrarHistorial,
    setMostrarHistorial,
    paginaHistorial,
    setPaginaHistorial,
    mostrarControlesMover,
    setMostrarControlesMover,
    creandoDesdeMapa,
    setCreandoDesdeMapa,
    nuevoX,
    setNuevoX,
    nuevoY,
    setNuevoY,
    isModalOpen,
    setIsModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    potreroSeleccionado,
    potrerosFiltrados,
    moverPin,
    fetchPotrerosData,
    fetchHistorialData,
  };
}