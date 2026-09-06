"use client";

import { useState, useEffect } from "react";
import { Pesaje } from "../schemas";
import { Bovino } from "@/modules/ordeno/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Scale,
  Activity,
  FileText,
  Loader2,
  User,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";

interface PesajeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Pesaje>) => Promise<void>;
  initialData?: Pesaje | null;
  bovinos?: Bovino[];
}

const METODOS_PESAJE = [
  { value: "Balanza mecánica", label: "Balanza mecánica" },
  { value: "Balanza digital", label: "Balanza digital" },
  { value: "Cinta pesajera", label: "Cinta pesajera" },
  { value: "Estimación visual", label: "Estimación visual" },
];

export default function PesajeFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  bovinos = [],
}: PesajeFormModalProps) {
  const [formData, setFormData] = useState<Partial<Pesaje>>(
    initialData || {
      fecha: new Date().toISOString().split("T")[0],
      peso_kgs: 0,
      condicion_corporal: 3,
      estado_fisiologico: "Activo",
      metodo_pesaje: "Balanza digital",
      responsable: "",
      observaciones: "",
    }
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fecha: initialData.fecha ? initialData.fecha.split("T")[0] : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        peso_kgs: 0,
        condicion_corporal: 3,
        estado_fisiologico: "Activo",
        metodo_pesaje: "Balanza digital",
        responsable: "",
        observaciones: "",
      });
    }
  }, [initialData, isOpen]);

  const listaBovinos = Array.isArray(bovinos) ? bovinos : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");
      
      if (!formData.bovino_id) {
        throw new Error("Debe seleccionar un bovino para registrar el pesaje.");
      }
      if (formData.peso_kgs === undefined || formData.peso_kgs <= 0) {
        throw new Error("Ingrese un peso en kilogramos válido.");
      }

      await onSave(formData);
      onClose();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al guardar el registro de pesaje";
      setErrorMsg(mensaje);
      toast.error("No se pudo guardar", { description: mensaje });
    } finally {
      setSaving(false);
    }
  };

  const bovinoSeleccionado = listaBovinos.find((b) => b.id === formData.bovino_id);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEditing ? "Editar Registro de Pesaje" : "Nuevo Registro de Pesaje"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Control de peso y condición corporal del hato.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5">
                Bovino / Arete *
              </label>
              <Select
                value={formData.bovino_id || ""}
                onValueChange={(value) =>
                  setFormData((prev: Partial<Pesaje>) => ({ 
                    ...prev, 
                    bovino_id: value 
                  }))
                }
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue placeholder="Seleccione el bovino (Arete / Nombre)">
                    {bovinoSeleccionado
                      ? `Arete: ${bovinoSeleccionado.arete}${
                          bovinoSeleccionado.nombre ? ` - ${bovinoSeleccionado.nombre}` : ""
                        }`
                      : "Seleccione el bovino"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {listaBovinos.map((bovino) => (
                    <SelectItem key={bovino.id} value={bovino.id}>
                      Arete: {bovino.arete} {bovino.nombre ? `- ${bovino.nombre}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Fecha *
                </label>
                <Input
                  type="date"
                  required
                  className="h-9 text-sm"
                  value={formData.fecha || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fecha: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5 text-muted-foreground" /> Peso (Kg) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="h-9 text-sm"
                  value={formData.peso_kgs ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      peso_kgs: e.target.value === "" ? 0 : parseFloat(e.target.value),
                    }))
                  }
                  placeholder="Ej. 350.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" /> Condición Corporal (1-5)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  max="5"
                  className="h-9 text-sm"
                  value={formData.condicion_corporal ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      condicion_corporal: e.target.value === "" ? undefined : parseFloat(e.target.value),
                    }))
                  }
                  placeholder="Ej. 3.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" /> Estado Fisiológico
                </label>
                <Input
                  className="h-9 text-sm"
                  value={formData.estado_fisiologico || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, estado_fisiologico: e.target.value }))
                  }
                  placeholder="Ej. Gestante, Lactante, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  Método de Pesaje
                </label>
                <Select
                  value={formData.metodo_pesaje || "Balanza digital"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, metodo_pesaje: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue placeholder="Seleccione método" />
                  </SelectTrigger>
                  <SelectContent>
                    {METODOS_PESAJE.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> Responsable
                </label>
                <Input
                  className="h-9 text-sm"
                  value={formData.responsable || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, responsable: e.target.value }))
                  }
                  placeholder="Nombre del responsable"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Observaciones
              </label>
              <Textarea
                rows={3}
                className="text-sm resize-none"
                value={formData.observaciones || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observaciones: e.target.value,
                  }))
                }
                placeholder="Detalles adicionales del pesaje..."
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" size="default" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}