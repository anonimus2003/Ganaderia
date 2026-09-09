// modules/inventario/hooks/useBovinos.ts
import { useState, useEffect, useCallback } from "react";
import { Bovino } from "../schemas";
import { getBovinosAction, saveBovinoAction, deleteBovinoAction } from "../actions/bovino.actions";

export const PAGE_SIZE = 10;

export interface FiltrosBovino {
  busqueda: string;
  sexo: string;
  estado: string;
  categoria: string;
  origen: string;
}

export function useBovinos() {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [filtros, setFiltros] = useState<FiltrosBovino>({
    busqueda: "",
    sexo: "todos",
    estado: "todos", 
    categoria: "todas",
    origen: "todos",
  });

  const fetchBovinos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, total: totalRegs } = await getBovinosAction(page, PAGE_SIZE, filtros);
      setBovinos(data);
      setTotal(totalRegs);
    } catch (error) {
      console.error("Error al cargar bovinos:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => {
    fetchBovinos();
  }, [fetchBovinos]);

  const nextPage = () => {
    if (page * PAGE_SIZE < total) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleSave = async (dataToSave: Partial<Bovino>) => {
    await saveBovinoAction(dataToSave);
    await fetchBovinos();
  };

  const handleDelete = async (id: string) => {
    await deleteBovinoAction(id);
    await fetchBovinos();
  };

  const handleSetFiltros = (nuevosFiltros: FiltrosBovino) => {
    setFiltros(nuevosFiltros);
    setPage(1); // Regresa a la primera página cada vez que cambias un filtro
  };

  return {
    bovinos, 
    allBovinos: bovinos, // Compatible si tu UI lo usaba para referencias rápidas
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