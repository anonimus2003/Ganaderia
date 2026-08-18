'use client';

import React, { useEffect, useState } from 'react';
import { Sprout, Calendar, Plus, Minus, CheckCircle2, Clock3, Loader2, History } from 'lucide-react';
import { Potrero } from '../schemas';

interface RecuperacionPotreroProps {
  potrero: Potrero;
  onActualizar: (potreroId: number, progreso: number, fecha: string, observacion?: string) => Promise<void>;
}

export default function RecuperacionPotrero({ potrero, onActualizar }: RecuperacionPotreroProps) {
  const [progreso, setProgreso] = useState<number>(potrero.progreso_pasto ?? 0);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProgreso(potrero.progreso_pasto ?? 0);
  }, [potrero]);

  const cambiarProgreso = (cantidad: number) => {
    setProgreso((actual) => Math.min(100, Math.max(0, actual + cantidad)));
  };

  // AQUÍ CAMBIA: El potrero está disponible solo cuando llega al 100%
  const disponible = progreso === 100;

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha) {
      alert('Selecciona una fecha.');
      return;
    }
    setLoading(true);
    try {
      await onActualizar(potrero.id, progreso, fecha, observacion.trim() || undefined);
      setObservacion('');
    } catch (error) {
      console.error('Error al registrar recuperación:', error);
      alert('No se pudo registrar la recuperación del potrero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <Sprout size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">Recuperación del Potrero</h3>
            <p className="text-[11px] text-slate-500">{potrero.nombre}</p>
          </div>
        </div>

        {/* ESTADO */}
        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black ${disponible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {disponible ? 'DISPONIBLE' : 'EN RECUPERACIÓN'}
        </div>
      </div>

      {/* PROGRESO */}
      <div className="mb-5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Crecimiento del pasto</p>
            <p className="text-3xl font-black text-slate-800">{progreso}%</p>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            Meta de disponibilidad <strong className="block text-emerald-700">100%</strong>
          </div>
        </div>

        {/* BARRA */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${disponible ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* MENSAJE */}
      <div className={`flex gap-2 p-3 rounded-xl mb-5 ${disponible ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
        {disponible ? <CheckCircle2 size={17} className="text-emerald-600 shrink-0" /> : <Clock3 size={17} className="text-amber-600 shrink-0" />}
        <div>
          <p className={`text-xs font-bold ${disponible ? 'text-emerald-800' : 'text-amber-800'}`}>
            {disponible ? 'El potrero está disponible' : 'El potrero continúa en recuperación'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {disponible ? 'Al guardar cambiará a estado disponible.' : `Faltan ${Math.max(0, 100 - progreso)}% para alcanzar el 100%.`}
          </p>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="space-y-4">
        {/* CONTROL DEL PORCENTAJE */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Ajustar crecimiento</label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => cambiarProgreso(-5)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
              <Minus size={16} />
            </button>
            <input
              type="number"
              min="0"
              max="100"
              value={progreso}
              onChange={(e) => setProgreso(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="flex-1 text-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button type="button" onClick={() => cambiarProgreso(5)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* FECHA */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            <Calendar size={14} className="inline mr-1 text-emerald-600" /> Fecha de evaluación
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* OBSERVACIÓN */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Observación</label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
            placeholder="Ej. Buena recuperación, humedad adecuada..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* GUARDAR */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Registrando...</> : <><Sprout size={15} /> Registrar recuperación</>}
        </button>
      </form>

      {/* HISTORIAL */}
      <button type="button" className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all">
        <History size={14} /> Ver historial de recuperación
      </button>
    </div>
  );
}