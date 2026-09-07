import { useState, useEffect, useCallback } from "react";
import { Medicamento } from "../schemas";
import { 
  getMedicamentosAction, 
  saveMedicamentoAction, 
  deleteMedicamentoAction 
} from "../actions/medicamentos.actions";

export const PAGE_SIZE = 10;

export interface FiltrosMedicamento {
  search: string;
  viaSeleccionada: string;
  fechaInicio: string;
  fechaFin: string;
}

export function useMedicamentos() {
  const [allMedicamentos, setAllMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  const [filtros, setFiltros] = useState<FiltrosMedicamento>({
    search: "",
    viaSeleccionada: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const fetchMedicamentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMedicamentosAction();
      setAllMedicamentos(data || []);
    } catch (error) {
      console.error("Error al cargar medicamentos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicamentos();
  }, [fetchMedicamentos]);

  const filteredMedicamentos = allMedicamentos.filter(m => {
    const s = filtros.search.toLowerCase().trim();
    
    // Búsqueda ampliada para incluir arete, nombre del bovino, veterinario y medicamento
    const cumpleSearch = !s || 
      (m.medicamento && m.medicamento.toLowerCase().includes(s)) ||
      (m.via && m.via.toLowerCase().includes(s)) ||
      (m.veterinario && m.veterinario.toLowerCase().includes(s)) ||
      (m.bovinos?.arete && m.bovinos.arete.toLowerCase().includes(s)) ||
      (m.bovinos?.nombre && m.bovinos.nombre.toLowerCase().includes(s));

    const via = filtros.viaSeleccionada.trim();
    const cumpleVia = !via || 
      (m.via && m.via.toLowerCase().trim() === via.toLowerCase().trim());

    let cumpleFechaInicio = true;
    if (filtros.fechaInicio && m.fecha_aplicacion) {
      cumpleFechaInicio = m.fecha_aplicacion.split("T")[0] >= filtros.fechaInicio;
    }

    let cumpleFechaFin = true;
    if (filtros.fechaFin && m.fecha_aplicacion) {
      cumpleFechaFin = m.fecha_aplicacion.split("T")[0] <= filtros.fechaFin;
    }

    return cumpleSearch && cumpleVia && cumpleFechaInicio && cumpleFechaFin;
  });

  const total = filteredMedicamentos.length;
  const paginatedMedicamentos = filteredMedicamentos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const nextPage = () => {
    if (page * PAGE_SIZE < total) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleSave = async (dataToSave: Partial<Medicamento>) => {
    await saveMedicamentoAction(dataToSave);
    await fetchMedicamentos();
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    await deleteMedicamentoAction(id);
    await fetchMedicamentos();
  };

  const handleSetFiltros = (nuevosFiltros: FiltrosMedicamento) => {
    setFiltros(nuevosFiltros);
    setPage(1); // Reinicia a la página 1 cuando cambian los filtros
  };

  return {
    medicamentos: paginatedMedicamentos, 
    allMedicamentos,                         
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
    filtros, // <-- Agrega esta línea aquí
    setFiltros: handleSetFiltros,
  };
}