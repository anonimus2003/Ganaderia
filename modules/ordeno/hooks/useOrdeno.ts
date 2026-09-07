// modules/ordeño/hooks/useOrdeños.ts
import { useState, useEffect, useCallback } from "react";
import { Ordeño, Bovino } from "../schemas";
import { getOrdeñosAction, saveOrdeñoAction, deleteOrdeñoAction } from "../actions/ordeno.actions";
import { getBovinosAction } from "@/modules/inventario/actions/bovino.actions";

export const PAGE_SIZE = 10;

export interface FiltrosOrdeño {
  busqueda: string;
  turno: string;
  fecha: string;
}

export function useOrdeños() {
  const [allOrdeños, setAllOrdeños] = useState<Ordeño[]>([]);
  const [allBovinos, setAllBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  const [filtros, setFiltros] = useState<FiltrosOrdeño>({
    busqueda: "",
    turno: "todos",
    fecha: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordeñosData, bovinosData] = await Promise.all([
        getOrdeñosAction(),
        getBovinosAction(),
      ]);
      setAllOrdeños(ordeñosData || []);
      setAllBovinos(bovinosData || []);
    } catch (error) {
      console.error("Error al cargar datos de ordeño:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOrdeños = allOrdeños.filter(o => {
    const arete = o.bovinos?.arete || "";
    const nombre = o.bovinos?.nombre || "";
    
    const cumpleBusqueda = !filtros.busqueda || 
      arete.toLowerCase().includes(filtros.busqueda.toLowerCase()) || 
      nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleTurno = filtros.turno === "todos" || 
      (o.jornada && o.jornada.toLowerCase().trim() === filtros.turno.toLowerCase().trim());

    const cumpleFecha = !filtros.fecha || 
      (o.fecha && String(o.fecha).startsWith(filtros.fecha));

    return cumpleBusqueda && cumpleTurno && cumpleFecha;
  });

  const total = filteredOrdeños.length;
  const paginatedOrdeños = filteredOrdeños.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    setPage(1);
  };

  return {
    ordeños: paginatedOrdeños,
    allOrdeños,
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