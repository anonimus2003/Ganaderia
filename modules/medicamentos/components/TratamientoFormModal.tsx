'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tratamientoSchema, Tratamiento, viasEnum } from "../schemas";
import { createClient } from "@/lib/supabase/client";
import FormModal from "@/components/ui/FormModal"; // <--- Componente reutilizable

interface TratamientoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tratamiento>) => Promise<void>;
  initialData?: Tratamiento | null;
}

export default function TratamientoFormModal({ isOpen, onClose, onSave, initialData }: TratamientoFormModalProps) {
  const [bovinos, setBovinos] = useState<any[]>([]);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(tratamientoSchema),
  });

  useEffect(() => {
    if (isOpen) {
      async function fetchBovinos() {
        const { data } = await supabase.from("bovinos").select("id, arete, nombre").order("arete");
        setBovinos(data || []);
      }
      fetchBovinos();
    }
  }, [isOpen, supabase]);

  useEffect(() => {
    if (initialData) {
      setValue("id", initialData.id);
      setValue("bovino_id", initialData.bovino_id);
      setValue("medicamento", initialData.medicamento);
      setValue("dosis", initialData.dosis);
      setValue("via", initialData.via);
      setValue("fecha_aplicacion", initialData.fecha_aplicacion);
      setValue("retiro_leche", initialData.retiro_leche ?? 0);
      setValue("retiro_carne", initialData.retiro_carne ?? 0);
      setValue("veterinario", initialData.veterinario);
      setValue("motivo", initialData.motivo || "");
    } else {
      reset({
        fecha_aplicacion: new Date().toISOString().split("T")[0],
        tiempo_retiro: 0,
        retiro_leche: 0,
        retiro_carne: 0,
        via: "Intramuscular",
        medicamento: "",
        dosis: "",
        veterinario: "",
        motivo: "",
      });
    }
  }, [initialData, reset, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Error al guardar tratamiento:", error);
    }
  };

  // Clases unificadas para inputs y etiquetas del sistema
  const inputClass = "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Tratamiento" : "Registrar Tratamiento Médico"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitText={initialData ? "Guardar Cambios" : "Guardar Tratamiento"}
    >
      <div className="space-y-4">
        {/* Bovino */}
        <div>
          <label className={labelClass}>Bovino</label>
          <select 
            {...register("bovino_id")} 
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Seleccione un animal...</option>
            {bovinos.map(b => (
              <option key={b.id} value={b.id}>
                {b.arete} {b.nombre ? `- ${b.nombre}` : ""}
              </option>
            ))}
          </select>
          {errors.bovino_id?.message && (
            <span className="text-rose-500 text-xs mt-1 block">{String(errors.bovino_id.message)}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Medicamento */}
          <div>
            <label className={labelClass}>Medicamento</label>
            <input 
              type="text" 
              {...register("medicamento")} 
              className={inputClass}
              placeholder="Ej. Oxitetraciclina"
            />
            {errors.medicamento?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.medicamento.message)}</span>
            )}
          </div>

          {/* Dosis */}
          <div>
            <label className={labelClass}>Dosis</label>
            <input 
              type="text" 
              {...register("dosis")} 
              className={inputClass}
              placeholder="Ej. 10 ml"
            />
            {errors.dosis?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.dosis.message)}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Vía */}
          <div>
            <label className={labelClass}>Vía de Aplicación</label>
            <select 
              {...register("via")} 
              className={`${inputClass} cursor-pointer`}
            >
              {viasEnum.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {errors.via?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.via.message)}</span>
            )}
          </div>

          {/* Fecha Aplicación */}
          <div>
            <label className={labelClass}>Fecha de Aplicación</label>
            <input type="date" {...register("fecha_aplicacion")} className={inputClass} />
            {errors.fecha_aplicacion?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.fecha_aplicacion.message)}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
       
          {/* Retiro Leche */}
          <div>
            <label className={labelClass}>Retiro Leche</label>
            <input type="number" min="0" {...register("retiro_leche")} className={inputClass} />
          </div>

          {/* Retiro Carne */}
          <div>
            <label className={labelClass}>Retiro Carne</label>
            <input type="number" min="0" {...register("retiro_carne")} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Veterinario */}
          <div>
            <label className={labelClass}>Veterinario / Responsable</label>
            <input type="text" {...register("veterinario")} className={inputClass} placeholder="Nombre" />
            {errors.veterinario?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.veterinario.message)}</span>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className={labelClass}>Motivo / Diagnóstico</label>
            <input type="text" {...register("motivo")} className={inputClass} placeholder="Ej. Mastitis, Infección" />
          </div>
        </div>
      </div>
    </FormModal>
  );
}