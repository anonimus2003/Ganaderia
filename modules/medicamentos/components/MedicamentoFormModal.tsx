'use client';

import { useState, useEffect } from "react";
import { Medicamento } from "../schemas";
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
  Activity,
  Calendar,
  FileText,
  Loader2,
  Syringe,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BovinoReference } from "@/lib/dataTypes";

interface MedicamentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<Medicamento>) => Promise<void>;
  medicamentoAEditar?: Medicamento | null;
  saving?: boolean;
}

const VIAS_APLICACION = [
  "Intramuscular",
  "Subcutánea",
  "Endovenosa",
  "Tópica",
  "Oral",
];

export default function MedicamentoFormModal({
  isOpen,
  onClose,
  onSuccess,
  medicamentoAEditar,
  saving = false,
}: MedicamentoFormModalProps) {
  const [bovinos, setBovinos] = useState<BovinoReference[]>([]);
  const supabase = createClient();

  const [formData, setFormData] = useState<Partial<Medicamento>>(
    medicamentoAEditar || {
      via: "Intramuscular",
      fecha_aplicacion: new Date().toISOString().split("T")[0],
      retiro_leche: 0,
      retiro_carne: 0,
    }
  );

  const [loadingBovinos, setLoadingBovinos] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!medicamentoAEditar;

  useEffect(() => {
    if (isOpen) {
      async function fetchBovinos() {
        try {
          setLoadingBovinos(true);
          const { data } = await supabase
            .from("bovinos")
            .select("id, arete, nombre")
            .order("arete");
          setBovinos((data ?? []) as unknown as BovinoReference[]);
        } catch (err) {
          console.error("Error al cargar bovinos:", err);
        } finally {
          setLoadingBovinos(false);
        }
      }
      fetchBovinos();
    }
  }, [isOpen, supabase]);

  useEffect(() => {
    if (medicamentoAEditar) {
      setFormData(medicamentoAEditar);
    } else {
      setFormData({
        via: "Intramuscular",
        fecha_aplicacion: new Date().toISOString().split("T")[0],
        retiro_leche: 0,
        retiro_carne: 0,
        bovino_id: "",
        medicamento: "",
        dosis: "",
        veterinario: "",
        motivo: "",
      });
    }
  }, [medicamentoAEditar, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      const payload = { ...formData };
      if (!payload.id) {
        delete payload.id;
      }

      await onSuccess(payload);
      toast.success(
        isEditing ? "¡Tratamiento actualizado!" : "¡Tratamiento registrado!",
        {
          description: `El medicamento ${
            formData.medicamento || ""
          } se guardó correctamente.`,
        }
      );
      onClose();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al guardar el tratamiento";
      setErrorMsg(mensaje);
      toast.error("No se pudo guardar", { description: mensaje });
    }
  };

  const bovinoActual = bovinos.find((b) => b.id === formData.bovino_id);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Editar Tratamiento Médico" : "Registrar Tratamiento Médico"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lleva el control de aplicaciones veterinarias y periodos de retiro.
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
                <label className="text-xs font-medium flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" /> Bovino *
                </label>
                <Select
                  value={formData.bovino_id || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ 
                      ...prev, 
                      bovino_id: value || undefined // Cambiado de null a undefined para coincidir con el tipo
                    }))
                  }
                
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue placeholder={loadingBovinos ? "Cargando bovinos..." : "Seleccione un animal..."}>
                      {bovinoActual
                        ? `Arete: ${bovinoActual.arete}${
                            bovinoActual.nombre ? ` - ${bovinoActual.nombre}` : ""
                          }`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {bovinos.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.arete} {b.nombre ? `- ${b.nombre}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Syringe className="h-3.5 w-3.5 text-muted-foreground" /> Medicamento *
                  </label>
                  <Input
                    required
                    className="h-9 text-sm"
                    value={formData.medicamento || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, medicamento: e.target.value }))
                    }
                    placeholder="Ej. Oxitetraciclina"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Dosis *</label>
                  <Input
                    required
                    className="h-9 text-sm"
                    value={formData.dosis || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dosis: e.target.value }))
                    }
                    placeholder="Ej. 10 ml"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Vía de Aplicación *</label>
                  <Select
                  value={formData.via || "Intramuscular"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ 
                      ...prev, 
                      via: value || undefined // Cambiado de null a undefined para coincidir con el tipo
                    }))
                  }
                
                  >
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIAS_APLICACION.map((via) => (
                        <SelectItem key={via} value={via}>
                          {via}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Fecha de Aplicación *
                  </label>
                  <Input
                    type="date"
                    required
                    className="h-9 text-sm"
                    value={formData.fecha_aplicacion || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fecha_aplicacion: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Retiro Leche (Días)</label>
                  <Input
                    type="number"
                    min="0"
                    className="h-9 text-sm"
                    value={formData.retiro_leche ?? 0}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        retiro_leche: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Retiro Carne (Días)</label>
                  <Input
                    type="number"
                    min="0"
                    className="h-9 text-sm"
                    value={formData.retiro_carne ?? 0}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        retiro_carne: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Veterinario / Responsable *
                  </label>
                  <Input
                    required
                    className="h-9 text-sm"
                    value={formData.veterinario || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, veterinario: e.target.value }))
                    }
                    placeholder="Nombre del responsable"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Motivo / Diagnóstico
                  </label>
                  <Input
                    className="h-9 text-sm"
                    value={formData.motivo || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, motivo: e.target.value }))
                    }
                    placeholder="Ej. Mastitis, Infección"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-5 min-h-[70px] border-t bg-muted/10 flex flex-row items-center justify-end gap-3 shrink-0">
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
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar Tratamiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}