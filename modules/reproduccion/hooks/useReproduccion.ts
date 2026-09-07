import { useState, useEffect, useCallback } from "react";
import { Reproduccion } from "../schemas";
import { 
  getReproduccionesAction, 
  saveReproduccionAction, 
  deleteReproduccionAction 
} from "../actions/reproduccion.actions";

export const PAGE_SIZE = 10;

export interface FiltrosReproduccion {
  estado: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
}

export function useReproduccion() {
  const [allReproducciones, setAllReproducciones] = useState<Reproduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  const [filtros, setFiltros] = useState<FiltrosReproduccion>({
    estado: "todos",
    tipo: "todos",
    fechaInicio: "",
    fechaFin: "",
  });

  const fetchReproducciones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReproduccionesAction();
      setAllReproducciones(data || []);
    } catch (error) {
      console.error("Error al cargar reproducciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReproducciones();
  }, [fetchReproducciones]);

  const filteredReproducciones = allReproducciones.filter(item => {
    const cumpleEstado = filtros.estado === "todos" || !filtros.estado || 
      (item.estado && item.estado.toLowerCase().trim() === filtros.estado.toLowerCase().trim());

    const cumpleTipo = filtros.tipo === "todos" || !filtros.tipo || 
      (item.tipo && item.tipo.toLowerCase().trim() === filtros.tipo.toLowerCase().trim());

    let cumpleFechaInicio = true;
    if (filtros.fechaInicio && item.fecha_inseminacion) {
      cumpleFechaInicio = item.fecha_inseminacion.split("T")[0] >= filtros.fechaInicio;
    }

    let cumpleFechaFin = true;
    if (filtros.fechaFin && item.fecha_inseminacion) {
      cumpleFechaFin = item.fecha_inseminacion.split("T")[0] <= filtros.fechaFin;
    }

    return cumpleEstado && cumpleTipo && cumpleFechaInicio && cumpleFechaFin;
  });

  const total = filteredReproducciones.length;
  const paginatedReproducciones = filteredReproducciones.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    setPage(1);
  };

  return {
    reproducciones: paginatedReproducciones,
    allReproducciones,
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