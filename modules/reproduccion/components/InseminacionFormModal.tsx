'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inseminacionSchema, Inseminacion } from "../schemas";
import { createClient } from "@/lib/supabase/client";
import FormModal from "@/components/ui/FormModal"; // <--- Componente reutilizable

interface InseminacionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Inseminacion>) => Promise<void>;
  initialData?: Inseminacion | null;
}

export default function InseminacionFormModal({ isOpen, onClose, onSave, initialData }: InseminacionFormModalProps) {
  const [bovinos, setBovinos] = useState<any[]>([]);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(inseminacionSchema),
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
      setValue("toro_pajilla", initialData.toro_pajilla);
      setValue("raza_toro", initialData.raza_toro || "");
      setValue("numero_servicios", initialData.numero_servicios || 1);
      setValue("tipo", initialData.tipo || "I.A.");
      setValue("fecha_inseminacion", initialData.fecha_inseminacion);
      setValue("fecha_chequeo", initialData.fecha_chequeo || "");
      setValue("fecha_probable_parto", initialData.fecha_probable_parto || "");
      setValue("tecnico", initialData.tecnico);
      setValue("estado", initialData.estado || "Pendiente");
    } else {
      reset({
        fecha_inseminacion: new Date().toISOString().split("T")[0],
        numero_servicios: 1,
        tipo: "I.A.",
        estado: "Pendiente",
        toro_pajilla: "",
        raza_toro: "",
        tecnico: "",
        fecha_chequeo: "",
        fecha_probable_parto: "",
      });
    }
  }, [initialData, reset, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await onSave(data);
      onClose();
    } catch (error: any) {
      console.error("Error al guardar inseminación:", error?.message || error);
      alert(`Hubo un error al guardar: ${error?.message || 'Error desconocido'}`);
    }
  };

  // Clases unificadas de diseño limpio y corporativo
  const inputClass = "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Inseminación" : "Registrar Inseminación / Servicio"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitText={initialData ? "Guardar Cambios" : "Guardar Inseminación"}
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
          {/* Toro / Pajilla */}
          <div>
            <label className={labelClass}>Toro - Código de Pajilla</label>
            <input 
              type="text" 
              {...register("toro_pajilla")} 
              className={inputClass}
              placeholder="Ej. A-102 o Rayo"
            />
            {errors.toro_pajilla?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.toro_pajilla.message)}</span>
            )}
          </div>

          {/* Raza Toro */}
          <div>
            <label className={labelClass}>Raza del Toro</label>
            <input 
              type="text" 
              {...register("raza_toro")} 
              className={inputClass}
              placeholder="Ej. Holstein, Brahman"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo</label>
            <select {...register("tipo")} className={`${inputClass} cursor-pointer`}>
              <option value="I.Artificial">I.Artificial</option>
              <option value="Monta Natural">Monta Natural</option>
              <option value="Transf.Embrion">Transf.Embrion</option>
              <option value="Celo no servido">Celo no servido</option>
            </select>
          </div>

          {/* Número de Servicios */}
          <div>
            <label className={labelClass}>Nº Servicios</label>
            <input 
              type="number" 
              min="1" 
              {...register("numero_servicios")} 
              className={inputClass}
            />
          </div>

          {/* Estado */}
          <div>
            <label className={labelClass}>Estado</label>
            <select {...register("estado")} className={`${inputClass} cursor-pointer`}>
              <option value="Pendiente">Pendiente</option>
              <option value="Gestante">Gestante</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Fallida">Fallida</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha Inseminación */}
          <div>
            <label className={labelClass}>Fecha Inseminación</label>
            <input type="date" {...register("fecha_inseminacion")} className={inputClass} />
            {errors.fecha_inseminacion?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.fecha_inseminacion.message)}</span>
            )}
          </div>

          {/* Fecha Chequeo */}
          <div>
            <label className={labelClass}>Fecha Chequeo</label>
            <input type="date" {...register("fecha_chequeo")} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha Probable Parto */}
          <div>
            <label className={labelClass}>Probable Parto</label>
            <input type="date" {...register("fecha_probable_parto")} className={inputClass} />
          </div>

          {/* Técnico */}
          <div>
            <label className={labelClass}>Técnico / Responsable</label>
            <input type="text" {...register("tecnico")} className={inputClass} placeholder="Nombre del técnico" />
            {errors.tecnico?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.tecnico.message)}</span>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
}