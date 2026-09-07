"use client";

import { useEffect, useState } from "react";
import { Reproduccion} from "../schemas";
import { Bovino } from "@/modules/inventario/schemas";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ReproduccionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Reproduccion>) => Promise<void>;
  initialData?: Reproduccion | null;
  bovinosList: Bovino[];
  isLoading?: boolean;
}

export function ReproduccionFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  bovinosList,
  isLoading = false,
}: ReproduccionFormModalProps) {
  const [formData, setFormData] = useState<Partial<Reproduccion>>({
    bovino_id: "",
    tipo: "Inseminación",
    fecha_inseminacion: new Date().toISOString().split("T")[0],
    toro_pajilla: "",
    tecnico: "",
    estado: "Gestante",
    observaciones: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fecha_inseminacion: initialData.fecha_inseminacion 
          ? initialData.fecha_inseminacion.split("T")[0] 
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        bovino_id: "",
        tipo: "Inseminación",
        fecha_inseminacion: new Date().toISOString().split("T")[0],
        toro_pajilla: "",
        tecnico: "",
        estado: "Gestante",
        observaciones: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: keyof Reproduccion, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {initialData ? "Editar Registro de Reproducción" : "Nueva Inseminación / Reproducción"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {/* Selección de Bovino (Vaca) */}
          <div className="space-y-2">
            <Label htmlFor="bovino_id" className="text-xs font-medium text-slate-700">
              Bovino (Hembra) *
            </Label>
            <Select
              value={formData.bovino_id || ""}
              onValueChange={(value) => handleChange("bovino_id", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione una vaca o arete..." />
              </SelectTrigger>
              <SelectContent>
                {bovinosList
                  .filter((b) => !b.genero || b.genero.toLowerCase() === "hembra")
                  .map((bovino) => (
                    <SelectItem key={bovino.id} value={bovino.id}>
                      Arete: {bovino.arete} {bovino.nombre ? `- ${bovino.nombre}` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Reproducción */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-xs font-medium text-slate-700">
                Tipo de Servicio
              </Label>
              <Select
                value={formData.tipo || "Inseminación"}
                onValueChange={(value) => handleChange("tipo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inseminación">Inseminación Artificial</SelectItem>
                  <SelectItem value="Monta natural">Monta Natural</SelectItem>
                  <SelectItem value="Transferecia de embriones">Transferencia de Embriones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha de Inseminación */}
            <div className="space-y-2">
              <Label htmlFor="fecha_inseminacion" className="text-xs font-medium text-slate-700">
                Fecha de Inseminación *
              </Label>
              <Input
                id="fecha_inseminacion"
                type="date"
                value={formData.fecha_inseminacion || ""}
                onChange={(e) => handleChange("fecha_inseminacion", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Toro o Pajilla */}
            <div className="space-y-2">
              <Label htmlFor="toro_o_pajilla" className="text-xs font-medium text-slate-700">
                Toro / Pajilla (Código o Nombre)
              </Label>
              <Input
                id="toro_o_pajilla"
                placeholder="Ej. Pajilla Brahman Rojo #45"
                value={formData.toro_pajilla || ""}
                onChange={(e) => handleChange("toro_pajilla", e.target.value)}
              />
            </div>

            {/* Inseminador / Técnico */}
            <div className="space-y-2">
              <Label htmlFor="inseminador" className="text-xs font-medium text-slate-700">
                Inseminador / Técnico
              </Label>
              <Input
                id="inseminador"
                placeholder="Nombre del técnico o veterinario"
                value={formData.tecnico || ""}
                onChange={(e) => handleChange("tecnico", e.target.value)}
              />
            </div>
          </div>

          {/* Estado de la reproducción */}
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-xs font-medium text-slate-700">
              Estado del Proceso
            </Label>
            <Select
              value={formData.estado || "Gestante"}
              onValueChange={(value) => handleChange("estado", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente de diagnóstico">Pendiente de Diagnóstico</SelectItem>
                <SelectItem value="Gestante">Gestante / Preñada</SelectItem>
                <SelectItem value="Vacía">Vacía / Fallida</SelectItem>
                <SelectItem value="Parida">Parida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-xs font-medium text-slate-700">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Detalles adicionales, tratamientos o notas de palpación..."
              value={formData.observaciones || ""}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? "Guardando..." : initialData ? "Actualizar Registro" : "Guardar Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}