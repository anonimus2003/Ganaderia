'use data';
'use client';

import React, { useState } from 'react';
import { Calendar, PackagePlus, Loader2, Sprout, Layers, Scale } from 'lucide-react';

interface ControlAbonoProps {
  potreroId: number;
  onRegistrarAbono: (potreroId: number, insumo: string, cantidadConUnidad: string, fecha: string) => Promise<void>;
}

export default function ControlAbono({ potreroId, onRegistrarAbono }: ControlAbonoProps) {
  const [insumo, setInsumo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('Bultos');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumo.trim() || !cantidad.trim()) return;

    setLoading(true);
    try {
      // Unimos la cantidad y la unidad para guardarlas de forma clara (Ej: "5 Bultos" o "150 Litros")
      const cantidadTotal = `${cantidad} ${unidad}`;
      await onRegistrarAbono(potreroId, insumo.trim(), cantidadTotal, fecha);
      
      // Limpiar campos principales
      setInsumo('');
      setCantidad('');
      setUnidad('Bultos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm transition-all">
      {/* Cabecera de la tarjeta */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl text-white bg-amber-600 shadow-sm shadow-amber-600/20">
            <Sprout size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
              Aplicación de Abono o Fertilizante
            </h4>
            <p className="text-[11px] text-slate-500">
              Registra los insumos aplicados y su respectiva unidad de medida
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Insumo / Fertilizante */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <PackagePlus size={14} className="text-amber-600" /> Insumo / Fertilizante:
          </label>
          <input 
            type="text" 
            placeholder="Ej. Urea, Abono Orgánico, NPK..." 
            value={insumo} 
            onChange={(e) => setInsumo(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all" 
            required 
          />
        </div>

        {/* Grid para Cantidad y Unidad */}
        <div className="grid grid-cols-2 gap-3">
          {/* Cantidad numérica */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Scale size={14} className="text-amber-600" /> Cantidad:
            </label>
            <input 
              type="number" 
              step="any"
              placeholder="Ej. 5 o 50" 
              value={cantidad} 
              onChange={(e) => setCantidad(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all" 
              required 
            />
          </div>

          {/* Selector de Unidad */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers size={14} className="text-amber-600" /> Unidad:
            </label>
            <select
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all cursor-pointer"
            >
              <option value="Bultos">Bultos</option>
              <option value="Kilogramos (kg)">Kilogramos (kg)</option>
              <option value="Litros (L)">Litros (L)</option>
              <option value="Mililitros (ml)">Mililitros (ml)</option>
              <option value="Metros Cúbicos (m³)">Metros Cúbicos (m³)</option>
              <option value="Toneladas">Toneladas</option>
              <option value="Sacos">Sacos</option>
            </select>
          </div>
        </div>

        {/* Fecha de Aplicación */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar size={14} className="text-amber-600" /> Fecha de Aplicación:
          </label>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all" 
            required
          />
        </div>

        {/* Botón de envío */}
        <button 
          type="submit" 
          disabled={loading} 
          className={`w-full py-3 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Registrando abono...
            </>
          ) : (
            'Registrar Aplicación de Abono'
          )}
        </button>
      </form>
    </div>
  );
}