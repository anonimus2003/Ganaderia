"use client";

import { useState, useEffect } from "react";
import { Pesaje } from "../schemas";
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
import { Scale, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PesajeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<Pesaje>) => Promise<void>;
  pesajeAEditar?: Pesaje | null;
  bovinosList: Bovino[];
}

export default function PesajeFormModal({
  isOpen,
  onClose,
  onSuccess,
  pesajeAEditar,
  bovinosList  = [],
}: PesajeFormModalProps) {
  const [formData, setFormData] = useState<Partial<Pesaje>>(
    pesajeAEditar || {
      fecha: new Date().toISOString().split("T")[0],
    }
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!pesajeAEditar;

  useEffect(() => {
    if (pesajeAEditar) {
      setFormData({
        ...pesajeAEditar,
        fecha: pesajeAEditar.fecha ? pesajeAEditar.fecha.split("T")[0] : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        bovino_id: undefined,
        peso_kgs: undefined,
        condicion_corporal: undefined,
        observaciones: "",
      });
    }
  }, [pesajeAEditar, isOpen]);

  const listaBovinos = Array.isArray(bovinosList) ? bovinosList : [];
  const bovinoActual = listaBovinos.find((b) => b.id === formData.bovino_id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");
      await onSuccess(formData);
      toast.success(
        isEditing ? "¡Pesaje actualizado!" : "¡Pesaje registrado!",
        {
          description: `El registro de peso se guardó correctamente.`,
        }
      );
      onClose();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al guardar el pesaje";
      setErrorMsg(mensaje);
      toast.error("No se pudo guardar", { description: mensaje });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-lg overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Registro de Pesaje" : "Nuevo Registro de Pesaje"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registra el control de peso periódico y la condición corporal del animal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}

            {/* Selección de Bovino */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Bovino (Arete / Nombre) *</label>
              <Select
                value={formData.bovino_id || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    bovino_id: value === "none" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue placeholder="Seleccione un bovino">
                    {bovinoActual
                      ? `Arete: ${bovinoActual.arete}${
                          bovinoActual.nombre ? ` - ${bovinoActual.nombre}` : ""
                        }`
                      : "Seleccione un bovino"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seleccione un bovino</SelectItem>
                  {listaBovinos.map((bovino) => (
                    <SelectItem key={bovino.id} value={bovino.id}>
                      Arete: {bovino.arete} {bovino.nombre ? `- ${bovino.nombre}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha del pesaje */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Fecha de Pesaje *</label>
              <Input
                required
                type="date"
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

            {/* Peso */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Peso (kg) *</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                className="h-9 text-sm"
                value={formData.peso_kgs !== undefined ? formData.peso_kgs : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    peso_kgs : e.target.value === "" ? undefined : Number(e.target.value),
                  }))
                }
                placeholder="Ej. 350.5"
              />
            </div>

            {/* Condición Corporal */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Condición Corporal (1 - 5)</label>
              <Input
                type="number"
                step="0.5"
                min="1"
                max="5"
                className="h-9 text-sm"
                value={formData.condicion_corporal !== undefined && formData.condicion_corporal !== null ? formData.condicion_corporal : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    condicion_corporal: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="Ej. 3.5"
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Observaciones</label>
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
                placeholder="Notas sobre el estado físico, báscula..."
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex flex-row items-center justify-end gap-3 shrink-0">
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