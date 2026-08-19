'use client';

import React, { useState, useEffect } from "react";
import FormModal from "@/components/ui/FormModal";
import { Bovino } from "../schemas";
import { Tag, User, Dna, Calendar, Scale, Activity, ShieldAlert, FileText, HeartPulse } from "lucide-react";

interface BovinoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Bovino>) => void;
  initialData?: Bovino | null;
  bovinosDisponibles?: Bovino[];
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

export default function BovinoFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  bovinosDisponibles = [] 
}: BovinoFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Bovino>>({
    arete: "",
    nombre: "",
    raza: "",
    genero: "Hembra",
    peso_inicial: 0,
    estado: "Ternera en lactancia",
    fecha_nacimiento: "",
    proposito: "Doble Propósito",
    madre_id: null,
    padre_id: null,
    observaciones: "",
    condicion: "Activo",
    motivo_baja: null,
    observacion_baja: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fecha_nacimiento: initialData.fecha_nacimiento || "",
        proposito: initialData.proposito || "Doble Propósito",
        madre_id: initialData.madre_id || null,
        padre_id: initialData.padre_id || null,
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
        fecha_nacimiento: "",
        proposito: "Doble Propósito",
        madre_id: null,
        padre_id: null,
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
        madre_id: formData.madre_id || null,
        padre_id: formData.padre_id || null,
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

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800 font-medium";
  const selectClass = "w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800 font-medium cursor-pointer";
  const labelClass = "flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  const posiblesMadres = bovinosDisponibles.filter(
    (b) => b.genero === "Hembra" && b.id !== initialData?.id
  );
  const posiblesPadres = bovinosDisponibles.filter(
    (b) => b.genero === "Macho" && b.id !== initialData?.id
  );

  return (
    <FormModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Editar Información de Bovino" : "Registrar Nuevo Bovino"}
      onSubmit={handleSubmit}
      isSubmitting={saving}
      submitText={initialData ? "Guardar Cambios" : "Registrar Bovino"}
    >
      <div className="space-y-6">
        
        {/* SECCIÓN 1: Identificación y Características */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#01684c] flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Tag className="w-4 h-4" /> Identificación y Raza
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Número de Arete *</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  required
                  value={formData.arete || ""} 
                  onChange={(e) => setFormData({...formData, arete: e.target.value})}
                  className={inputClass}
                  placeholder="Ej: 047"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Nombre (Opcional)</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={formData.nombre || ""} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className={inputClass}
                  placeholder="Ej: Lucero"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Raza *</label>
              <div className="relative">
                <Dna className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  required
                  value={formData.raza || ""} 
                  onChange={(e) => setFormData({...formData, raza: e.target.value})}
                  className={inputClass}
                  placeholder="Ej: Holstein"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Género *</label>
              <div className="relative">
                <Activity className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <select 
                  value={formData.genero || "Hembra"}
                  onChange={(e) => setFormData({...formData, genero: e.target.value})}
                  className={selectClass}
                >
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Genealogía y Propósito */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#01684c] flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Calendar className="w-4 h-4" /> Ciclo Vital y Genealogía
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fecha de Nacimiento</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input 
                  type="date" 
                  value={formData.fecha_nacimiento || ""} 
                  onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Propósito Zootécnico</label>
              <div className="relative">
                <HeartPulse className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <select 
                  value={formData.proposito || "Doble Propósito"}
                  onChange={(e) => setFormData({...formData, proposito: e.target.value})}
                  className={selectClass}
                >
                  <option value="Leche">Leche</option>
                  <option value="Carne">Carne</option>
                  <option value="Doble Propósito">Doble Propósito</option>
                  <option value="Cría">Cría</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Madre (Del Hato)</label>
              <select 
                value={formData.madre_id || ""}
                onChange={(e) => setFormData({...formData, madre_id: e.target.value ? e.target.value : null})}
                className="w-full px-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800 cursor-pointer font-medium"
              >
                <option value="">-- Sin Registro --</option>
                {posiblesMadres.map((vaca) => (
                  <option key={vaca.id} value={vaca.id}>
                    {vaca.arete} {vaca.nombre ? `(${vaca.nombre})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Padre (Del Hato)</label>
              <select 
                value={formData.padre_id || ""}
                onChange={(e) => setFormData({...formData, padre_id: e.target.value ? e.target.value : null})}
                className="w-full px-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800 cursor-pointer font-medium"
              >
                <option value="">-- Sin Registro --</option>
                {posiblesPadres.map((toro) => (
                  <option key={toro.id} value={toro.id}>
                    {toro.arete} {toro.nombre ? `(${toro.nombre})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Estado Productivo y Peso */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#01684c] flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Scale className="w-4 h-4" /> Zootecnia y Estado
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Peso Inicial (KG) *</label>
              <div className="relative">
                <Scale className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.peso_inicial || 0} 
                  onChange={(e) => setFormData({...formData, peso_inicial: parseFloat(e.target.value)})}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Estado Productivo</label>
              <select 
                value={formData.estado || ""}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800 cursor-pointer font-medium"
              >
                {ESTADOS_VALIDOS.map((est, idx) => (
                  <option key={idx} value={est}>{est}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: Condición e Inactividad */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2 pb-2 border-b border-zinc-100">
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Condición Operativa
          </h3>

          <div>
            <label className={labelClass}>Estado en el Hato</label>
            <select 
              value={formData.condicion || "Activo"}
              onChange={(e) => setFormData({
                ...formData, 
                condicion: e.target.value as 'Activo' | 'Inactivo',
                motivo_baja: e.target.value === 'Activo' ? null : (formData.motivo_baja || 'Venta')
              })}
              className="w-full px-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800 cursor-pointer"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {formData.condicion === 'Inactivo' && (
            <div className="p-4 bg-rose-50/80 border border-rose-100 rounded-2xl space-y-3 animate-in fade-in duration-200">
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
                <label className="block text-[11px] font-bold uppercase text-rose-700 tracking-wider mb-1">Detalle de la Baja</label>
                <input 
                  type="text"
                  value={formData.observacion_baja || ""} 
                  onChange={(e) => setFormData({...formData, observacion_baja: e.target.value})}
                  className="w-full border border-rose-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500 bg-white text-zinc-800 placeholder:text-rose-300"
                  placeholder="Ej: Vendido a ganadería vecina..."
                />
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 5: Observaciones */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-2">
          <label className={labelClass}>
            <FileText className="w-4 h-4 text-zinc-400" /> Observaciones Generales
          </label>
          <textarea 
            rows={2}
            value={formData.observaciones || ""} 
            onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
            className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800 resize-none font-medium"
            placeholder="Notas adicionales, historial médico rápido o particularidades..."
          />
        </div>

      </div>
    </FormModal>
  );
}