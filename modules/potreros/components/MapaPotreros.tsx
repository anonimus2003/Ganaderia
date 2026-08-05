import React from 'react';
import { Potrero } from '../schemas';

interface MapaPotrerosProps {
  potreros: Potrero[];
  selectedId: number;
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
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center overflow-auto relative">
      <div
        onClick={onCrearDesdeMapa}
        className={`relative inline-block max-h-[70vh] ${creandoDesdeMapa ? 'cursor-crosshair' : 'cursor-default'}`}
      >
        <img
          src="https://erkepwaugzippkgzzrzf.supabase.co/storage/v1/object/sign/imagenes/potreros.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mN2JlOWRmYy0yNzUyLTRkYzgtODZiMy00MTVmOWQxMzg3MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5lcy9wb3RyZXJvcy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1NTMyMzUxLCJleHAiOjE4NDg2MDQzNTF9.DUdPhx3BKxDxN3ZCsLpgkGBkyhOazizei97UU_vn8nM"
          alt="Plano Parcelaria"
          className="max-h-[70vh] w-auto object-contain rounded-lg shadow-inner select-none block pointer-events-none"
        />
        {potreros.map((p) => {
          const isSelected = p.id === selectedId;
          const isOcupado = p.estado?.toLowerCase() === 'ocupado';
          return (
            <button
              key={p.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPotrero(p.id);
              }}
              style={{ top: `${p.y}%`, left: `${p.x}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold transition-all transform shadow-md border overflow-hidden px-0.5 ${
                isOcupado ? 'bg-rose-600/90 border-rose-200 text-white hover:bg-rose-700' : 'bg-emerald-600/90 border-emerald-200 text-white hover:bg-emerald-700'
              } ${isSelected ? 'ring-4 ring-amber-400 scale-125 z-30' : 'hover:scale-110 z-20'}`}
              title={`${p.nombre} - ${p.estado}`}
            >
              <span className="truncate w-full text-center leading-none">{p.nombre}</span>
            </button>
          );
        })}
      </div>
      <span className="absolute bottom-2 left-4 text-[11px] text-slate-500 bg-white/90 px-3 py-1 rounded-lg border border-slate-200 shadow-sm backdrop-blur">
        {creandoDesdeMapa ? '⚡ Haz clic en el mapa para ubicar el nuevo potrero' : 'Haz clic en cualquier marcador para gestionarlo'}
      </span>
    </div>
  );
}