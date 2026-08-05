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
    <div className="flex items-center bg-[#141a18] border border-gray-800 p-1 rounded-xl">
      {opciones.map((op) => (
        <button
          key={op.id}
          onClick={() => onChange(op.id)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            value === op.id
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}