import React from "react";

interface BovinoOption {
  id: string;
  arete: string;
  nombre: string | null;
}

interface SelectorAnimalProps {
  bovinos: BovinoOption[];
  value: string;
  onChange: (id: string) => void;
}

export default function SelectorAnimal({ bovinos, value, onChange }: SelectorAnimalProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs font-semibold text-gray-600">Seleccionar Bovino</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs text-gray-800 font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
      >
        <option value="">Todos los bovinos</option>
        {bovinos.map((b) => (
          <option key={b.id} value={b.id}>
            {b.arete} {b.nombre ? `- ${b.nombre}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}