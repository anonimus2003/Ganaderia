import { useState, useEffect, useCallback } from "react";
import { 
  obtenerBovinos, 
  obtenerProduccion, 
  obtenerTotalLitrosHistorico, 
  obtenerTratamientos, 
  obtenerActividadReciente 
} from "../services/dashboardService";
import { Bovino, ProduccionLeche, Tratamiento, RegistroActividad } from "../tipos";

export function useDashboard() {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [produccion, setProduccion] = useState<ProduccionLeche[]>([]);
  const [totalHistorico, setTotalHistorico] = useState<number>(0);
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [actividad, setActividad] = useState<RegistroActividad[]>([]);
  const [bovinoSeleccionado, setBovinoSeleccionado] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatosGlobales() {
      try {
        setLoading(true);
        const [listaBovinos, listaTratamientos, listaActividad, historico] = await Promise.all([
          obtenerBovinos(),
          obtenerTratamientos(),
          obtenerActividadReciente(),
          obtenerTotalLitrosHistorico(),
        ]);
        setBovinos(listaBovinos);
        setTratamientos(listaTratamientos);
        setActividad(listaActividad);
        setTotalHistorico(historico);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    cargarDatosGlobales();
  }, []);

  const cargarDatosProduccion = useCallback(async (idBovino?: string) => {
    try {
      const datosProd = await obtenerProduccion(idBovino);
      setProduccion(datosProd);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    cargarDatosProduccion(bovinoSeleccionado);
  }, [bovinoSeleccionado, cargarDatosProduccion]);

  return {
    bovinos,
    produccion,
    totalHistorico,
    tratamientos,
    actividad,
    bovinoSeleccionado,
    setBovinoSeleccionado,
    loading,
    error,
  };
}