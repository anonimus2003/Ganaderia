"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usuarioSchema, Usuario } from "../schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Usuario | null;
  loading?: boolean;
}

export function UsuarioModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}: UsuarioModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      rol: "Trabajador",
      permisos: {
        puede_ver: true,
        puede_crear: false,
        puede_editar: false,
        puede_eliminar: false,
      },
    },
  });

  const rolActual = watch("rol");

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        apellidos: initialData.apellidos,
        email: initialData.email || "",
        telefono: initialData.telefono || "",
        rol: initialData.rol as any,
        permisos: initialData.permisos || {
          puede_ver: true,
          puede_crear: false,
          puede_editar: false,
          puede_eliminar: false,
        },
      });
    } else {
      reset({
        nombre: "",
        apellidos: "",
        email: "",
        telefono: "",
        rol: "Trabajador",
        permisos: {
          puede_ver: true,
          puede_crear: false,
          puede_editar: false,
          puede_eliminar: false,
        },
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nombre</Label>
              <Input placeholder="Ej. Juan" {...register("nombre")} />
              {errors.nombre && (
                <span className="text-xs text-red-500">
                  {errors.nombre.message as string}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Apellidos</Label>
              <Input placeholder="Ej. Pérez" {...register("apellidos")} />
              {errors.apellidos && (
                <span className="text-xs text-red-500">
                  {errors.apellidos.message as string}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Correo Electrónico</Label>
            <Input type="email" placeholder="correo@ejemplo.com" {...register("email")} />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message as string}
              </span>
            )}
          </div>

          {!initialData && (
            <div className="space-y-2">
              <Label className="text-xs">Contraseña temporal</Label>
              <Input type="password" placeholder="******" {...register("password" as any)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Teléfono</Label>
              <Input placeholder="3001234567" {...register("telefono")} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Rol</Label>
              <Select
                value={rolActual}
                onValueChange={(val) => setValue("rol", val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Veterinario">Veterinario</SelectItem>
                  <SelectItem value="Ordeñador">Ordeñador</SelectItem>
                  <SelectItem value="Obrero">Obrero</SelectItem>
                  <SelectItem value="Potreros">Potreros</SelectItem>
                  <SelectItem value="Trabajador">Trabajador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SECCIÓN DE PERMISOS INTEGRADA */}
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

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}