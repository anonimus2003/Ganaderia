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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Seleccionar Bovino</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md p-2 bg-white text-gray-800"
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