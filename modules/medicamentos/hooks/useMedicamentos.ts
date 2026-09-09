// modules/medicamentos/hooks/useMedicamentos.ts
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

const FILTROS_INICIALES: FiltrosMedicamento = {
  search: "",
  viaSeleccionada: "",
  fechaInicio: "",
  fechaFin: "",
};

export function useMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [filtros, setFiltros] = useState<FiltrosMedicamento>(FILTROS_INICIALES);

  const fetchMedicamentos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMedicamentosAction(page, PAGE_SIZE, filtros);
      setMedicamentos(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Error al cargar medicamentos:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => {
    fetchMedicamentos();
  }, [fetchMedicamentos]);

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
    medicamentos, // 👈 Ahora devuelve directamente los 10 paginados desde el servidor
    allMedicamentos: medicamentos, 
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