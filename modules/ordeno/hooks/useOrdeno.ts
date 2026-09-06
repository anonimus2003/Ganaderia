// modules/ordeno/hooks/useOrdeno.ts
import { useState, useEffect, useCallback } from 'react';
import { obtenerOrdenosPaginados } from '../actions/ordeno.actions';
import { Ordeno, FiltrosOrdeno } from '../schemas';

export function useOrdeno(porPagina: number = 10, filtros?: FiltrosOrdeno) {
  const [ordenos, setOrdenos] = useState<Ordeno[]>([]);
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [actualizarTrigger, setActualizarTrigger] = useState(0);

  // Memorizamos el JSON para estabilizar el cambio de filtros
  const filtrosString = JSON.stringify(filtros || {});

  const cargarOrdenos = useCallback(async (numeroPagina: number, filtrosActuales?: FiltrosOrdeno) => {
    try {
      setCargando(true);
      const resultado = await obtenerOrdenosPaginados(numeroPagina, porPagina, filtrosActuales || {});
      setOrdenos(resultado.ordenos as Ordeno[]);
      setTotal(resultado.total);
    } catch (error) {
      console.error("Error al obtener registros de ordeño:", error);
    } finally {
      setCargando(false);
    }
  }, [porPagina, filtrosString]);

  useEffect(() => {
    cargarOrdenos(pagina, filtros);
  }, [pagina, filtrosString, actualizarTrigger, cargarOrdenos]); // Se eliminó 'filtros' repetido porque filtrosString ya lo controla

  return {
    ordenos,
    cargando,
    pagina,
    setPagina,
    total,
    recargar: () => setActualizarTrigger(prev => prev + 1),
  };
}