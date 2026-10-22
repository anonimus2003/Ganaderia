"use client";

import * as React from "react";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FiltrosAbonos {
  busqueda: string;
  potreroId: string;
  tipoAbono: string;
}

interface AbonosFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: FiltrosAbonos) => void;
  potrerosLista?: { id: number | string; nombre: string }[];
}

export default function AbonosFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
  potrerosLista = [],
}: AbonosFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [potreroId, setPotreroId] = React.useState("todos");
  const [tipoAbono, setTipoAbono] = React.useState("todos");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({
        busqueda,
        potreroId,
        tipoAbono,
      });
    }

    toast("Filtros de abonos aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Tipo: ${tipoAbono}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setPotreroId("todos");
    setTipoAbono("todos");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        potreroId: "todos",
        tipoAbono: "todos",
      });
    }

    toast("Filtros restablecidos", {
      description: "Se muestran todos los registros de abonos.",
    });
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="max-h-[92vh] sm:max-w-lg mx-auto">
        <DrawerHeader className="text-left pb-4 border-b border-border/50">
          <DrawerTitle className="text-xl font-semibold tracking-tight">
            Filtrar Historial de Abonos
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Refina la búsqueda por tipo de abono, responsable, observaciones o potrero.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Búsqueda por Tipo, Responsable u Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="busqueda-abono" className="text-sm font-medium text-foreground">
              Buscar (Tipo, Responsable u Observaciones)
            </Label><Input
              id="busqueda-abono"
              placeholder="Ej: Urea, Juan Pérez, etc."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 px-3 text-sm rounded-md bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filtrar por Potrero */}
            <div className="space-y-2">
              <Label htmlFor="select-potrero-abono" className="text-sm font-medium text-foreground">
                Potrero
              </Label>
              <Select
                value={potreroId}
                onValueChange={(v) => setPotreroId(v ?? "todos")}
              >
                <SelectTrigger id="select-potrero-abono" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar potrero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los potreros</SelectItem>
                  {potrerosLista.map((potrero) => (
                    <SelectItem key={potrero.id} value={String(potrero.id)}>
                      {potrero.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtrar por Tipo de Abono común */}
            <div className="space-y-2">
              <Label htmlFor="select-tipo-abono" className="text-sm font-medium text-foreground">
                Tipo de Abono
              </Label>
              <Select
                value={tipoAbono}
                onValueChange={(v) => setTipoAbono(v ?? "todos")}
              >
                <SelectTrigger id="select-tipo-abono" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="Urea">Urea</SelectItem>
                  <SelectItem value="Abono Orgánico">Abono Orgánico</SelectItem>
                  <SelectItem value="NPK">NPK</SelectItem>
                  <SelectItem value="Estiércol">Estiércol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border/50 pt-4 pb-6 px-6 flex flex-col gap-2.5">
          <div className="grid grid-cols-1 gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-10 font-medium text-muted-foreground hover:text-foreground"
            >
              Limpiar Filtros
            </Button>
            <Button onClick={handleConfirm} className="h-10 font-medium">
              Aplicar Filtros
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}