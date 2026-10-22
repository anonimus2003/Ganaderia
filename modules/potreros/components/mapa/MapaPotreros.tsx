'use client';

import React from 'react';
import { Potrero } from '../../types/potrero.types';
import { EventoBitacora } from '@/modules/potreros/types/potrero.types';
import { PoligonoPotrero } from './PoligonoPotrero';

interface MapaPotrerosProps {
  potreros: Potrero[];
  eventos: EventoBitacora[];
  potreroSeleccionadoId?: string | number | null;
  onSelectPotrero: (potrero: Potrero) => void;
}

export const MapaPotreros: React.FC<MapaPotrerosProps> = ({
  potreros = [],
  eventos = [],
  potreroSeleccionadoId,
  onSelectPotrero,
}) => {
  const MAP_IMAGE_URL =
    "https://erkepwaugzippkgzzrzf.supabase.co/storage/v1/object/sign/imagenes/potreros.png?token=eyJraWQiOiJmN2JlOWRmYy0yNzUyLTRkYzgtODZiMy00MTVmOWQxMzg3MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5lcy9wb3RyZXJvcy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkxNzI3Nzk4LCJleHAiOjE4MjMyNjM3OTh9.8hHSIh-sK6ePIaB7K0GEkSiED_yaYCAXi0dN1c4AVls";

  return (
    // Sin bordes, sin padding extra, fusionado directamente con el espacio del módulo
    <div className="w-full h-full min-h-[500px] relative flex flex-col">
      
      {/* Lienzo SVG principal ocupando todo el espacio limpio */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full min-h-[480px] select-none bg-white"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(0, 0, 0, 0.04)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* 1. Fondo base blanco */}
          <rect width="1000" height="700" fill="#FFFFFF" />

          {/* 2. Imagen PNG de fondo proporciones reales */}
          <image
            href={MAP_IMAGE_URL}
            xlinkHref={MAP_IMAGE_URL}
            x="0"
            y="0"
            width="1000"
            height="700"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* 3. Cuadrícula de mapa sutil */}
          <rect width="1000" height="700" fill="url(#grid-pattern)" />

          {/* 4. Renderizado de Polígonos interactivos */}
          {potreros.map((potrero) => (
            <PoligonoPotrero
              key={potrero.id}
              potrero={potrero}
              eventos={eventos}
              isSelected={String(potrero.id) === String(potreroSeleccionadoId)}
              onSelect={onSelectPotrero}
            />
          ))}
        </svg>

      </div>

    </div>
  );
};