"use client";

import { useState, useEffect } from "react";
import { Reproduccion } from "../schemas";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ReproduccionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Reproduccion>) => Promise<void>;
  initialData?: Reproduccion | null;
  allBovinos?: Bovino[];
}

const TIPOS_REPRODUCCION = [
  "I.Artificial",
  "Monta Natural",
  "Transferencia de Embriones",
  "Celo no servido"
];

const ESTADOS_INSEMINACION = [
  "Pendiente",
  "Confirmada",
  "Fallida",
  "Gestante",
];

// Función auxiliar para sumar días a una fecha base (formato YYYY-MM-DD) sin problemas de zona horaria
function sumarDiasAFecha(fechaStr: string, dias: number): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  fecha.setDate(fecha.getDate() + dias);
  
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ReproduccionFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  allBovinos = [],
}: ReproduccionFormModalProps) {
  const hoyStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<Partial<Reproduccion>>(
    initialData || {
      tipo: "I.Artificial",
      estado: "Pendiente",
      numero_servicios: 1,
      fecha_inseminacion: hoyStr,
      fecha_chequeo: sumarDiasAFecha(hoyStr, 60),
      fecha_secado: sumarDiasAFecha(hoyStr, 223), // ~60 días antes del parto (283 - 60)
      fecha_probable_parto: sumarDiasAFecha(hoyStr, 283),
    }
  );

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        tipo: "I.Artificial",
        estado: "Pendiente",
        numero_servicios: 1,
        fecha_inseminacion: hoyStr,
        fecha_chequeo: sumarDiasAFecha(hoyStr, 60),
        fecha_secado: sumarDiasAFecha(hoyStr, 223),
        fecha_probable_parto: sumarDiasAFecha(hoyStr, 283),
      });
    }
  }, [initialData, isOpen, hoyStr]);

  // Manejador especial para actualizar la fecha de inseminación y recalcular las demás automáticamente
  const handleFechaInseminacionChange = (nuevaFecha: string) => {
    setFormData((prev) => ({
      ...prev,
      fecha_inseminacion: nuevaFecha,
      fecha_chequeo: sumarDiasAFecha(nuevaFecha, 60),
      fecha_secado: sumarDiasAFecha(nuevaFecha, 223), // Se calcula automáticamente a los 223 días de gestación
      fecha_probable_parto: sumarDiasAFecha(nuevaFecha, 283),
    }));
  };

  const listaBovinos = Array.isArray(allBovinos) ? allBovinos : [];
  const posiblesHembras = listaBovinos.filter((b) => b.genero === "Hembra");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");
      await onSave(formData);
      toast.success(
        isEditing ? "¡Registro de reproducción actualizado!" : "¡Reproducción registrada!",
        {
          description: `El evento reproductivo se guardó correctamente.`,
        }
      );
      onClose();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al guardar el registro";
      setErrorMsg(mensaje);
      toast.error("No se pudo guardar", { description: mensaje });
    } finally {
      setSaving(false);
    }
  };

  const hembraActual = posiblesHembras.find((h) => h.id === formData.bovino_id);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Editar Registro Reproductivo" : "Nuevo Registro Reproductivo"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Control de servicios, inseminaciones, diagnóstico y seguimiento gestacional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="px-6 pt-3 bg-muted/20 border-b">
              <TabsList className="grid grid-cols-2 w-full h-9">
                <TabsTrigger value="general" className="text-xs flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Datos del Servicio
                </TabsTrigger>
                <TabsTrigger value="fechas" className="text-xs flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Fechas y Seguimiento
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMsg && (
                <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              <TabsContent value="general" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Hembra (Vaca / Novilla) *</label>
                    <Select
                      value={formData.bovino_id || "none"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          bovino_id: (value === "none" ? "" : value) as string,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Seleccione una hembra">
                          {hembraActual
                            ? `Arete: ${hembraActual.arete}${
                                hembraActual.nombre ? ` - ${hembraActual.nombre}` : ""
                              }`
                            : "Seleccione una hembra"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>
                          Seleccione una hembra
                        </SelectItem>
                        {posiblesHembras.map((hembra) => (
                          <SelectItem key={hembra.id} value={hembra.id}>
                            {hembra.arete} {hembra.nombre ? `- ${hembra.nombre}` : ""} ({hembra.raza})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Tipo de Reproducción *</label>
                    <Select
                      value={formData.tipo || "I.Artificial"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          tipo: value as any,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_REPRODUCCION.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Estado *</label>
                    <Select
                      value={formData.estado || "Pendiente"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          estado: value as any,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_INSEMINACION.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Toro o Código de Pajilla *</label>
                    <Input
                      required
                      className="h-9 text-sm"
                      value={formData.toro_pajilla || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, toro_pajilla: e.target.value }))
                      }
                      placeholder="Ej. Pajilla Brahman Rojo #45"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Raza del Toro</label>
                    <Input
                      className="h-9 text-sm"
                      value={formData.raza_toro || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, raza_toro: e.target.value }))
                      }
                      placeholder="Ej. Gyr Lechero"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Número de Servicios</label>
                    <Input
                      type="number"
                      min={1}
                      className="h-9 text-sm"
                      value={formData.numero_servicios ?? 1}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          numero_servicios: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Técnico / Responsable *</label>
                    <Input
                      required
                      className="h-9 text-sm"
                      value={formData.tecnico || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tecnico: e.target.value }))
                      }
                      placeholder="Nombre del veterinario"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fechas" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Fecha de Inseminación *</label>
                    <Input
                      type="date"
                      required
                      className="h-9 text-sm"
                      value={formData.fecha_inseminacion || ""}
                      onChange={(e) => handleFechaInseminacionChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Fecha Probable de Parto</label>
                    <Input
                      type="date"
                      className="h-9 text-sm"
                      value={formData.fecha_probable_parto || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fecha_probable_parto: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Fecha de Chequeo</label>
                    <Input
                      type="date"
                      className="h-9 text-sm"
                      value={formData.fecha_chequeo || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fecha_chequeo: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Fecha de Secado</label>
                    <Input
                      type="date"
                      className="h-9 text-sm"
                      value={formData.fecha_secado || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fecha_secado: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium">Fecha de Parto (Real)</label>
                    <Input
                      type="date"
                      className="h-9 text-sm"
                      value={formData.fecha_parto || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fecha_parto: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
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
                    placeholder="Detalles sobre el diagnóstico, celo, etc..."
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

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
            <Button 
              type="submit" 
              size="default"
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}