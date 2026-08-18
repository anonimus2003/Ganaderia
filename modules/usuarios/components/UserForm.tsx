'use client';

import React from "react";
import { useFormContext } from "react-hook-form";
import { UserFormValues } from "../schemas";

interface UserFormProps {
  initialData?: Partial<UserFormValues> | null;
  onSubmit?: (data: UserFormValues) => Promise<void>;
  isLoading?: boolean;
}

const ROLES_DISPONIBLES = ['Administrador', 'Veterinario', 'Ordeñador', 'Obrero', 'Potreros', 'Trabajador'];

export function UserForm({ initialData }: UserFormProps) {
  const { register, formState: { errors } } = useFormContext<UserFormValues>();
  
  // Determinamos si estamos en modo edición si existe initialData con algún dato (como un ID o email)
  const isEditing = Boolean(initialData && Object.keys(initialData).length > 0);

  const inputClass = "w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-[#01684c]/20 focus:border-[#01684c] outline-none transition-all text-zinc-800";
  const labelClass = "block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5";
  const errorClass = "text-rose-500 text-xs mt-1 block";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className={labelClass}>Nombre</label>
          <input 
            {...register("nombre")}
            className={inputClass} 
            placeholder="Ej. Juan"
          />
          {errors.nombre && <span className={errorClass}>{errors.nombre.message}</span>}
        </div>

        {/* Apellidos */}
        <div>
          <label className={labelClass}>Apellidos</label>
          <input 
            {...register("apellidos")}
            className={inputClass} 
            placeholder="Ej. Pérez"
          />
          {errors.apellidos && <span className={errorClass}>{errors.apellidos.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Correo Electrónico */}
        <div>
          <label className={labelClass}>Correo Electrónico</label>
          <input 
            type="email" 
            {...register("email")}
            // Opcional: si estás editando, puedes deshabilitar el correo si no quieres que lo cambien
            // disabled={isEditing} 
            className={`${inputClass} ${isEditing ? "bg-zinc-50 text-zinc-500 cursor-not-allowed" : ""}`} 
            placeholder="correo@agropecuario.com"
          />
          {errors.email && <span className={errorClass}>{errors.email.message}</span>}
        </div>

        {/* Teléfono */}
        <div>
          <label className={labelClass}>Teléfono</label>
          <input 
            {...register("telefono")}
            className={inputClass} 
            placeholder="Ej. 3134417241"
          />
          {errors.telefono && <span className={errorClass}>{errors.telefono.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contraseña temporal (Opcional o diferente en edición) */}
        <div>
          <label className={labelClass}>
            {isEditing ? "Nueva Contraseña (Opcional)" : "Contraseña Temporal"}
          </label>
          <input 
            type="password" 
            {...register("password")}
            className={inputClass} 
            placeholder={isEditing ? "Dejar en blanco para mantener la actual" : "••••••••"}
          />
          {errors.password && <span className={errorClass}>{errors.password.message}</span>}
        </div>

        {/* Rol */}
        <div>
          <label className={labelClass}>Rol</label>
          <select 
            {...register("rol")}
            className={`${inputClass} cursor-pointer`}
          >
            {ROLES_DISPONIBLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.rol && <span className={errorClass}>{errors.rol.message}</span>}
        </div>
      </div>
    </div>
  );
}