'use client';

import React, { useState } from 'react';
import { Potrero } from '@/modules/potreros/types/potrero.types';
import { registrarAbono } from '@/modules/potreros/actions/potreros.actions';

interface FormAbonoProps {
  potrero: Potrero;
  onSuccess: () => void;
}

export const FormAbono: React.FC<FormAbonoProps> = ({ potrero, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
  const [tipoAbono, setTipoAbono] = useState('Orgánico');
  const [unidades, setUnidades] = useState<number>(1);
  const [unidadMedida, setUnidadMedida] = useState('Bultos (50kg)');
  const [responsable, setResponsable] = useState('');
  const [detalleExtra, setDetalleExtra] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await registrarAbono({
        potreroId: potrero.id,
        unidades,
        unidadMedida,
        tipoAbono,
        fecha,
        responsable,
        detalleExtra,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el abono.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-2 text-xs bg-red-100 text-red-700 border border-red-300 rounded">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Fecha y Hora
        </label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="w-full text-xs p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tipo de Fertilizante
          </label>
          <select
            value={tipoAbono}
            onChange={(e) => setTipoAbono(e.target.value)}
            className="w-full text-xs p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          >
            <option value="Orgánico">Orgánico</option>
            <option value="Químico (Urea)">Químico (Urea)</option>
            <option value="Químico (NPK)">Químico (NPK)</option>
            <option value="Compost">Compost</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Unidad Medida
          </label>
          <select
            value={unidadMedida}
            onChange={(e) => setUnidadMedida(e.target.value)}
            className="w-full text-xs p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          >
            <option value="Bultos (50kg)">Bultos (50kg)</option>
            <option value="Kilogramos (Kg)">Kilogramos (Kg)</option>
            <option value="Litros (L)">Litros (L)</option>
            <option value="Toneladas (T)">Toneladas (T)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            min={0.1}
            step="0.1"
            value={unidades}
            onChange={(e) => setUnidades(parseFloat(e.target.value) || 0)}
            required
            className="w-full text-xs p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Responsable
          </label>
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            className="w-full text-xs p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Observaciones
        </label>
        <textarea
          rows={2}
          placeholder="Notas adicionales..."
          value={detalleExtra}
          onChange={(e) => setDetalleExtra(e.target.value)}
          className="w-full text-xs p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Registrar Aplicación de Abono'}
      </button>
    </form>
  );
};