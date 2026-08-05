'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, User } from 'lucide-react';

interface EventoAgenda {
  id: string;
  fecha: string;
  titulo: string;
  subtitulo: string;
  tipo: 'chequeo' | 'parto';
  bovinoInfo: string;
  tecnico?: string;
  estado?: string;
}

interface InseminacionCalendarProps {
  eventos: EventoAgenda[];
  isOpen: boolean;
  onClose: () => void;
  formatDate: (dateStr: string | null) => string; // <-- Asegurar que esté aquí
}

export function InseminacionCalendarModal({
  eventos,
  isOpen,
  onClose,
  formatDate, // <-- Asegurar que se reciba aquí
}: InseminacionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; eventos: EventoAgenda[] } | null>(null);

  if (!isOpen) return null;

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDayEvents(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDayEvents(null);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const eventosPorFecha: { [key: string]: EventoAgenda[] } = {};
  eventos.forEach(evt => {
    if (!evt.fecha) return;
    const fechaKey = evt.fecha.split('T')[0];
    if (!eventosPorFecha[fechaKey]) eventosPorFecha[fechaKey] = [];
    eventosPorFecha[fechaKey].push(evt);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 p-5 space-y-4">
        
        {/* Cabecera compacta */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">
            {monthNames[month]} {year}
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-xl border border-slate-100">
              <button onClick={prevMonth} className="p-1.5 rounded-lg text-slate-700 hover:bg-white transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg text-slate-700 hover:bg-white transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition border border-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedDayEvents ? (
          /* VISTA DE DETALLE AL HACER CLIC EN UN DÍA */
          <div className="space-y-3 py-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl">
                Eventos del {formatDate(selectedDayEvents.date)}
              </span>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 underline"
              >
                Volver al calendario
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {selectedDayEvents.eventos.map((evt) => {
                const isParto = evt.tipo === 'parto';
                return (
                  <div
                    key={evt.id}
                    className={`p-3 rounded-2xl border space-y-1.5 ${
                      isParto ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">🐮 {evt.bovinoInfo}</span>
                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        isParto ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-950'
                      }`}>
                        {evt.tipo}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700">{evt.titulo} - {evt.subtitulo}</p>
                    {evt.tecnico && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> Técnico: {evt.tecnico}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* CUADRÍCULA NORMAL DEL CALENDARIO */
          <div className="space-y-1.5">
            <div className="grid grid-cols-7 gap-1 text-center">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-400 uppercase">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayIndex }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20 border border-transparent rounded-xl bg-slate-50/30" />
              ))}

              {Array.from({ length: totalDays }).map((_, index) => {
                const dayNum = index + 1;
                const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
                const dateString = `${year}-${formattedMonth}-${formattedDay}`;

                const diaEvts = eventosPorFecha[dateString] || [];
                const hasEvents = diaEvts.length > 0;

                return (
                  <div
                    key={dateString}
                    onClick={() => hasEvents && setSelectedDayEvents({ date: dateString, eventos: diaEvts })}
                    className={`h-20 rounded-xl border p-1 flex flex-col justify-between transition shadow-2xs ${
                      hasEvents 
                        ? 'bg-emerald-50/40 border-emerald-300 cursor-pointer hover:bg-emerald-100/60' 
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <span className={`text-[10px] font-bold w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${hasEvents ? 'bg-emerald-800 text-white' : 'text-slate-400'}`}>
                      {dayNum}
                    </span>

                    <div className="space-y-1 mt-0.5 overflow-hidden">
                      {diaEvts.map((evt) => {
                        const isParto = evt.tipo === 'parto';
                        return (
                          <div
                            key={evt.id}
                            className={`px-1 py-0.5 rounded text-[8px] font-bold truncate leading-tight ${
                              isParto 
                                ? 'bg-rose-100 text-rose-900 border border-rose-200' 
                                : 'bg-emerald-100 text-emerald-950 border border-emerald-200'
                            }`}
                          >
                            {evt.bovinoInfo}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}