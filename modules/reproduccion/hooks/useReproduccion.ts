// modules/reproduccion/hooks/useReproduccion.ts
import { useState, useEffect, useCallback } from "react";
import { Reproduccion } from "../schemas";
import { Bovino } from "@/modules/inventario/schemas";

import { 
  getReproduccionesAction, 
  saveReproduccionAction, 
  deleteReproduccionAction 
} from "../actions/reproduccion.actions";
import { getBovinosAction } from "@/modules/inventario/actions/bovino.actions";

export const PAGE_SIZE = 10;

export interface FiltrosReproduccion {
  busqueda: string;
  estado: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
}

const FILTROS_INICIALES: FiltrosReproduccion = {
  busqueda: "",
  estado: "todos",
  tipo: "todos",
  fechaInicio: "",
  fechaFin: "",
};

export function useReproduccion() {
  const [reproducciones, setReproducciones] = useState<Reproduccion[]>([]);
  const [allBovinos, setAllBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [filtros, setFiltros] = useState<FiltrosReproduccion>(FILTROS_INICIALES);

  const fetchReproducciones = useCallback(async () => {
    try {
      setLoading(true);
      const [reproduccionesRes, bovinosRes] = await Promise.all([
        getReproduccionesAction(page, PAGE_SIZE, filtros),
        getBovinosAction(1, 100),
      ]);
      setReproducciones(reproduccionesRes.data);
      setTotal(reproduccionesRes.total);
      setAllBovinos(bovinosRes.data || []);
    } catch (error) {
      console.error("Error al cargar reproducciones:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => {
    fetchReproducciones();
  }, [fetchReproducciones]);

  const nextPage = () => {
    if (page * PAGE_SIZE < total) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleSave = async (dataToSave: Partial<Reproduccion>) => {
    await saveReproduccionAction(dataToSave);
    await fetchReproducciones();
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    await deleteReproduccionAction(id);
    await fetchReproducciones();
  };

  const handleSetFiltros = (nuevosFiltros: FiltrosReproduccion) => {
    setFiltros(nuevosFiltros);
    setPage(1); // Reinicia a la página 1 al aplicar filtros
  };

  return {
    reproducciones,
    allReproducciones: reproducciones,
    allBovinos,
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