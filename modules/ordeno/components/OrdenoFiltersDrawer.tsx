"use client";

import * as React from "react";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrdeñoFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: {
    busqueda: string;
    jornada: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
}

export default function OrdeñoFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
}: OrdeñoFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [jornada, setJornada] = React.useState("todas");
  const [fechaInicio, setFechaInicio] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({ busqueda, jornada, fechaInicio, fechaFin });
    }

    toast("Filtros de ordeño aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Turno: ${jornada}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setJornada("todas");
    setFechaInicio("");
    setFechaFin("");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        jornada: "todas",
        fechaInicio: "",
        fechaFin: "",
      });
    }

    toast("Filtros restablecidos", {
      description: "Se muestran todos los registros de ordeño.",
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
            Filtrar Registros de Ordeño
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Refina la búsqueda por arete del animal, turno y rango de fechas.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="busqueda-arete-ordeno" className="text-sm font-medium text-foreground">
              Número de Arete o Nombre de la Vaca
            </Label>
            <Input
              id="busqueda-arete-ordeno"
              placeholder="Ej: 0045 o Lucero"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 px-3 text-sm rounded-md bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="select-jornada" className="text-sm font-medium text-foreground">
                Turno / Jornada
              </Label>
              <Select 
                value={jornada} 
                onValueChange={(v) => setJornada(v ?? "todas")}
              >
                <SelectTrigger id="select-jornada" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los turnos</SelectItem>
                  <SelectItem value="Mañana">Mañana</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Único">Único</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio" className="text-sm font-medium text-foreground">
                Fecha Desde
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
                Fecha Hasta
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