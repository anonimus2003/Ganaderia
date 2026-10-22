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

export interface FiltrosOcupacion {
  busqueda: string;
  potreroId: string;
  estadoOcupacion: string; // 'todos' | 'activos' | 'finalizados'
}

interface OcupacionFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: FiltrosOcupacion) => void;
  potrerosLista?: { id: number | string; nombre: string }[];
}

export default function OcupacionFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
  potrerosLista = [],
}: OcupacionFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [potreroId, setPotreroId] = React.useState("todos");
  const [estadoOcupacion, setEstadoOcupacion] = React.useState("todos");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({
        busqueda,
        potreroId,
        estadoOcupacion,
      });
    }

    toast("Filtros de ocupación aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Estado: ${estadoOcupacion}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setPotreroId("todos");
    setEstadoOcupacion("todos");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        potreroId: "todos",
        estadoOcupacion: "todos",
      });
    }

    toast("Filtros restablecidos", {
      description: "Se muestran todos los registros de ocupación.",
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
            Filtrar Historial de Ocupación
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Refina la búsqueda por arete/nombre del bovino, potrero o estado de ocupación.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Búsqueda por Arete o Nombre de la Vaca */}
          <div className="space-y-2">
            <Label htmlFor="busqueda-bovino" className="text-sm font-medium text-foreground">
              Número de Arete o Nombre de la Vaca
            </Label>
            <Input
              id="busqueda-bovino"
              placeholder="Ej: 0045 o Lucero"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 px-3 text-sm rounded-md bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filtrar por Potrero */}
            <div className="space-y-2">
              <Label htmlFor="select-potrero" className="text-sm font-medium text-foreground">
                Potrero
              </Label>
              <Select
                value={potreroId}
                onValueChange={(v) => setPotreroId(v ?? "todos")}
              >
                <SelectTrigger id="select-potrero" className="h-10 w-full">
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

            {/* Filtrar por Estado de Ocupación */}
            <div className="space-y-2">
              <Label htmlFor="select-estado" className="text-sm font-medium text-foreground">
                Estado
              </Label>
              <Select
                value={estadoOcupacion}
                onValueChange={(v) => setEstadoOcupacion(v ?? "todos")}
              >
                <SelectTrigger id="select-estado" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los registros</SelectItem>
                  <SelectItem value="activos">Activos en potrero</SelectItem>
                  <SelectItem value="finalizados">Salidos / Finalizados</SelectItem>
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