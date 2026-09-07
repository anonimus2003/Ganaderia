"use client";

import * as React from "react";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MedicamentoFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: {
    busqueda: string;
    via: string;
    veterinario: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
}

export default function MedicamentoFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
}: MedicamentoFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [via, setVia] = React.useState("todas");
  const [veterinario, setVeterinario] = React.useState("");
  const [fechaInicio, setFechaInicio] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({ busqueda, via, veterinario, fechaInicio, fechaFin });
    }

    toast("Filtros de tratamientos aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Vía: ${via}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setVia("todas");
    setVeterinario("");
    setFechaInicio("");
    setFechaFin("");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        via: "todas",
        veterinario: "",
        fechaInicio: "",
        fechaFin: "",
      });
    }

    toast("Filtros restablecidos", {
      description: "Se muestran todos los registros médicos.",
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
            Filtrar Tratamientos Médicos
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Refina la búsqueda por medicamento, arete, vía de aplicación, veterinario o rangos de fecha.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bloque 1: Medicamento o Arete */}
          <div className="space-y-2">
            <Label htmlFor="busqueda-medicamento" className="text-sm font-medium text-foreground">
              Medicamento o Número de Arete
            </Label>
            <Input
              id="busqueda-medicamento"
              placeholder="Ej: Oxitetraciclina o 0045"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 px-3 text-sm rounded-md bg-background"
            />
          </div>

          {/* Bloque 2: Contenedor en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vía de aplicación */}
            <div className="space-y-2">
              <Label htmlFor="select-via" className="text-sm font-medium text-foreground">
                Vía de Aplicación
              </Label>
              <Select 
                value={via} 
                onValueChange={(v) => setVia(v ?? "todas")}
              >
                <SelectTrigger id="select-via" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar vía" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las vías</SelectItem>
                  <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                  <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                  <SelectItem value="Endovenosa">Endovenosa</SelectItem>
                  <SelectItem value="Tópica">Tópica</SelectItem>
                  <SelectItem value="Oral">Oral</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Bloque 3: Fechas */}
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

        {/* Footer */}
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