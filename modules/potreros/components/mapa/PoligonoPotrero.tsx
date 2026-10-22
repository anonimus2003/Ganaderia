'use client';

import React from 'react';
import { Potrero } from '../../types/potrero.types';
import { EventoBitacora } from '@/modules/potreros/types/potrero.types';
import { obtenerPuntosValidos, calcularCentroide } from '../../services/parser-puntos';
import { obtenerColorPotrero } from '../../services/calculos-potrero';

interface PoligonoPotreroProps {
  potrero: Potrero;
  eventos: EventoBitacora[];
  isSelected: boolean;
  onSelect: (potrero: Potrero) => void;
}

export const PoligonoPotrero: React.FC<PoligonoPotreroProps> = ({
  potrero,
  eventos,
  isSelected,
  onSelect,
}) => {
  const puntosRaw = potrero.puntos || potrero.coordenadas;
  const puntos = obtenerPuntosValidos(puntosRaw);

  if (!puntos) return null;

  const pointsString = puntos.map((p) => `${p.x},${p.y}`).join(' ');
  const centroide = calcularCentroide(puntos);
  const colorFill = obtenerColorPotrero(potrero.id, eventos, potrero.estado);

  return (
    <g
      onClick={() => onSelect(potrero)}
      className="cursor-pointer group transition-transform duration-200"
    >
      {/* Polígono SVG trazado */}
      <polygon
        points={pointsString}
        fill={colorFill}
        stroke={isSelected ? '#D1F843' : '#ffffff'}
        strokeWidth={isSelected ? '3.5' : '1.5'}
        strokeDasharray={isSelected ? 'none' : '4 2'}
        className="transition-all duration-300 opacity-85 hover:opacity-100 hover:stroke-white hover:stroke-[2.5px]"
      />

      {/* Etiqueta del nombre sobre el centroide */}
      <g transform={`translate(${centroide.x}, ${centroide.y})`}>
        
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize="15"
          fontWeight="700"
          className="pointer-events-none tracking-wide"
        >
          {potrero.nombre}
        </text>
      </g>
    </g>
  );
};