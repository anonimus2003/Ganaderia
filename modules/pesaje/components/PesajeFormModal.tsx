'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bovino, Pesaje } from '../schemas';
import FormModal from '@/components/ui/FormModal';

interface PesajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => Promise<void> | void;
  pesajeAEditar?: Pesaje | null;
}

export default function PesajeFormModal({ isOpen, onClose, onSuccess, pesajeAEditar }: PesajeModalProps) {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [bovinoId, setBovinoId] = useState('');
  const [peso, setPeso] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [condicion, setCondicion] = useState('3');
  const [estado, setEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

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

      if (pesajeAEditar) {
        setBovinoId(pesajeAEditar.bovino_id ? String(pesajeAEditar.bovino_id) : '');
        setPeso(pesajeAEditar.peso_kgs ? String(pesajeAEditar.peso_kgs) : '');
        setFecha(pesajeAEditar.fecha || new Date().toISOString().split('T')[0]);
        setCondicion(pesajeAEditar.condicion_corporal ? String(pesajeAEditar.condicion_corporal) : '3');
        setEstado(pesajeAEditar.estado_fisiologico || '');
        setObservaciones(pesajeAEditar.observaciones || '');
      } else {
        setBovinoId('');
        setPeso('');
        setFecha(new Date().toISOString().split('T')[0]);
        setCondicion('3');
        setEstado('');
        setObservaciones('');
      }
    }
  }, [isOpen, pesajeAEditar, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bovinoId || !peso) {
      alert('Por favor selecciona un bovino e ingresa el peso.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...(pesajeAEditar?.id ? { id: pesajeAEditar.id } : {}),
        bovino_id: bovinoId,
        peso_kgs: parseFloat(peso),
        fecha,
        condicion_corporal: condicion ? parseFloat(condicion) : null,
        estado_fisiologico: estado || null,
        observaciones: observaciones || null
      };

      console.log("Enviando payload al hook:", payload);

      await onSuccess(payload); 
      onClose(); 
    } catch (error: any) {
      console.error('Error atrapado en el modal al guardar:', error);
      alert('Hubo un error al guardar el registro. Revisa la consola.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={pesajeAEditar ? 'Editar Registro de Pesaje' : 'Registrar Nuevo Pesaje'}
      onSubmit={handleSubmit}
      isSubmitting={saving}
      submitText={pesajeAEditar ? 'Actualizar Pesaje' : 'Guardar Pesaje'}
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Seleccionar Bovino</label>
          <select
            value={bovinoId}
            onChange={(e) => setBovinoId(e.target.value)}
            required
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Seleccione un animal...</option>
            {bovinos.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.arete} {b.nombre ? `- ${b.nombre}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Peso (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 450"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Condición Corporal (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.01"
              inputMode="decimal"
              value={condicion}
              onChange={(e) => setCondicion(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estado Fisiológico</label>
            <input
              type="text"
              placeholder="Ej. Gestante, Vacía, etc."
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Observaciones</label>
          <textarea
            rows={3}
            placeholder="Notas adicionales sobre el pesaje..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </FormModal>
  );
}