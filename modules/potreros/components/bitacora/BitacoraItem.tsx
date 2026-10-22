'use client';

import React from 'react';
import { EventoBitacora } from '@/modules/potreros/types/bitacora.types';


interface BitacoraItemProps {
  evento: EventoBitacora;
}

export const BitacoraItem: React.FC<BitacoraItemProps> = ({ evento }) => {
  const esOcupacion = evento.tipo === 'OCUPACION';
  const esAbono = evento.tipo === 'ABONO';

  // Configuración de íconos y colores según el tipo de evento
  const badgeColor = esOcupacion
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : esAbono
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  const icono = esOcupacion ? '🐄' : esAbono ? '🌱' : '📋';

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-all">
      <div className="text-xl flex-shrink-0 pt-0.5">{icono}</div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {evento.tipo}
          </span>
          <span className="text-[11px] text-slate-400">
            {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-CO') : 'Sin fecha'}
          </span>
        </div>

        <p className="text-xs font-medium text-slate-200 truncate">
          {evento.descripcion || evento.observaciones || `${evento.tipo} registrado`}
        </p>

        {/* Detalles específicos del evento */}
        {esOcupacion && (evento.cantidad_bovinos || (evento as any).bovinos) && (
          <p className="text-[11px] text-slate-400">
            Bovinos: <span className="text-amber-300 font-semibold">{evento.cantidad_bovinos || (evento as any).bovinos}</span> cabezas
          </p>
        )}

        {esAbono && ((evento as any).producto || (evento as any).tipo_abono) && (
          <p className="text-[11px] text-slate-400">
            Producto: <span className="text-emerald-300 font-semibold">{(evento as any).producto || (evento as any).tipo_abono}</span>
          </p>
        )}
      </div>
    </div>
  );
};