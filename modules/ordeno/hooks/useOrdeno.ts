// modules/ordeño/hooks/useOrdeños.ts
import { useState, useEffect, useCallback } from "react";
import { Ordeño, Bovino } from "../schemas";
import { getOrdeñosAction, saveOrdeñoAction, deleteOrdeñoAction } from "../actions/ordeno.actions";
import { getBovinosAction } from "@/modules/inventario/actions/bovino.actions";

export const PAGE_SIZE = 10;

export interface FiltrosOrdeño {
  busqueda: string;
  turno: string;
  fechaInicio: string;
  fechaFin: string;
}

export function useOrdeños() {
  const [ordeños, setOrdeños] = useState<Ordeño[]>([]);
  const [allBovinos, setAllBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [filtros, setFiltros] = useState<FiltrosOrdeño>({
    busqueda: "",
    turno: "todos",
    fechaInicio: "",
    fechaFin: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordeñosRes, bovinosRes] = await Promise.all([
        getOrdeñosAction(page, PAGE_SIZE, filtros),
        getBovinosAction(1, 100),
      ]);
      setOrdeños(ordeñosRes.data);
      setTotal(ordeñosRes.total);
      setAllBovinos(bovinosRes.data || [] );
    } catch (error) {
      console.error("Error al cargar datos de ordeño:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextPage = () => {
    if (page * PAGE_SIZE < total) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleSave = async (dataToSave: Partial<Ordeño>) => {
    await saveOrdeñoAction(dataToSave);
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    await deleteOrdeñoAction(id);
    await fetchData();
  };

  const handleSetFiltros = (nuevosFiltros: FiltrosOrdeño) => {
    setFiltros(nuevosFiltros);
    setPage(1); // <--- Esto soluciona que al limpiar o buscar te devuelva siempre a la página 1 limpia
  };

  return {
    ordeños,
    allOrdeños: ordeños,
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