'use client'

import type { Bovino } from '../types/dashboard'

interface SelectorAnimalProps {
  bovinos: Bovino[]
  value: string
  onChange: (value: string) => void
}

export default function SelectorAnimal({
  bovinos,
  value,
  onChange,
}: SelectorAnimalProps) {

  return (
    <div className="w-full md:w-auto">

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 md:min-w-[260px]"
      >

        <option value="">
          Todos los bovinos
        </option>

        {bovinos.map((bovino) => (

          <option
            key={bovino.id}
            value={bovino.id}
          >
            {bovino.arete || 'Sin arete'}
            {bovino.nombre
              ? ` - ${bovino.nombre}`
              : ''}
          </option>

        ))}

      </select>

    </div>
  )
}