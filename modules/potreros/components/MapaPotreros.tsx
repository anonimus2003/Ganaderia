import React, { useState } from 'react';
import { Potrero } from '../schemas';

interface MapaPotrerosProps {
  potreros: Potrero[];
  selectedId: number | null;
  onSelectPotrero: (id: number) => void;
  creandoDesdeMapa: boolean;
  onCrearDesdeMapa: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function MapaPotreros({
  potreros,
  selectedId,
  onSelectPotrero,
  creandoDesdeMapa,
  onCrearDesdeMapa,
}: MapaPotrerosProps) {

  const [filtro, setFiltro] = useState<string | null>(null);

  const opcionesLeyenda = [
    {
      label: 'Disponible',
      estado: 'disponible',
      color: 'bg-emerald-600',
    },
    {
      label: 'Ocupado',
      estado: 'ocupado',
      color: 'bg-rose-600',
    },
    {
      label: 'En Descanso',
      estado: 'en descanso',
      color: 'bg-amber-500',
    },
  ];

  const potrerosFiltrados = filtro
    ? potreros.filter(
        p => p.estado?.toLowerCase().trim() === filtro
      )
    : potreros;

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col relative w-full overflow-hidden">

      {/* FILTROS */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">

        {/* TODOS */}
        <button
          onClick={() => setFiltro(null)}
          className={`
            px-3 py-1 rounded-full
            text-[10px] font-bold
            transition-all border
            ${
              !filtro
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }
          `}
        >
          TODOS
        </button>

        {/* ESTADOS */}
        {opcionesLeyenda.map((item) => (
          <button
            key={item.estado}
            onClick={() => setFiltro(item.estado)}
            className={`
              flex items-center gap-2
              px-3 py-1 rounded-full
              text-[10px] font-bold
              transition-all border
              ${item.color}
              text-white
              ${
                filtro === item.estado
                  ? 'ring-2 ring-offset-1 ring-slate-400'
                  : 'opacity-80 hover:opacity-100'
              }
            `}
          >
            <div className="w-2 h-2 rounded-full bg-white" />

            {item.label}
          </button>
        ))}
      </div>

      {/* MAPA */}
      <div className="relative w-full flex items-center justify-center">

        <div
          onClick={onCrearDesdeMapa}
          className={`
            relative
            w-auto
            h-auto
            max-h-[60vh]
            flex
            items-center
            justify-center
            ${
              creandoDesdeMapa
                ? 'cursor-crosshair'
                : 'cursor-default'
            }
          `}
        >

          <img
            src="https://erkepwaugzippkgzzrzf.supabase.co/storage/v1/object/sign/imagenes/potreros.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mN2JlOWRmYy0yNzUyLTRkYzgtODZiMy00MTVmOWQxMzg3MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5lcy9wb3RyZXJvcy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1NTMyMzUxLCJleHAiOjE4NDg2MDQzNTF9.DUdPhx3BKxDxN3ZCsLpgkGBkyhOazizei97UU_vn8nM"
            alt="Plano Parcelaria"
            className="
              max-h-[60vh]
              w-auto
              object-contain
              rounded-2xl
              shadow-inner
              select-none
              pointer-events-none
            "
          />

          {/* POTREROS */}
          {potrerosFiltrados.map((p) => {

            const isSelected = p.id === selectedId;

            const estado = p.estado
              ?.toLowerCase()
              .trim();

            const colorClass =
              estado === 'ocupado'
                ? 'bg-rose-600'
                : estado === 'en descanso'
                  ? 'bg-amber-500'
                  : estado === 'disponible'
                    ? 'bg-emerald-600'
                    : 'bg-slate-500';

            return (
              <button
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPotrero(p.id);
                }}
                style={{
                  top: `${p.y}%`,
                  left: `${p.x}%`,
                }}
                className={`
                  absolute
                  -translate-x-1/2
                  -translate-y-1/2
                  w-7
                  h-7
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-[9px]
                  font-black
                  text-white
                  transition-all
                  shadow-lg
                  border-2
                  border-white/30

                  ${colorClass}

                  ${
                    isSelected
                      ? 'ring-4 ring-amber-400 scale-125 z-30'
                      : 'hover:scale-110 z-20'
                  }
                `}
              >
                {p.nombre}
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
}