"use client";

import React from "react";

export type PeriodoAgrupacion = "dias" | "meses" | "anios";

interface Props {
  value: PeriodoAgrupacion;
  onChange: (periodo: PeriodoAgrupacion) => void;
}

export default function FiltroPeriodo({ value, onChange }: Props) {
  const opciones: { id: PeriodoAgrupacion; label: string }[] = [
    { id: "dias", label: "Días" },
    { id: "meses", label: "Meses" },
    { id: "anios", label: "Años" },
  ];

  return (
    <div className="flex items-center bg-gray-100/80 border border-gray-200/80 p-1 rounded-xl">
      {opciones.map((op) => (
        <button
          key={op.id}
          onClick={() => onChange(op.id)}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            value === op.id
              ? "bg-white text-gray-900 shadow-xs border border-gray-200/50"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}