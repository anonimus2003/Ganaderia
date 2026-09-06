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
  const [allBovinos, setAllBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
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
      const data = await getBovinosAction();
      setAllBovinos(data || []);
    } catch (error) {
      console.error("Error al cargar bovinos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBovinos();
  }, [fetchBovinos]);

  const filteredBovinos = allBovinos.filter(b => {
    const cumpleBusqueda = !filtros.busqueda || 
      (b.arete && b.arete.toLowerCase().includes(filtros.busqueda.toLowerCase())) || 
      (b.nombre && b.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()));
    
    const cumpleGenero = filtros.sexo === "todos" || 
      (b.genero && b.genero.toLowerCase().trim() === filtros.sexo.toLowerCase().trim());

    let cumpleEstado = true;
    if (filtros.estado !== "todos") {
      const estadoAnimal = (b.condicion || (b as any).estado || "").toLowerCase().trim();
      const filtroEst = filtros.estado.toLowerCase().replace(/s$/, "").trim();
      cumpleEstado = estadoAnimal.includes(filtroEst);
    }

    const cumpleCategoria = filtros.categoria === "todas" || 
      (b.categoria && b.categoria.toLowerCase().trim() === filtros.categoria.toLowerCase().trim());

    const cumpleOrigen = filtros.origen === "todos" || 
      (b.origen && b.origen.toLowerCase().trim() === filtros.origen.toLowerCase().trim());

    return cumpleBusqueda && cumpleGenero && cumpleEstado && cumpleCategoria && cumpleOrigen;
  });

  const total = filteredBovinos.length;
  const paginatedBovinos = filteredBovinos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    setPage(1);
  };

  return {
    bovinos: paginatedBovinos, 
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