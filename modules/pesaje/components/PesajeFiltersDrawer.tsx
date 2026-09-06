"use client";

import * as React from "react";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FiltrosPesaje {
  busqueda: string;
  metodo: string;
  condicion: string;
  fechaInicio: string;
  fechaFin: string;
}



interface PesajeFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: {
    busqueda: string;
    metodo: string;
    condicion: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
}

export default function PesajeFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
}: PesajeFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [metodo, setMetodo] = React.useState("todos");
  const [condicion, setCondicion] = React.useState("todas");
  const [fechaInicio, setFechaInicio] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({ busqueda, metodo, condicion, fechaInicio, fechaFin });
    }

    toast("Filtros de pesaje aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Método: ${metodo}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setMetodo("todos");
    setCondicion("todas");
    setFechaInicio("");
    setFechaFin("");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        metodo: "todos",
        condicion: "todas",
        fechaInicio: "",
        fechaFin: "",
      });
    }

    toast("Filtros restablecidos", {
      description: "Se muestran todos los registros de pesaje.",
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
            Filtrar Registros de Pesaje
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Refina la búsqueda por arete, método de pesaje, condición corporal y rango de fechas.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="busqueda-pesaje" className="text-sm font-medium text-foreground">
              Número de Arete o Nombre
            </Label>
            <Input
              id="busqueda-pesaje"
              placeholder="Ej: 0045 o Lucero"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 px-3 text-sm rounded-md bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="select-metodo" className="text-sm font-medium text-foreground">
                Método de Pesaje
              </Label>
              <Select 
                value={metodo} 
                onValueChange={(v) => setMetodo(v ?? "todos")}
              >
                <SelectTrigger id="select-metodo" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los métodos</SelectItem>
                  <SelectItem value="Balanza digital">Balanza digital</SelectItem>
                  <SelectItem value="Balanza mecánica">Balanza mecánica</SelectItem>
                  <SelectItem value="Cinta pesajera">Cinta pesajera</SelectItem>
                  <SelectItem value="Estimación visual">Estimación visual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="select-condicion" className="text-sm font-medium text-foreground">
                Condición Corporal
              </Label>
              <Select 
                value={condicion} 
                onValueChange={(v) => setCondicion(v ?? "todas")}
              >
                <SelectTrigger id="select-condicion" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las condiciones</SelectItem>
                  <SelectItem value="2">CC 2.0</SelectItem>
                  <SelectItem value="2.5">CC 2.5</SelectItem>
                  <SelectItem value="3">CC 3.0</SelectItem>
                  <SelectItem value="3.5">CC 3.5</SelectItem>
                  <SelectItem value="4">CC 4.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio" className="text-sm font-medium text-foreground">
                Fecha de Inicio
              </Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-10 px-3 text-sm rounded-md bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha-fin" className="text-sm font-medium text-foreground">
                Fecha de Fin
              </Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-10 px-3 text-sm rounded-md bg-background"
              />
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