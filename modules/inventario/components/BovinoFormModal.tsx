'use client';

import React, { useState, useEffect } from "react";
import FormModal from "@/components/ui/FormModal";
import { Bovino } from "../schemas";

interface BovinoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Bovino>) => void;
  initialData?: Bovino | null;
}

const ESTADOS_VALIDOS = [
  "Ternera en lactancia",
  "Destete",
  "Ternera en crecimiento",
  "Levante",
  "Novilla en desarrollo",
  "Novilla de vientre",
  "En producción",
  "Seca"
];

export default function BovinoFormModal({ isOpen, onClose, onSave, initialData }: BovinoFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Bovino>>({
    arete: "",
    nombre: "",
    raza: "",
    genero: "Hembra",
    peso_inicial: 0,
    estado: "Ternera en lactancia",
    observaciones: "",
    condicion: "Activo",
    motivo_baja: null,
    observacion_baja: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        condicion: initialData.condicion || "Activo",
        motivo_baja: initialData.motivo_baja || null,
        observacion_baja: initialData.observacion_baja || ""
      });
    } else {
      setFormData({
        arete: "",
        nombre: "",
        raza: "",
        genero: "Hembra",
        peso_inicial: 0,
        estado: "Ternera en lactancia",
        observaciones: "",
        condicion: "Activo",
        motivo_baja: null,
        observacion_baja: ""
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const dataToSave = {
        ...formData,
        motivo_baja: formData.condicion === 'Inactivo' ? formData.motivo_baja : null,
        observacion_baja: formData.condicion === 'Inactivo' ? formData.observacion_baja : null,
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Error al guardar bovino:", error);
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
      title={initialData ? "Editar Bovino" : "Registrar Nuevo Bovino"}
      onSubmit={handleSubmit}
      isSubmitting={saving}
      submitText={initialData ? "Guardar Cambios" : "Guardar Bovino"}
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Número de Etiqueta (Arete)</label>
          <input 
            type="text" 
            required
            value={formData.arete || ""} 
            onChange={(e) => setFormData({...formData, arete: e.target.value})}
            className={inputClass}
            placeholder="Ej: 047"
          />
        </div>

        <div>
          <label className={labelClass}>Nombre</label>
          <input 
            type="text" 
            value={formData.nombre || ""} 
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className={inputClass}
            placeholder="Ej: Lucero"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Raza</label>
            <input 
              type="text" 
              required
              value={formData.raza || ""} 
              onChange={(e) => setFormData({...formData, raza: e.target.value})}
              className={inputClass}
              placeholder="Ej: Holstein"
            />
          </div>
          <div>
            <label className={labelClass}>Género</label>
            <select 
              value={formData.genero || "Hembra"}
              onChange={(e) => setFormData({...formData, genero: e.target.value})}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Peso Inicial (KG)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.peso_inicial || 0} 
              onChange={(e) => setFormData({...formData, peso_inicial: parseFloat(e.target.value)})}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estado Productivo</label>
            <select 
              value={formData.estado || ""}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className={`${inputClass} cursor-pointer`}
            >
              {ESTADOS_VALIDOS.map((est, idx) => (
                <option key={idx} value={est}>{est}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- CONDICIÓN E INACTIVIDAD --- */}
        <div className="pt-2 border-t border-zinc-100">
          <label className={labelClass}>Condición en la Finca</label>
          <select 
            value={formData.condicion || "Activo"}
            onChange={(e) => setFormData({
              ...formData, 
              condicion: e.target.value as 'Activo' | 'Inactivo',
              motivo_baja: e.target.value === 'Activo' ? null : (formData.motivo_baja || 'Venta')
            })}
            className={`${inputClass} cursor-pointer font-medium`}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* SE DESPLIEGA SOLO SI ESTÁ INACTIVO */}
        {formData.condicion === 'Inactivo' && (
          <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-3 animate-in fade-in duration-200">
            <label className="block text-[11px] font-bold uppercase text-rose-700 tracking-wider">Motivo de Baja</label>
            
            <div className="grid grid-cols-3 gap-2">
              {(['Muerte', 'Venta', 'Otros'] as const).map((motivo) => (
                <button
                  key={motivo}
                  type="button"
                  onClick={() => setFormData({...formData, motivo_baja: motivo})}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    formData.motivo_baja === motivo 
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm" 
                      : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {motivo}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-rose-700 tracking-wider mb-1">Observación de la Baja</label>
              <input 
                type="text"
                value={formData.observacion_baja || ""} 
                onChange={(e) => setFormData({...formData, observacion_baja: e.target.value})}
                className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 bg-white text-zinc-800"
                placeholder="Ej: Vendido a ganadería vecina..."
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Observaciones Generales</label>
          <textarea 
            rows={2}
            value={formData.observaciones || ""} 
            onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
            className={`${inputClass} resize-none`}
            placeholder="Notas adicionales sobre el animal..."
          />
        </div>
      </div>
    </FormModal>
  );
}