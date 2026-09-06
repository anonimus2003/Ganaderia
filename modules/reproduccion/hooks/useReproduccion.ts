// modules/reproduccion/hooks/useReproduccion.ts
'use client';

import { useState, useEffect, useCallback } from "react";
import { Reproduccion, FiltrosReproduccion } from "../schemas";
import { 
  obtenerReproduccionesPaginadas, 
  crearReproduccion, 
  actualizarReproduccion, 
  eliminarReproduccion 
} from "../actions/reproduccion.actions";
import { getErrorMessage } from "@/lib/dataTypes";

export function useReproduccion(initialPageSize: number = 10, initialFiltros?: FiltrosReproduccion) {
  const [reproducciones, setReproducciones] = useState<Reproduccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(initialPageSize);
  const [total, setTotal] = useState<number>(0);
  const [filtros, setFiltros] = useState<FiltrosReproduccion>(initialFiltros || {});

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [reproduccionSeleccionada, setReproduccionSeleccionada] = useState<Reproduccion | null>(null);

  // Sincronizar si cambian los filtros desde el componente externo index.tsx
  useEffect(() => {
    if (initialFiltros) {
      setFiltros(initialFiltros);
      setPage(1); // Resetear a la primera página cuando cambian los filtros
    }
  }, [initialFiltros]);

  const cargarReproducciones = useCallback(async () => {
    try {
      setLoading(true);
      const resultado = await obtenerReproduccionesPaginadas(page, pageSize, filtros);
      setReproducciones(resultado.reproducciones);
      setTotal(resultado.total);
    } catch (error) {
      console.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filtros]);

  useEffect(() => {
    cargarReproducciones();
  }, [cargarReproducciones]);

  const handleCrear = async (data: Partial<Reproduccion>) => {
    await crearReproduccion(data);
    await cargarReproducciones();
  };

  const handleActualizar = async (id: string, data: Partial<Reproduccion>) => {
    await actualizarReproduccion(id, data);
    await cargarReproducciones();
  };

  const handleEliminar = async (id: string) => {
    await eliminarReproduccion(id);
    await cargarReproducciones();
  };

  const nextPage = () => {
    if (page * pageSize < total) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return {
    reproducciones,
    loading,
    page,
    pageSize,
    total,
    filtros,
    setFiltros,
    isModalOpen,
    setIsModalOpen,
    isFilterOpen,
    setIsFilterOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    reproduccionSeleccionada,
    setReproduccionSeleccionada,
    handleCrear,
    handleActualizar,
    handleEliminar,
    nextPage,
    prevPage,
    recargar: cargarReproducciones,
  };
}