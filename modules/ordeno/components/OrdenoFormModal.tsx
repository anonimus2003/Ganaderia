"use client";

import { useState, useEffect } from "react";
import { Ordeno, Bovino } from "../schemas";
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
  Clock,
  Droplets,
  FileText,
  Loader2,
  Milk,
} from "lucide-react";
import { toast } from "sonner";

interface OrdenoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Ordeno>) => Promise<void>;
  initialData?: Ordeno | null;
  bovinos?: Bovino[];
}

const JORNADAS_DISPONIBLES = [
  { value: "Mañana", label: "Mañana" },
  { value: "Tarde", label: "Tarde" },
];

export default function OrdenoFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  bovinos = [],
}: OrdenoFormModalProps) {
  const [formData, setFormData] = useState<Partial<Ordeno>>(
    initialData || {
      fecha: new Date().toISOString().split("T")[0],
      jornada: "Mañana",
      litros: 0,
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
        jornada: "Mañana",
        litros: 0,
        observaciones: "",
      });
    }
  }, [initialData, isOpen]);

  const listaBovinos = Array.isArray(bovinos) ? bovinos : [];
  const bovinosHembras = listaBovinos.filter((b) => b.genero === "Hembra");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");
      
      if (!formData.bovino_id) {
        throw new Error("Debe seleccionar un bovino para registrar el ordeño.");
      }
      if (formData.litros === undefined || formData.litros < 0) {
        throw new Error("Ingrese una cantidad válida de litros.");
      }

      await onSave(formData);
    
      onClose();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al guardar el registro de ordeño";
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
              <Milk className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEditing ? "Editar Registro de Ordeño" : "Nuevo Registro de Ordeño"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Control de producción lechera por animal y jornada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-4">
            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5">
                Bovino / Vaca *
              </label>
             <Select
  value={formData.bovino_id || ""}
  onValueChange={(value) =>
    setFormData((prev: Partial<Ordeno>) => ({ 
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
                  {bovinosHembras.map((bovino) => (
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
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Jornada *
                </label>
                <Select
                  value={formData.jornada || "Mañana"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, jornada: value as any }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JORNADAS_DISPONIBLES.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {j.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-muted-foreground" /> Producción en Litros *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                className="h-9 text-sm"
                value={formData.litros ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    litros: e.target.value === "" ? 0 : parseFloat(e.target.value),
                  }))
                }
                placeholder="Ej. 12.5"
              />
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
                placeholder="Novedades de la ubre, comportamiento, etc..."
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