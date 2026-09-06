// modules/medicamentos/components/MedicamentoFormModal.tsx
'use client';

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Medicamento } from "../schemas";
import { createClient } from "@/lib/supabase/client";
import FormModal from "@/components/ui/FormModal";
import { BovinoReference, getErrorMessage } from "@/lib/dataTypes";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const viasEnum = [
  "Intramuscular",
  "Subcutánea",
  "Intravenosa",
  "Oral",
  "Tópica",
  "Intramamaria"
];

const modalSchema = z.object({
  id: z.string().optional().nullable(),
  bovino_id: z.string().min(1, "Seleccione un bovino"),
  medicamento: z.string().min(1, "Ingrese el medicamento"),
  dosis: z.string().min(1, "Ingrese la dosis"),
  via: z.string().min(1, "Seleccione la vía"),
  fecha_aplicacion: z.string().min(1, "Ingrese la fecha"),
  veterinario: z.string().min(1, "Ingrese el veterinario"),
  retiro_leche: z.coerce.number().min(0),
  retiro_carne: z.coerce.number().min(0),
  motivo: z.string().optional().nullable(),
});

interface TratamientoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<Medicamento>) => Promise<void>;
  medicamentoAEditar?: Medicamento | null;
  saving?: boolean;
}

export default function MedicamentoFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  medicamentoAEditar, 
  saving = false 
}: TratamientoFormModalProps) {
  const [bovinos, setBovinos] = useState<BovinoReference[]>([]);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(modalSchema),
    defaultValues: {
      bovino_id: "",
      via: "Intramuscular",
      medicamento: "",
      dosis: "",
      veterinario: "",
      motivo: "",
      retiro_leche: 0,
      retiro_carne: 0,
      fecha_aplicacion: new Date().toISOString().split("T")[0]
    }
  });

  useEffect(() => {
    register("id");
  }, [register]);

  useEffect(() => {
    if (isOpen) {
      async function fetchBovinos() {
        const { data } = await supabase.from("bovinos").select("id, arete, nombre").order("arete");
        setBovinos((data ?? []) as unknown as BovinoReference[]);
      }
      fetchBovinos();
    }
  }, [isOpen, supabase]);

  useEffect(() => {
    if (medicamentoAEditar) {
      setValue("id", medicamentoAEditar.id);
      setValue("bovino_id", medicamentoAEditar.bovino_id);
      setValue("medicamento", medicamentoAEditar.medicamento);
      setValue("dosis", medicamentoAEditar.dosis);
      setValue("via", medicamentoAEditar.via);
      setValue("fecha_aplicacion", medicamentoAEditar.fecha_aplicacion);
      setValue("retiro_leche", medicamentoAEditar.retiro_leche ?? 0);
      setValue("retiro_carne", medicamentoAEditar.retiro_carne ?? 0);
      setValue("veterinario", medicamentoAEditar.veterinario);
      setValue("motivo", medicamentoAEditar.motivo || "");
    } else {
      reset({
        id: null,
        fecha_aplicacion: new Date().toISOString().split("T")[0],
        retiro_leche: 0,
        retiro_carne: 0,
        via: "Intramuscular",
        medicamento: "",
        dosis: "",
        veterinario: "",
        motivo: "",
        bovino_id: ""
      });
    }
  }, [medicamentoAEditar, reset, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data };
      if (!payload.id || payload.id === "") {
        delete payload.id;
      }

      await onSuccess(payload);
      onClose();
    } catch (error: unknown) {
      console.error("Error al guardar tratamiento:", getErrorMessage(error));
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={medicamentoAEditar ? "Editar Tratamiento" : "Registrar Tratamiento Médico"}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={saving || isSubmitting}
      submitText={medicamentoAEditar ? "Guardar Cambios" : "Guardar Tratamiento"}
    >
      <div className="space-y-4">
        {/* Bovino con Select UI */}
        <div>
          <label className={labelClass}>Bovino</label>
          <Controller
            name="bovino_id"
            control={control}
            render={({ field }) => {
              const bovinoActual = bovinos.find(b => b.id === field.value);
              return (
                <Select value={field.value} onValueChange={field.onChange}>
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
                          {b.arete} {b.nombre ? `- ${b.nombre}` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.bovino_id?.message && (
            <span className="text-rose-500 text-xs mt-1 block">{String(errors.bovino_id.message)}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {/* Vía de Aplicación con Select UI */}
          <div>
            <label className={labelClass}>Vía de Aplicación</label>
            <Controller
              name="via"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-white border-zinc-200 rounded-xl h-12 text-sm text-zinc-800 font-medium opacity-100">
                    <SelectValue placeholder="Seleccione la vía..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white opacity-100 max-h-60">
                    <SelectGroup>
                      <SelectLabel>Vías de Aplicación</SelectLabel>
                      {viasEnum.map(v => (
                        <SelectItem key={v} value={v} className="text-zinc-900 opacity-100 font-medium cursor-pointer">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.via?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.via.message)}</span>
            )}
          </div>

          <div>
            <label className={labelClass}>Fecha de Aplicación</label>
            <input type="date" {...register("fecha_aplicacion")} className={inputClass} />
            {errors.fecha_aplicacion?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.fecha_aplicacion.message)}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Retiro Leche (Días)</label>
            <input type="number" min="0" {...register("retiro_leche")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Retiro Carne (Días)</label>
            <input type="number" min="0" {...register("retiro_carne")} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Veterinario / Responsable</label>
            <input type="text" {...register("veterinario")} className={inputClass} placeholder="Nombre" />
            {errors.veterinario?.message && (
              <span className="text-rose-500 text-xs mt-1 block">{String(errors.veterinario.message)}</span>
            )}
          </div>

          <div>
            <label className={labelClass}>Motivo / Diagnóstico</label>
            <input type="text" {...register("motivo")} className={inputClass} placeholder="Ej. Mastitis, Infección" />
          </div>
        </div>
      </div>
    </FormModal>
  );
}