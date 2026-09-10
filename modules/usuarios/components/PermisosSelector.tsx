"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export function PermisosSelector() {
  const { register, watch, setValue } = useFormContext();
  const rolActual = watch("rol");

  // Opcional: Lógica predeterminada al cambiar de rol, personalízalo a tu gusto
  useEffect(() => {
    if (rolActual === "Administrador") {
      setValue("permisos", { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true });
    } else if (rolActual === "Trabajador" || rolActual === "Obrero" || rolActual === "Ordeñador") {
      setValue("permisos", { puede_ver: true, puede_crear: true, puede_editar: false, puede_eliminar: false });
    }
  }, [rolActual, setValue]);

  return (
    <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-800">
        <Shield className="w-4 h-4 text-primary" />
        <Label className="text-xs font-semibold">Permisos del Módulo</Label>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs hover:border-slate-300 transition-all">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
            {...register("permisos.puede_ver")}
          />
          <span className="font-medium">Ver registros</span>
        </label>

        <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs hover:border-slate-300 transition-all">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
            {...register("permisos.puede_crear")}
          />
          <span className="font-medium">Crear registros</span>
        </label>

        <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs hover:border-slate-300 transition-all">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
            {...register("permisos.puede_editar")}
          />
          <span className="font-medium">Editar registros</span>
        </label>

        <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs hover:border-slate-300 transition-all">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
            {...register("permisos.puede_eliminar")}
          />
          <span className="font-medium">Eliminar registros</span>
        </label>
      </div>
    </div>
  );
}