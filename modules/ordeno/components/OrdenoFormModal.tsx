"use client";

import { useState, useEffect } from "react";
import { Ordeño } from "../schemas";
import { Bovino } from "@/modules/inventario/schemas";


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
import { Milk, Calendar, Clock, FileText, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface OrdeñoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Ordeño>) => Promise<void>;
  initialData?: Ordeño | null;
  bovinos?: Bovino[];
}

type OrdeñoFormState = Omit<Partial<Ordeño>, "litros" | "concentrado_kg"> & {
  litros: number | string;
  concentrado_kg: number | string;
};

const JORNADAS_DISPONIBLES = [
  "Mañana",
  "Tarde",
] as const;

export default function OrdeñoFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  bovinos = [],
}: OrdeñoFormModalProps) {
  const [formData, setFormData] = useState<OrdeñoFormState>(
    initialData
      ? (initialData as OrdeñoFormState)
      : {
          jornada: "Mañana",
          fecha: new Date().toISOString().split("T")[0],
          litros: "",
          concentrado_kg: "",
        }
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData as OrdeñoFormState);
    } else {
      setFormData({
        jornada: "Mañana",
        fecha: new Date().toISOString().split("T")[0],
        litros: "",
        concentrado_kg: "",
      });
    }
  }, [initialData, isOpen]);

  const listaBovinos = Array.isArray(bovinos) ? bovinos : [];
  const vacasDisponibles = listaBovinos.filter(
    (b) => b.genero === "Hembra" 
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");
      
      // Aseguramos que se envíe como número si tiene valor, o 0/undefined si está vacío
      const dataToSave: Partial<Ordeño> = {
        ...formData,
        litros: formData.litros === "" ? 0 : Number(formData.litros),
        concentrado_kg: formData.concentrado_kg === "" ? 0 : Number(formData.concentrado_kg),
      };

      await onSave(dataToSave);
      toast.success(
        isEditing ? "¡Ordeño actualizado!" : "¡Ordeño registrado!",
        {
          description: `Se registró el ordeño correctamente.`,
        }
      );
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

  const vacaSeleccionada = vacasDisponibles.find(
    (v) => v.id === formData.bovino_id
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-xl overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Milk className="h-5 w-5 text-black" />
            {isEditing ? "Editar Registro de Ordeño" : "Nuevo Registro de Ordeño"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra la producción de leche y consumo de concentrado individual de las vacas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Bovino *</label>
                <Select
                  value={formData.bovino_id || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, bovino_id: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue placeholder="Seleccione un bovino">
                      {vacaSeleccionada
                        ? `Arete: ${vacaSeleccionada.arete}${
                            vacaSeleccionada.nombre ? ` - ${vacaSeleccionada.nombre}` : ""
                          }`
                        : "Seleccione una vaca"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {vacasDisponibles.map((vaca) => (
                      <SelectItem key={vaca.id} value={vaca.id}>
                        Arete: {vaca.arete} {vaca.nombre ? `- ${vaca.nombre}` : ""}
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
                      setFormData((prev) => ({
                        ...prev,
                        fecha: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Turno *
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
                      {JORNADAS_DISPONIBLES.map((jornada) => (
                        <SelectItem key={jornada} value={jornada}>
                          {jornada}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Milk className="h-3.5 w-3.5 text-muted-foreground" /> Cantidad (Litros) *
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
                        litros: e.target.value === "" ? "" : parseFloat(e.target.value),
                      }))
                    }
                    placeholder="Ej. 6.5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" /> Concentrado (Kg)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-9 text-sm"
                    value={formData.concentrado_kg ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        concentrado_kg: e.target.value === "" ? "" : parseFloat(e.target.value),
                      }))
                    }
                    placeholder="Ej. 2.0"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
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
                  placeholder="Detalles sobre la calidad de la leche, mastitis, etc..."
                />
              </div>
            </div>
          </div>
            <DialogFooter className="px-6 py-6 pb-5 sm:py-7 border-t bg-muted/10 flex flex-row items-center justify-end gap-3 shrink-0">
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
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Registrar Ordeño"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}