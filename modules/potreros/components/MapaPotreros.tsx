'use client';

import React from 'react';
import { Potrero } from '../schemas';
import { EventoBitacora } from './BitacoraPotrero';

const IMAGEN_MAPA_FIJA = 'https://erkepwaugzippkgzzrzf.supabase.co/storage/v1/object/sign/imagenes/potreros.png?token=eyJraWQiOiJmN2JlOWRmYy0yNzUyLTRkYzgtODZiMy00MTVmOWQxMzg3MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5lcy9wb3RyZXJvcy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzQxNzc5LCJleHAiOjE4NTI4MTM3Nzl9.RysOq3TBp1ezxXtV4bUCTqlnjT8SNlV5NwsDkI8_oxM';

const MAX_WIDTH = 1100;
const MAX_HEIGHT = 1000;

const CURSOR_UBICACION = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='%23e11d48' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/><circle cx='12' cy='10' r='3' fill='%23ffffff'/></svg>") 14 28, pointer`;

interface MapaPotrerosProps {
  potreros: Potrero[];
  eventos?: EventoBitacora[];
  potreroSeleccionadoId?: string | number | null;
  onSelectPotrero?: (potrero: Potrero) => void;
  onDoubleClickPotrero?: (potrero: Potrero) => void;
  onGuardarPuntos?: (potreroId: string | number, nuevosPuntos: Array<{ x: number; y: number }>) => Promise<void> | void;
}

export default function MapaPotreros({ 
  potreros, 
  eventos = [], 
  potreroSeleccionadoId,
  onSelectPotrero, 
  onDoubleClickPotrero 
}: MapaPotrerosProps) {

  const getColorYEstadoPotrero = (potreroId: string | number, estadoBase: string) => {
    // Filtrar eventos de este potrero (ignorando abonos)
    const evs = eventos.filter(
      e => String(e.potrero_id) === String(potreroId) && e.tipo !== 'abono'
    );

    if (evs.length > 0) {
      // Ordenar de más reciente a más antiguo por fecha
      const ordenados = [...evs].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      const ultimoEvento = ordenados[0];

      // 🔴 Si el último evento fue un INGRESO -> OCUPADO
      if (ultimoEvento.tipo === 'ingreso') {
        return 'rgba(239, 68, 68, 0.75)'; // Rojo
      }

      // 🟢 Si el último evento fue una SALIDA -> DISPONIBLE
      if (ultimoEvento.tipo === 'salida') {
        return 'rgba(34, 197, 94, 0.75)'; // Verde
      }
    }

    // Fallback según estado de la base de datos
    const estadoNormalized = estadoBase?.toLowerCase() || '';
    if (estadoNormalized.includes('ocupado')) {
      return 'rgba(239, 68, 68, 0.75)'; // Rojo
    }

    return 'rgba(34, 197, 94, 0.75)'; // 🟢 Verde (Disponible)
  };

  const calcularCentroide = (puntos: Array<{ x: number; y: number }>) => {
    if (!puntos.length) return { x: 0, y: 0 };
    const suma = puntos.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return {
      x: suma.x / puntos.length,
      y: suma.y / puntos.length
    };
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200/85 bg-white shadow-md">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${IMAGEN_MAPA_FIJA})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox={`0 0 ${MAX_WIDTH} ${MAX_HEIGHT}`} 
            preserveAspectRatio="xMidYMid meet"
          >
            {potreros && potreros.map((potrero) => {
              const puntosRaw = typeof potrero.puntos === 'string' 
                ? JSON.parse(potrero.puntos) 
                : potrero.puntos;

              if (!puntosRaw || !Array.isArray(puntosRaw) || puntosRaw.length === 0) return null;

              const puntosString = puntosRaw.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
              const centro = calcularCentroide(puntosRaw);
              const colorFinal = getColorYEstadoPotrero(potrero.id, potrero.estado);
              const esSeleccionado = String(potreroSeleccionadoId) === String(potrero.id);

              return (
                <g 
                  key={potrero.id} 
                  style={{ cursor: CURSOR_UBICACION }}
                  onClick={() => onSelectPotrero && onSelectPotrero(potrero)}                
                  onDoubleClick={() => onDoubleClickPotrero && onDoubleClickPotrero(potrero)}  
                >
                  <polygon
                    points={puntosString}
                    fill={colorFinal} 
                    stroke={esSeleccionado ? '#f59e0b' : '#ffffff'}
                    strokeWidth={esSeleccionado ? '4' : '2.5'}
                    className="transition-all duration-200 hover:fill-opacity-90 hover:stroke-amber-300 hover:stroke-[3px]"
                  />
                  <text
                    x={centro.x}
                    y={centro.y}
                    fill="#ffffff"
                    fontSize="18"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] select-none pointer-events-none"
                  >
                    {potrero.nombre}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}