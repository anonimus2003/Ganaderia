"use client";

import { useState, useEffect } from "react";
import { Bovino } from "../schemas";
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
  Hash,
  Activity,
  Dna,
  FileText,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface BovinoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Bovino>) => Promise<void>;
  initialData?: Bovino | null;
  allBovinos?: Bovino[];
}

const ETAPAS_HEMBRA: Exclude<Bovino["categoria"], null>[] = [
 "Ternera en lactancia",
  "Novilla en desarrollo",
  "Ternera en crecimiento",
  "Novilla de vientre",
  "Vaca",
];

const ETAPAS_MACHO: Exclude<Bovino["categoria"], null>[] = [
  "Ternera en lactancia",
  "Novilla en desarrollo",
  "Ternera en crecimiento",
  "Novilla de vientre",
  "Toro",
];

const PROPOSITOS_DISPONIBLES = [
  "Doble Propósito",
  "Carne",
  "Leche",
  "Cría y Levante",
];

const MOTIVOS_BAJA_DISPONIBLES = [
  "Venta",
  "Muerte",
  "Sacrificio / Consumo",
  "Descarte por infertilidad",
  "Robo / Pérdida",
];

export default function BovinoFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  allBovinos = [],
}: BovinoFormModalProps) {
  const [formData, setFormData] = useState<Partial<Bovino>>(
    initialData || {
      genero: "Hembra",
      condicion: "Activo",
      proposito: "Doble Propósito",
    }
  );

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!initialData;

  // Sincronizar cuando cambia initialData o se abre/cierra el modal
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        genero: "Hembra",
        condicion: "Activo",
        proposito: "Doble Propósito",
      });
    }
  }, [initialData, isOpen]);

  // Filtrado seguro asegurando que allBovinos sea un arreglo
  const listaBovinos = Array.isArray(allBovinos) ? allBovinos : [];
  
  const posiblesMadres = listaBovinos.filter(
    (b) => b.genero === "Hembra" && b.id !== initialData?.id
  );
  const posiblesPadres = listaBovinos.filter(
    (b) => b.genero === "Macho" && b.id !== initialData?.id
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");
      await onSave(formData);
      toast.success(
        isEditing ? "¡Bovino actualizado!" : "¡Bovino registrado!",
        {
          description: `El expediente con arete #${
            formData.arete || "S/A"
          } se guardó correctamente.`,
        }
      );
      onClose();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al guardar el bovino";
      setErrorMsg(mensaje);
      toast.error("No se pudo guardar", { description: mensaje });
    } finally {
      setSaving(false);
    }
  };

  const madreActual = posiblesMadres.find((m) => m.id === formData.madre_id);
  const padreActual = posiblesPadres.find((p) => p.id === formData.padre_id);

  const handleGenero = (value: "Hembra" | "Macho" | null) => {
    if (!value) return;
    const nuevaCategoria =
      value === "Hembra" ? ETAPAS_HEMBRA[0] : ETAPAS_MACHO[0];
    setFormData((prev: Partial<Bovino>) => ({
      ...prev,
      genero: value,
      categoria: nuevaCategoria,
    }));
  };

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
            {isEditing ? "Editar Expediente de Bovino" : "Nuevo Registro de Bovino"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Organiza la información zootécnica y genealógica del animal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="px-6 pt-3 bg-muted/20 border-b">
              <TabsList className="grid grid-cols-3 w-full h-9">
                <TabsTrigger value="general" className="text-xs flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> General
                </TabsTrigger>
                <TabsTrigger value="zootecnia" className="text-xs flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Zootecnia
                </TabsTrigger>
                <TabsTrigger value="genealogia" className="text-xs flex items-center gap-1.5">
                  <Dna className="h-3.5 w-3.5" /> Genealogía
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Número de Arete *</label>
                    <Input
                      required
                      className="h-9 text-sm"
                      value={formData.arete || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, arete: e.target.value }))
                      }
                      placeholder="Ej. 001"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Nombre Oficial</label>
                    <Input
                      className="h-9 text-sm"
                      value={formData.nombre || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                      }
                      placeholder="Ej. Lucero"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Raza Predominante *</label>
                    <Input
                      required
                      className="h-9 text-sm"
                      value={formData.raza || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, raza: e.target.value }))
                      }
                      placeholder="Ej. Brahman"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Género *</label>
                    <Select
                      value={formData.genero || "Hembra"}
                      onValueChange={handleGenero}
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hembra">Hembra</SelectItem>
                        <SelectItem value="Macho">Macho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isEditing && (
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-3 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                      <ShieldAlert className="h-3.5 w-3.5" /> Estado Operativo
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium">Condición *</label>
                        <Select
                          value={formData.condicion || "Activo"}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              condicion: value as "Activo" | "Inactivo",
                              ...(value === "Activo" && {
                                motivo_baja: null,
                                fecha_baja: null,
                                observacion_baja: null,
                              }),
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.condicion === "Inactivo" && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-destructive">
                              Motivo *
                            </label>
                            <Select
                              value={formData.motivo_baja || ""}
                              onValueChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  motivo_baja: value as any,
                                }))
                              }
                            >
                              <SelectTrigger className="h-8 text-xs w-full">
                                <SelectValue placeholder="Seleccione motivo" />
                              </SelectTrigger>
                              <SelectContent>
                                {MOTIVOS_BAJA_DISPONIBLES.map((motivo) => (
                                  <SelectItem key={motivo} value={motivo}>
                                    {motivo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-destructive">
                              Fecha de Baja *
                            </label>
                            <Input
                              type="date"
                              className="h-8 text-xs"
                              value={formData.fecha_baja || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  fecha_baja: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] font-medium text-destructive">
                              Observación de Baja
                            </label>
                            <Textarea
                              rows={2}
                              className="text-xs resize-none"
                              value={formData.observacion_baja || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  observacion_baja: e.target.value,
                                }))
                              }
                              placeholder="Detalles adicionales sobre la baja..."
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="zootecnia" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Categoría / Etapa *</label>
                    <Select
                      value={formData.categoria || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          categoria: value as Exclude<Bovino["categoria"], null>,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Seleccione etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.genero === "Macho"
                          ? ETAPAS_MACHO
                          : ETAPAS_HEMBRA
                        ).map((etapa) => (
                          <SelectItem key={etapa} value={etapa}>
                            {etapa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Propósito Zootécnico</label>
                    <Select
                      value={formData.proposito || "Doble Propósito"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, proposito: value }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPOSITOS_DISPONIBLES.map((prop) => (
                          <SelectItem key={prop} value={prop}>
                            {prop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Fecha de Nacimiento</label>
                    <Input
                      type="date"
                      className="h-9 text-sm"
                      value={formData.fecha_nacimiento || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fecha_nacimiento: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Origen</label>
                    <Input
                      className="h-9 text-sm"
                      value={formData.origen || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, origen: e.target.value }))
                      }
                      placeholder="Ej. Nacido en finca"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="genealogia" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Madre Registrada</label>
                    <Select
                      value={formData.madre_id || "none"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          madre_id: value === "none" ? null : value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Sin madre">
                          {madreActual
                            ? `Arete: ${madreActual.arete}${
                                madreActual.nombre ? ` - ${madreActual.nombre}` : ""
                              }`
                            : "Sin madre registrada"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin madre registrada</SelectItem>
                        {posiblesMadres.map((madre) => (
                          <SelectItem key={madre.id} value={madre.id}>
                            {madre.arete} {madre.nombre ? `- ${madre.nombre}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Padre Registrado</label>
                    <Select
                      value={formData.padre_id || "none"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          padre_id: value === "none" ? null : value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Sin padre">
                          {padreActual
                            ? `Arete: ${padreActual.arete}${
                                padreActual.nombre ? ` - ${padreActual.nombre}` : ""
                              }`
                            : "Sin padre registrado"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin padre registrado</SelectItem>
                        {posiblesPadres.map((padre) => (
                          <SelectItem key={padre.id} value={padre.id}>
                            {padre.arete} {padre.nombre ? `- ${padre.nombre}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Notas Adicionales
                  </label>
                  <Textarea
                    rows={2}
                    className="text-sm resize-none"
                    value={formData.observaciones || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                    placeholder="Señas particulares, notas de manejo..."
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