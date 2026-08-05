import React, { useState } from 'react';
import { X, MousePointerClick } from 'lucide-react';

interface ModalNuevoPotreroProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevoPotrero: { nombre: string; area: number; pasto: string; aforo: number }) => void;
  onActivarSeleccionMapa: () => void;
}

export default function ModalNuevoPotrero({
  isOpen,
  onClose,
  onSave,
  onActivarSeleccionMapa,
}: ModalNuevoPotreroProps) {
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState(3500);
  const [pasto, setPasto] = useState('Brachiaria');
  const [aforo, setAforo] = useState(0.5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nombre, area, pasto, aforo });
    setNombre('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm">Nuevo Potrero</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre:</label>
            <input
              type="text"
              placeholder="Ej. Potrero Norte"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Área (m²):</label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Pasto:</label>
            <input
              type="text"
              value={pasto}
              onChange={(e) => setPasto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Aforo (kg/m²):</label>
            <input
              type="number"
              step="0.1"
              value={aforo}
              onChange={(e) => setAforo(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={onActivarSeleccionMapa}
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 py-2 rounded-xl font-semibold transition flex items-center justify-center space-x-2"
          >
            <MousePointerClick className="w-4 h-4" />
            <span>Elegir ubicación exacta en el mapa</span>
          </button>

          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl font-semibold shadow-sm transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}