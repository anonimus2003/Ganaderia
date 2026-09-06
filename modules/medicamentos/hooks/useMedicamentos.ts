'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { 
  obtenerMedicamentosPaginados, 
  crearMedicamento, 
  actualizarMedicamento, 
  eliminarMedicamento,
  FiltrosMedicamento 
} from '../actions/medicamentos.actions';
import { Medicamento } from '../schemas';
import { toast } from 'sonner';

export function useMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [filtros, setFiltros] = useState<FiltrosMedicamento>({});
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  const cargarMedicamentos = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await obtenerMedicamentosPaginados(pagina, porPagina, filtros);
      setMedicamentos(resultado.medicamentos || []);
      setTotal(resultado.total);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar los medicamentos');
    } finally {
      setCargando(false);
    }
  }, [pagina, porPagina, filtros]);

  useEffect(() => {
    cargarMedicamentos();
  }, [cargarMedicamentos]);

  const handleCrear = async (nuevoMedicamento: any) => {
    try {
      await crearMedicamento(nuevoMedicamento);
      toast.success('Medicamento registrado correctamente');
      cargarMedicamentos();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar el medicamento');
      return false;
    }
  };

  const handleActualizar = async (id: string, medicamentoActualizado: any) => {
    try {
      await actualizarMedicamento(id, medicamentoActualizado);
      toast.success('Medicamento actualizado correctamente');
      cargarMedicamentos();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el medicamento');
      return false;
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await eliminarMedicamento(id);
      toast.success('Medicamento eliminado correctamente');
      cargarMedicamentos();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el medicamento');
      return false;
    }
  };

  return {
    medicamentos,
    total,
    pagina,
    setPagina,
    porPagina,
    setPorPagina,
    filtros,
    setFiltros,
    cargando,
    isPending,
    cargarMedicamentos,
    handleCrear,
    handleActualizar,
    handleEliminar,
  };
}