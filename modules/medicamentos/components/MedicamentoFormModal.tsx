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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onSuccess: (data: Partial<Medicamento> | Partial<Medicamento>[]) => Promise<void>;
  medicamentoAEditar?: Medicamento | null;
  saving?: boolean;
}

const VIAS_APLICACION = [
  "Intramuscular",
  "Subcutánea",
  "Oral",
  "Tópica",
  "Intrauterina",
  "Local",
  "Intravenosa",
  "Endovenosa",
  "Rectal",
  "Intramamaria",
  "Intraruminal",
  "Intraperitonial",
  "Ocular",
  "Intradermica"
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

  const [formData, setFormData] = useState<Partial<Medicamento> & { bovino_ids?: string[] }>(
    medicamentoAEditar || {
      via: "Intramuscular",
      fecha_aplicacion: new Date().toISOString().split("T")[0],
      retiro_leche: 0,
      retiro_carne: 0,
      bovino_ids: [],
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
      setFormData({
        ...medicamentoAEditar,
        bovino_ids: medicamentoAEditar.bovino_id ? [medicamentoAEditar.bovino_id] : []
      });
    } else {
      setFormData({
        via: "Intramuscular",
        fecha_aplicacion: new Date().toISOString().split("T")[0],
        retiro_leche: 0,
        retiro_carne: 0,
        bovino_ids: [],
        medicamento: "",
        dosis: "",
        veterinario: "",
        motivo: "",
      });
    }
  }, [medicamentoAEditar, isOpen]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, bovino_ids: bovinos.map(b => b.id) }));
    } else {
      setFormData(prev => ({ ...prev, bovino_ids: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErrorMsg("");

      if (!formData.bovino_ids || formData.bovino_ids.length === 0) {
        setErrorMsg("Debes seleccionar al menos un bovino.");
        return;
      }

      const { bovino_ids, ...restData } = formData;
      const payload = { ...restData };
      if (!payload.id) {
        delete payload.id;
      }

      if (isEditing) {
        await onSuccess({
          ...payload,
          bovino_id: bovino_ids && bovino_ids.length > 0 ? bovino_ids[0] : undefined
        });
      } else {
        // Corrección: Mapeamos el arreglo de strings directamente
        const multiplePayloads = bovino_ids!.map(id => ({
          ...payload,
          bovino_id: id
        }));
        await onSuccess(multiplePayloads as any);
      }

      toast.success(
        isEditing ? "¡Tratamiento actualizado!" : "¡Tratamientos registrados!",
        {
          description: `El medicamento ${formData.medicamento || ""} se guardó correctamente.`,
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
            {isEditing ? "Editar Tratamiento Médico" : "Registrar Tratamiento Médico Múltiple"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecciona uno o varios animales para aplicar el mismo tratamiento.
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
              <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                <div className="flex items-center justify-between pb-2 border-b">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" /> Bovinos ({formData.bovino_ids?.length || 0} seleccionados)
                  </label>
                  {!isEditing && bovinos.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSelectAll(formData.bovino_ids?.length !== bovinos.length)}
                    >
                      {formData.bovino_ids?.length === bovinos.length ? "Deseleccionar todos" : "Seleccionar todos"}
                    </Button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {loadingBovinos ? (
                    <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cargando bovinos...
                    </div>
                  ) : bovinos.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">No hay bovinos registrados.</p>
                  ) : (
                    bovinos.map((b) => {
                      const isChecked = formData.bovino_ids?.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          className="flex items-center space-x-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            if (isEditing) {
                              setFormData(prev => ({ ...prev, bovino_ids: [b.id] }));
                            } else {
                              setFormData(prev => {
                                const current = prev.bovino_ids || [];
                                const updated = isChecked
                                  ? current.filter(id => id !== b.id)
                                  : [...current, b.id];
                                return { ...prev, bovino_ids: updated };
                              });
                            }
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (isEditing) {
                                setFormData(prev => ({ ...prev, bovino_ids: [b.id] }));
                              } else {
                                setFormData(prev => {
                                  const current = prev.bovino_ids || [];
                                  const updated = checked
                                    ? [...current, b.id]
                                    : current.filter(id => id !== b.id);
                                  return { ...prev, bovino_ids: updated };
                                });
                              }
                            }}
                          />
                          <span className="text-xs font-medium">
                            Arete: {b.arete} {b.nombre ? `- ${b.nombre}` : ""}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
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
                        via: value || undefined
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
                    value={formData.retiro_leche === 0 ? "" : formData.retiro_leche}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        retiro_leche: e.target.value === "" ? 0 : Number(e.target.value),
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
                    value={formData.retiro_carne === 0 ? "" : formData.retiro_carne}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        retiro_carne: e.target.value === "" ? 0 : Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Veterinario*
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
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Diagnóstico
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

          <DialogFooter className="px-6 py-7 min-h-[70px] border-t bg-muted/10 flex flex-row items-center justify-end gap-3 shrink-0">
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
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar Tratamientos"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}