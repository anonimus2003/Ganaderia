// modules/reproduccion/components/ReproduccionFormModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Reproduccion } from '../schemas';
import FormModal from '@/components/ui/FormModal';
import { toast } from "sonner";
import { sumarDiasAFecha } from '../utils/dateUtils';
import { reproduccionFormFields } from '../utils/reproduccionFormConfig';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ReproduccionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => Promise<void> | void;
  reproduccionAEditar?: Reproduccion | null;
}

const initialState = {
  bovinoId: '',
  toroPajilla: '',
  razaToro: '',
  numeroServicios: '1',
  tipo: 'I.Artificial',
  fechaInseminacion: '',
  fechaChequeo: '',
  fechaProbableParto: '',
  tecnico: '',
  estado: 'Pendiente',
  fechaParto: '',
  fechaSecado: '',
  observaciones: ''
};

export default function ReproduccionFormModal({ isOpen, onClose, onSuccess, reproduccionAEditar }: ReproduccionFormModalProps) {
  const [bovinos, setBovinos] = useState<any[]>([]);
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (isOpen) {
      supabase.from('bovinos').select('id, arete, nombre').then(({ data }) => {
        if (data) setBovinos(data);
      });

      const hoy = new Date().toISOString().split('T')[0];
      if (reproduccionAEditar) {
        setForm({
          bovinoId: reproduccionAEditar.bovino_id ? String(reproduccionAEditar.bovino_id) : '',
          toroPajilla: reproduccionAEditar.toro_pajilla || '',
          razaToro: reproduccionAEditar.raza_toro || '',
          numeroServicios: reproduccionAEditar.numero_servicios !== undefined && reproduccionAEditar.numero_servicios !== null ? String(reproduccionAEditar.numero_servicios) : '1',
          tipo: reproduccionAEditar.tipo || 'I.Artificial',
          fechaInseminacion: reproduccionAEditar.fecha_inseminacion || hoy,
          fechaChequeo: reproduccionAEditar.fecha_chequeo || '',
          fechaProbableParto: reproduccionAEditar.fecha_probable_parto || '',
          tecnico: reproduccionAEditar.tecnico || '',
          estado: reproduccionAEditar.estado || 'Pendiente',
          fechaParto: reproduccionAEditar.fecha_parto || '',
          fechaSecado: reproduccionAEditar.fecha_secado || '',
          observaciones: reproduccionAEditar.observaciones || ''
        });
      } else {
        setForm({
          ...initialState,
          fechaInseminacion: hoy,
          fechaChequeo: sumarDiasAFecha(hoy, 60),
          fechaProbableParto: sumarDiasAFecha(hoy, 283)
        });
      }
    }
  }, [isOpen, reproduccionAEditar, supabase]);

  const handleChange = (field: string, value: string | null) => {
    const safeValue = value ?? '';
    setForm(prev => {
      const updated = { ...prev, [field]: safeValue };
      if (field === 'fechaInseminacion' && !reproduccionAEditar) {
        updated.fechaChequeo = sumarDiasAFecha(safeValue, 60);
        updated.fechaProbableParto = sumarDiasAFecha(safeValue, 283);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bovinoId || !form.fechaInseminacion) {
      toast.error('Selecciona un bovino y la fecha de inseminación.');
      return;
    }

    try {
      setSaving(true);
      await onSuccess({
        ...(reproduccionAEditar?.id ? { id: reproduccionAEditar.id } : {}),
        bovino_id: form.bovinoId,
        toro_pajilla: form.toroPajilla || null,
        raza_toro: form.razaToro || null,
        numero_servicios: form.numeroServicios ? parseInt(form.numeroServicios) : 1,
        tipo: form.tipo || null,
        fecha_inseminacion: form.fechaInseminacion,
        fecha_chequeo: form.fechaChequeo || null,
        fecha_probable_parto: form.fechaProbableParto || null,
        tecnico: form.tecnico || null,
        estado: form.estado || 'Pendiente',
        fecha_parto: form.fechaParto || null,
        fecha_secado: form.fechaSecado || null,
        observaciones: form.observaciones || null
      });
      onClose();
    } catch {
      toast.error('Hubo un error al guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  // Estilo unificado para inputs de texto, números y fechas con la misma altura (h-12) y bordes limpios
  const inputClass = "w-full px-4 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] text-zinc-800 h-12 flex items-center justify-between";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  const bovinoActual = bovinos.find((b: any) => b.id === form.bovinoId);

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={reproduccionAEditar ? 'Editar Reproducción' : 'Nueva Reproducción'} onSubmit={handleSubmit} isSubmitting={saving}>
      <div className="space-y-4">
        {/* Bovino */}
        <div>
          <label className={labelClass}>Seleccionar Bovino</label>
          <Select value={form.bovinoId} onValueChange={(val) => handleChange('bovinoId', val)}>
            <SelectTrigger className="w-full bg-white border-zinc-200 rounded-xl h-12 text-sm text-zinc-800 font-medium opacity-100">
              <SelectValue placeholder="Seleccione un animal...">
                {bovinoActual ? `${bovinoActual.arete} ${bovinoActual.nombre ? `- ${bovinoActual.nombre}` : ""}` : "Seleccione un animal..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white opacity-100 max-h-60">
              <SelectGroup>
                <SelectLabel>Bovinos</SelectLabel>
                {bovinos.map(b => (
                  <SelectItem key={b.id} value={b.id} className="text-zinc-900 opacity-100 font-medium cursor-pointer">
                    {b.arete} {b.nombre ? `- ${b.nombre}` : ''}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Fila principal: Inseminación y Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha Inseminación</label>
            <input 
              type="date" 
              value={form.fechaInseminacion} 
              onChange={(e) => handleChange('fechaInseminacion', e.target.value)} 
              required 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <Select value={form.tipo} onValueChange={(val) => handleChange('tipo', val)}>
              <SelectTrigger className="w-full bg-white border-zinc-200 rounded-xl h-12 text-sm text-zinc-800 font-medium opacity-100">
                <SelectValue placeholder="Seleccione tipo..." />
              </SelectTrigger>
              <SelectContent className="bg-white opacity-100 max-h-60">
                <SelectGroup>
                  <SelectLabel>Tipo de Reproducción</SelectLabel>
                  <SelectItem value="I.Artificial" className="text-zinc-900 font-medium cursor-pointer">I. Artificial</SelectItem>
                  <SelectItem value="Monta Natural" className="text-zinc-900 font-medium cursor-pointer">Monta Natural</SelectItem>
                  <SelectItem value="Transf.Embrion" className="text-zinc-900 font-medium cursor-pointer">Transf. Embrion</SelectItem>
                  <SelectItem value="Celo no servido" className="text-zinc-900 font-medium cursor-pointer">Celo no servido</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campos dinámicos organizados en grid de 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reproduccionFormFields.map((field) => (
            <div key={field.name}>
              <label className={labelClass}>{field.label}</label>
              {field.type === 'select' ? (
                <Select value={(form as any)[field.name] || ''} onValueChange={(val) => handleChange(field.name, val)}>
                  <SelectTrigger className="w-full bg-white border-zinc-200 rounded-xl h-12 text-sm text-zinc-800 font-medium opacity-100">
                    <SelectValue placeholder={`Seleccione ${field.label.toLowerCase()}...`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white opacity-100 max-h-60">
                    <SelectGroup>
                      <SelectLabel>{field.label}</SelectLabel>
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-zinc-900 font-medium cursor-pointer">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <input 
                  type={field.type} 
                  placeholder={field.placeholder} 
                  value={(form as any)[field.name] || ''} 
                  onChange={(e) => handleChange(field.name, e.target.value)} 
                  className={inputClass} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Observaciones */}
        <div>
          <label className={labelClass}>Observaciones</label>
          <textarea rows={3} placeholder="Notas adicionales..." value={form.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} className={`${inputClass} h-auto py-3 resize-none`} />
        </div>
      </div>
    </FormModal>
  );
}