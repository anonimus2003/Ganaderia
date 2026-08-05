"use client";

import React from "react";
import { useDashboard } from "./hooks/useDashboard";
import TarjetasMetricas from "./componentes/metricas/TarjetasMetricas";
import ContenedorGraficaPrincipal from "./componentes/grafica/ContenedorGraficaPrincipal";
import SaludHato from "./componentes/lateral/SaludHato";
import AlertasImportantes from "./componentes/lateral/AlertasImportantes";
import ActividadReciente from "./componentes/lateral/ActividadReciente";

export default function DashboardControl() {
  const {
    bovinos,
    produccion,
    totalHistorico,
    tratamientos,
    actividad,
    bovinoSeleccionado,
    setBovinoSeleccionado,
    loading,
    error,
  } = useDashboard();

  if (loading && bovinos.length === 0) {
    return <p className="p-6 text-white">Cargando panel principal...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">Error al cargar los datos: {error}</p>;
  }

  // Cálculos para la gráfica y promedios basados en los registros filtrados
  const totalLitrosGrafica = produccion.reduce((acc, curr) => acc + Number(curr.litros), 0);
  const promedioDiario = produccion.length > 0 ? totalLitrosGrafica / produccion.length : 0;
  const bovinoObj = bovinos.find((b) => b.id === bovinoSeleccionado) || null;

  return (
    <div className="p-6 space-y-6  min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-black">Panel Principal</h1>
          <p className="text-xs text-gray-400">Resumen general de tu producción y ganado hoy</p>
        </div>
      </div>

      {/* Tarjetas superiores usando el total histórico global en la primera tarjeta */}
      <TarjetasMetricas 
        totalLitrosHoy={totalHistorico} 
        promedioDiario={promedioDiario} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ContenedorGraficaPrincipal 
            data={produccion}
            bovinos={bovinos}
            bovinoSeleccionado={bovinoSeleccionado}
            setBovinoSeleccionado={setBovinoSeleccionado}
            totalLitros={totalLitrosGrafica}
            promedioDiario={promedioDiario}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SaludHato />
          <AlertasImportantes />
          <ActividadReciente actividad={actividad} />
        </div>
      </div>

    </div>
  );
}