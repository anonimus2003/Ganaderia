import { useState, useEffect, useCallback } from "react";
import { Pesaje } from "../schemas";
import { getPesajesAction, savePesajeAction, deletePesajeAction } from "../actions/pesaje.actions";

export const PAGE_SIZE = 10;

export interface FiltrosPesaje {
  busqueda: string;
  fechaInicio: string;
  fechaFin: string;
}

export function usePesajes() {
  const [allPesajes, setAllPesajes] = useState<Pesaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  const [filtros, setFiltros] = useState<FiltrosPesaje>({
    busqueda: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const fetchPesajes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPesajesAction();
      setAllPesajes(data || []);
    } catch (error) {
      console.error("Error al cargar pesajes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPesajes();
  }, [fetchPesajes]);

  const filteredPesajes = allPesajes.filter(p => {
    const areteBovino = p.bovinos?.arete || "";
    const nombreBovino = p.bovinos?.nombre || "";
    
    const cumpleBusqueda = !filtros.busqueda || 
      areteBovino.toLowerCase().includes(filtros.busqueda.toLowerCase()) || 
      nombreBovino.toLowerCase().includes(filtros.busqueda.toLowerCase());

    const fechaPesajeStr = p.fecha ? p.fecha.split("T")[0] : "";

    const cumpleFechaInicio = !filtros.fechaInicio || fechaPesajeStr >= filtros.fechaInicio;
    const cumpleFechaFin = !filtros.fechaFin || fechaPesajeStr <= filtros.fechaFin;

    return cumpleBusqueda && cumpleFechaInicio && cumpleFechaFin;
  });

  const total = filteredPesajes.length;
  const paginatedPesajes = filteredPesajes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const nextPage = () => {
    if (page * PAGE_SIZE < total) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleSave = async (dataToSave: Partial<Pesaje>) => {
    await savePesajeAction(dataToSave);
    await fetchPesajes();
  };

  const handleDelete = async (id: string) => {
    await deletePesajeAction(id);
    await fetchPesajes();
  };

  const handleSetFiltros = (nuevosFiltros: FiltrosPesaje) => {
    setFiltros(nuevosFiltros);
    setPage(1);
  };

  return {
    pesajes: paginatedPesajes,
    allPesajes,
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
    filtros,
    setFiltros: handleSetFiltros,
  };
}