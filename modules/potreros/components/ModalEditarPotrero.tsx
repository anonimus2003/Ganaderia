import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Potrero } from '../schemas';

interface ModalEditarPotreroProps {
  isOpen: boolean;
  potrero: Potrero;
  onClose: () => void;
  onSave: (datosActualizados: {
    nombre: string;
    area: number;
    pasto: string;
    aforo: number;
    bovinos: number;
    fechaEntrada: string;
    fechaSalida: string;
  }) => void;
}

export default function ModalEditarPotrero({
  isOpen,
  potrero,
  onClose,
  onSave,
}: ModalEditarPotreroProps) {
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState(0);
  const [bovinos, setBovinos] = useState(0);
  const [pasto, setPasto] = useState('');
  const [aforo, setAforo] = useState(0);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');

  useEffect(() => {
    if (potrero) {
      setNombre(potrero.nombre || '');
      setArea(potrero.areaM2 || 0);
      setBovinos(potrero.bovinosActuales || 0);
      setPasto(potrero.tipoPasto || '');
      setAforo(potrero.aforo || 0);
      setFechaEntrada(potrero.fechaEntradaGanado || '');
      setFechaSalida(potrero.fechaSalidaGanado || '');
    }
  }, [potrero]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nombre, area, pasto, aforo, bovinos, fechaEntrada, fechaSalida });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm">Gestionar Fechas y Datos: {nombre}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Área (m²):</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aforo (kg/m²):</label>
              <input
                type="number"
                step="0.1"
                value={aforo}
                onChange={(e) => setAforo(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Pasto:</label>
            <input
              type="text"
              value={pasto}
              onChange={(e) => setPasto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bovinos Actuales (0 = En Descanso):</label>
            <input
              type="number"
              value={bovinos}
              onChange={(e) => setBovinos(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Entrada:</label>
              <input
                type="date"
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Salida:</label>
              <input
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

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
              className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl font-semibold shadow-sm transition"
            >
              Actualizar Datos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}