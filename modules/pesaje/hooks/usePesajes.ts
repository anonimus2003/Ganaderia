// modules/pesaje/hooks/usePesajes.ts
import { useState, useEffect, useCallback } from 'react';
import { obtenerPesajesPaginados } from '../actions/pesaje.actions';
import { Pesaje } from '../schemas';
import { FiltrosPesaje } from '../components/PesajeFiltersDrawer';

export function usePesajes(porPagina: number = 10, filtros: FiltrosPesaje) {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [actualizarTrigger, setActualizarTrigger] = useState(0);

  const cargarPesajes = useCallback(async (numeroPagina: number, filtrosActuales: FiltrosPesaje) => {
    try {
      setCargando(true);
      // Envía la página, la cantidad por página y el objeto completo de filtros actualizado
      const resultado = await obtenerPesajesPaginados(numeroPagina, porPagina, filtrosActuales);
      setPesajes(resultado.pesajes as Pesaje[]);
      setTotal(resultado.total);
    } catch (error) {
      console.error("Error al obtener pesajes:", error);
    } finally {
      setCargando(false);
    }
  }, [porPagina]);

  useEffect(() => {
    cargarPesajes(pagina, filtros);
  }, [pagina, filtros, actualizarTrigger, cargarPesajes]);

  return {
    pesajes,
    cargando,
    pagina,
    setPagina,
    total,
    recargar: () => setActualizarTrigger(prev => prev + 1),
  };
}