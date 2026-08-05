'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Bovino, Pesaje } from '../schemas';

interface PesajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pesajeAEditar?: Pesaje | null; // <-- Prop opcional para saber si estamos editando
}

export default function PesajeModal({ isOpen, onClose, onSuccess, pesajeAEditar }: PesajeModalProps) {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [bovinoId, setBovinoId] = useState('');
  const [peso, setPeso] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [condicion, setCondicion] = useState('3');
  const [estado, setEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // Cargar lista de bovinos y rellenar formulario si estamos editando
  useEffect(() => {
    if (isOpen) {
      const fetchBovinos = async () => {
        const { data, error } = await supabase.from('bovinos').select('id, arete, nombre');
        if (error) {
          console.error('Error al cargar bovinos:', error.message);
        } else if (data) {
          setBovinos(data);
        }
      };
      fetchBovinos();

      // Si nos pasan un pesaje para editar, cargamos sus datos en el estado
      if (pesajeAEditar) {
        setBovinoId(pesajeAEditar.bovino_id ? String(pesajeAEditar.bovino_id) : '');
        setPeso(pesajeAEditar.peso_kgs ? String(pesajeAEditar.peso_kgs) : '');
        setFecha(pesajeAEditar.fecha || new Date().toISOString().split('T')[0]);
        setCondicion(pesajeAEditar.condicion_corporal ? String(pesajeAEditar.condicion_corporal) : '3');
        setEstado(pesajeAEditar.estado_fisiologico || '');
        setObservaciones(pesajeAEditar.observaciones || '');
      } else {
        // Limpiar formulario si es un registro nuevo
        setBovinoId('');
        setPeso('');
        setFecha(new Date().toISOString().split('T')[0]);
        setCondicion('3');
        setEstado('');
        setObservaciones('');
      }
    }
  }, [isOpen, pesajeAEditar, supabase]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bovinoId || !peso) return;

    try {
      setSaving(true);

      const datosAguardar = {
        bovino_id: bovinoId,
        peso_kgs: parseFloat(peso),
        fecha,
        condicion_corporal: parseInt(condicion),
        estado_fisiologico: estado,
        observaciones
      };

      let error;

      if (pesajeAEditar && pesajeAEditar.id) {
        // Modo Actualización (UPDATE)
        const response = await supabase
          .from('pesajes')
          .update(datosAguardar)
          .eq('id', pesajeAEditar.id);
        error = response.error;
      } else {
        // Modo Creación (INSERT)
        const response = await supabase
          .from('pesajes')
          .insert([datosAguardar]);
        error = response.error;
      }

      if (error) throw error;

      onSuccess(); // Recarga la tabla principal
      onClose();   // Cierra el modal
    } catch (error: any) {
      console.error('Error al guardar pesaje:', error.message);
      alert('Hubo un error al guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">
            {pesajeAEditar ? 'Editar Registro de Pesaje' : 'Registrar Nuevo Pesaje'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Seleccionar Bovino</label>
            <select
              value={bovinoId}
              onChange={(e) => setBovinoId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="">Seleccione un animal...</option>
              {bovinos.map((b: any) => (
                <option key={b.id} value={b.id}>
                  Arete: {b.arete} {b.nombre ? `- ${b.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej. 450"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Condición Corporal (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={condicion}
                onChange={(e) => setCondicion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado Fisiológico</label>
              <input
                type="text"
                placeholder="Ej. Gestante, Lechón, etc."
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Observaciones</label>
            <textarea
              rows={3}
              placeholder="Notas adicionales sobre el pesaje..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : pesajeAEditar ? 'Actualizar Pesaje' : 'Guardar Pesaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}