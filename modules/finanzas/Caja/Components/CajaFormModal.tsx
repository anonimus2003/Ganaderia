"use client";

import { useState, useEffect } from "react";
import { TransaccionCaja } from "../schemas"; 

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
  DollarSign,
  Calendar,
  FileText,
  Tag,
  CreditCard,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CajaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<TransaccionCaja>) => Promise<void>;
  transaccionAEditar?: TransaccionCaja | null;
  saving?: boolean;
}

const TIPOS_TRANSACCION = [
  { label: "Ingreso", value: "ingreso" },
  { label: "Egreso", value: "egreso" },
];

const METODOS_PAGO = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "Cheque",
  "Otro",
];

export default function CajaFormModal({
  isOpen,
  onClose,
  onSuccess,
  transaccionAEditar,
  saving = false,
}: CajaFormModalProps) {
  const [formData, setFormData] = useState<Partial<TransaccionCaja>>(
    transaccionAEditar || {
      tipo: "ingreso",
      categoria: "",
      monto: 0,
      cantidad: 1,
      fecha: new Date().toISOString().split("T")[0],
      metodo_pago: "Efectivo",
      descripcion: "",
    }
  );

  const [errorMsg, setErrorMsg] = useState("");
  const isEditing = !!transaccionAEditar;

  useEffect(() => {
    if (transaccionAEditar) {
      setFormData({
        ...transaccionAEditar,
        fecha: transaccionAEditar.fecha
          ? String(transaccionAEditar.fecha).split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        tipo: "ingreso",
        categoria: "",
        monto: 0,
        cantidad: 1,
        fecha: new Date().toISOString().split("T")[0],
        metodo_pago: "Efectivo",
        descripcion: "",
      });
    }
    setErrorMsg("");
  }, [transaccionAEditar, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setErrorMsg("");

      if (!formData.monto || Number(formData.monto) <= 0) {
        setErrorMsg("El monto debe ser mayor a 0.");
        return;
      }

      if (!formData.categoria || formData.categoria.trim() === "") {
        setErrorMsg("La categoría es obligatoria.");
        return;
      }

      const payload = { ...formData };
      if (!payload.id) {
        delete payload.id;
      }

      await onSuccess(payload);

      toast.success(
        isEditing ? "¡Transacción actualizada!" : "¡Transacción registrada!",
        {
          description: `El movimiento por $${formData.monto} se guardó correctamente.`,
        }
      );
      onClose();
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al guardar la transacción";
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
      <DialogContent className="max-h-[92vh] max-w-xl overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Editar Movimiento de Caja" : "Registrar Nuevo Movimiento"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lleva el control de los ingresos y egresos de dinero en la finca.
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
              {/* Tipo de Transacción (Ingreso / Egreso) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" /> Tipo de Movimiento *
                </label>
                <Select
                  value={formData.tipo || "ingreso"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ 
                      ...prev, 
                      tipo: (value as "ingreso" | "egreso") || undefined 
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_TRANSACCION.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoría y Monto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Categoría *
                  </label>
                  <Input
                    required
                    className="h-9 text-sm"
                    value={formData.categoria || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoria: e.target.value }))
                    }
                    placeholder="Ej. Venta de Leche, Alimento, Insumos"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Monto *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="h-9 text-sm"
                    value={formData.monto === 0 ? "" : formData.monto}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        monto: e.target.value === "" ? 0 : Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Cantidad y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Cantidad *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    className="h-9 text-sm"
                    value={formData.cantidad === 0 ? "" : formData.cantidad}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cantidad: e.target.value === "" ? 1 : Number(e.target.value),
                      }))
                    }
                    placeholder="1"
                  />
                </div>

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
              </div>

              {/* Método de Pago */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> Método de Pago *
                </label>
                <Select
                  value={formData.metodo_pago || "Efectivo"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ 
                      ...prev, 
                      metodo_pago: value || undefined 
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METODOS_PAGO.map((metodo) => (
                      <SelectItem key={metodo} value={metodo}>
                        {metodo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción / Notas */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Descripción / Observaciones
                </label>
                <Textarea
                  className="text-sm resize-none h-20"
                  value={formData.descripcion || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                  placeholder="Detalles adicionales sobre el ingreso o egreso..."
                />
              </div>
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
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar Movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}