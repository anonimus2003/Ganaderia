'use client';

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { produccionLecheSchema, ProduccionLeche } from "../schemas";
import { createClient } from "@/lib/supabase/client";
import FormModal from "@/components/ui/FormModal";

interface ProduccionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProduccionLeche>) => Promise<void>;
  initialData?: ProduccionLeche | null;
}

export default function ProduccionFormModal({ isOpen, onClose, onSave, initialData }: ProduccionFormModalProps) {
  const [bovinosList, setBovinosList] = useState<{ id: string; arete: string; nombre: string | null }[]>([]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProduccionLeche>({
    resolver: zodResolver(produccionLecheSchema),
  });

  // Cargar lista de bovinos
  useEffect(() => {
    async function fetchBovinos() {
      const { data } = await supabase.from("bovinos").select("id, arete, nombre").order("arete");
      if (data) setBovinosList(data);
    }
    if (isOpen) fetchBovinos();
  }, [isOpen, supabase]);

  // Rellenar datos al editar
  useEffect(() => {
    if (initialData) {
      reset({
        id: initialData.id,
        bovino_id: initialData.bovino_id,
        fecha: initialData.fecha || new Date().toISOString().split('T')[0],
        litros: initialData.litros,
        jornada: initialData.jornada,
        concentrado_kg: initialData.concentrado_kg || 0,
        observaciones: initialData.observaciones || "",
      });
    } else {
      reset({
        bovino_id: "",
        fecha: new Date().toISOString().split('T')[0],
        litros: 0,
        jornada: "Mañana",
        concentrado_kg: 0,
        observaciones: "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ProduccionLeche) => {
    try {
      setSaving(true);
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  // Clases unificadas para inputs y etiquetas del sistema
  const inputClass = "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  return (
    <FormModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Editar Registro de Ordeño" : "Nuevo Registro de Leche"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={saving}
      submitText={initialData ? "Guardar Cambios" : "Guardar Registro"}
    >
      <div className="space-y-4">
        
        {/* Seleccionar Bovino */}
        <div>
          <label className={labelClass}>Bovino</label>
          <select 
            {...register("bovino_id")}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Seleccione un animal...</option>
            {bovinosList.map(b => (
              <option key={b.id} value={b.id}>
                {b.arete} {b.nombre ? `- ${b.nombre}` : ""}
              </option>
            ))}
          </select>
          {errors.bovino_id && <span className="text-rose-500 text-xs mt-1 block">{errors.bovino_id.message}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha</label>
            <input 
              type="date" 
              {...register("fecha")}
              className={inputClass}
            />
            {errors.fecha && <span className="text-rose-500 text-xs mt-1 block">{errors.fecha.message}</span>}
          </div>

          <div>
            <label className={labelClass}>Jornada</label>
            <select 
              {...register("jornada")}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
            {errors.jornada && <span className="text-rose-500 text-xs mt-1 block">{errors.jornada.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Litros de Leche (L)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register("litros")}
              placeholder="0.00"
              className={inputClass}
            />
            {errors.litros && <span className="text-rose-500 text-xs mt-1 block">{errors.litros.message}</span>}
          </div>

          <div>
            <label className={labelClass}>Concentrado (kg)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register("concentrado_kg")}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Observaciones</label>
          <textarea 
            rows={3} 
            {...register("observaciones")}
            placeholder="Notas adicionales..."
            className={`${inputClass} resize-none`}
          />
        </div>

      </div>
    </FormModal>
  );
}