"use client";

import React from "react";
import { useDashboard } from "./hooks/useDashboard";
import EncabezadoDashboard from "./componentes/EncabezadoDashboard";
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
    usuarioNombre, // <--- Si tu hook ya lo tiene o lo agregamos allá, lo usas directo aquí
  } = useDashboard() as any; // (Si TypeScript te reclama la propiedad, este cast temporal evita el rojo)

  if (loading && bovinos.length === 0) {
    return <p className="p-6 text-gray-700">Cargando panel principal...</p>;
  }

  if (error) {
    return <p className="p-6 text-rose-600">Error al cargar los datos: {error}</p>;
  }

  // Cálculos para la gráfica y promedios basados en los registros filtrados
  const totalLitrosGrafica = produccion.reduce((acc: number, curr: any) => acc + Number(curr.litros || 0), 0);
  const promedioDiario = produccion.length > 0 ? totalLitrosGrafica / produccion.length : 0;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      
      {/* El encabezado recibe el nombre de forma automática desde el hook */}
      <EncabezadoDashboard 
        nombreUsuario={usuarioNombre || "Ganadero"} 
      />

      {/* Tarjetas superiores */}
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