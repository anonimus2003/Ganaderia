"use client";

import React, { useState, useMemo } from "react";
import SelectorAnimal from "../SelectorAnimal";
import FiltroPeriodo, { PeriodoAgrupacion } from "./FiltroPeriodo";
import GraficaProduccion from "./GraficaProduccion";
import ResumenInferiorGrafica from "./ResumenInferiorGrafica";

interface Props {
  data: any[];
  bovinos: any[];
  bovinoSeleccionado: string;
  setBovinoSeleccionado: (id: string) => void;
  totalLitros: number;
  promedioDiario: number;
}

export default function ContenedorGraficaPrincipal({
  data,
  bovinos,
  bovinoSeleccionado,
  setBovinoSeleccionado,
  totalLitros,
  promedioDiario,
}: Props) {
  const [periodo, setPeriodo] = useState<PeriodoAgrupacion>("dias");

  // Lógica para transformar y agrupar los datos según el periodo (Días, Meses, Años)
  const datosAgrupados = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (periodo === "meses") {
      const agrupado: { [key: string]: number } = {};
      data.forEach((item) => {
        if (!item.fecha) return;
        const mes = item.fecha.slice(0, 7); // Extrae "YYYY-MM"
        agrupado[mes] = (agrupado[mes] || 0) + Number(item.litros || 0);
      });
      return Object.keys(agrupado)
        .sort()
        .map((fecha) => ({ fecha, litros: agrupado[fecha] }));
    }

    if (periodo === "anios") {
      const agrupado: { [key: string]: number } = {};
      data.forEach((item) => {
        if (!item.fecha) return;
        const anio = item.fecha.slice(0, 4); // Extrae "YYYY"
        agrupado[anio] = (agrupado[anio] || 0) + Number(item.litros || 0);
      });
      return Object.keys(agrupado)
        .sort()
        .map((fecha) => ({ fecha, litros: agrupado[fecha] }));
    }

    // Por defecto devuelve los datos diarios originales
    return data;
  }, [data, periodo]);

  return (
    <div className="border border-gray-800 bg-[#0d1110] p-6 rounded-2xl space-y-6 shadow-sm">
      {/* Cabecera de la sección */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Producción de Leche
          </h3>
          <p className="text-xs text-gray-400">
            Litros producidos por {periodo === "dias" ? "día" : periodo === "meses" ? "mes" : "año"}
          </p>
        </div>

        {/* Controles superiores: Selector de Periodo y Selector de Animal */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <FiltroPeriodo value={periodo} onChange={setPeriodo} />
          <SelectorAnimal 
            bovinos={bovinos} 
            value={bovinoSeleccionado} 
            onChange={setBovinoSeleccionado} 
          />
        </div>
      </div>

      {/* Gráfica principal con los datos agrupados */}
      <GraficaProduccion data={datosAgrupados} />

      {/* Métricas inferiores de la gráfica */}
      <ResumenInferiorGrafica 
        totalLitros={totalLitros} 
        promedioDiario={promedioDiario} 
      />
    </div>
  );
}