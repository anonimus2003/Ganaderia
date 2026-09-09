// modules/pesajes/hooks/usePesajes.ts
import { useState, useEffect, useCallback } from "react";
import { Pesaje } from "../schemas";
import { Bovino } from "@/modules/inventario/schemas";

import { getPesajesAction, savePesajeAction, deletePesajeAction } from "../actions/pesaje.actions";
import { getBovinosAction } from "@/modules/inventario/actions/bovino.actions";

export const PAGE_SIZE = 10;

export interface FiltrosPesaje {
  busqueda: string;
  fechaInicio: string;
  fechaFin: string;
}

const FILTROS_INICIALES: FiltrosPesaje = {
  busqueda: "",
  fechaInicio: "",
  fechaFin: "",
};

export function usePesajes() {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [allBovinos, setAllBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [filtros, setFiltros] = useState<FiltrosPesaje>(FILTROS_INICIALES);

  const fetchPesajes = useCallback(async () => {
    try {
      setLoading(true);
      const [pesajesRes, bovinosRes] = await Promise.all([
        getPesajesAction(page, PAGE_SIZE, filtros),
        getBovinosAction(1, 100),
      ]);
      setPesajes(pesajesRes.data);
      setTotal(pesajesRes.total);
      setAllBovinos(bovinosRes.data || []);
    } catch (error) {
      console.error("Error al cargar pesajes:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => {
    fetchPesajes();
  }, [fetchPesajes]);

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
    pesajes,
    allPesajes: pesajes,
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