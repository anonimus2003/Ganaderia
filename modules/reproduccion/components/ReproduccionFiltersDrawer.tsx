"use client";

import * as React from "react";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReproduccionFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: {
    busqueda: string;
    tipo: string;
    estado: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
}

export default function ReproduccionFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
}: ReproduccionFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [tipo, setTipo] = React.useState("todos");
  const [estado, setEstado] = React.useState("todos");
  const [fechaInicio, setFechaInicio] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({ busqueda, tipo, estado, fechaInicio, fechaFin });
    }

    toast("Filtros de reproducción aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Tipo: ${tipo} | Estado: ${estado}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setTipo("todos");
    setEstado("todos");
    setFechaInicio("");
    setFechaFin("");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        tipo: "todos",
        estado: "todos",
        fechaInicio: "",
        fechaFin: "",
      });
    }

    toast("Filtros restablecidos", {
      description: "Se muestran todos los registros de reproducción.",
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
            Filtrar Registros de Reproducción
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Refina la búsqueda por arete, tipo de servicio, estado del proceso y rango de fechas.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bloque 1: Identificación principal (Arete o Nombre) */}
          <div className="space-y-2">
            <Label htmlFor="busqueda-reproduccion" className="text-sm font-medium text-foreground">
              Número de Arete o Nombre de la Vaca
            </Label>
            <Input
              id="busqueda-reproduccion"
              placeholder="Ej: 0045 o Lucero"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 px-3 text-sm rounded-md bg-background"
            />
          </div>

          {/* Bloque 2: Contenedor en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Servicio */}
            <div className="space-y-2">
              <Label htmlFor="select-tipo" className="text-sm font-medium text-foreground">
                Tipo de Servicio
              </Label>
              <Select 
                value={tipo} 
                onValueChange={(v) => setTipo(v ?? "todos")}
              >
                <SelectTrigger id="select-tipo" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="I.Artificial">Inseminación Artificial</SelectItem>
                  <SelectItem value="Monta Natural">Monta Natural</SelectItem>
                  <SelectItem value="Transf.Embrion">Transferencia de Embriones</SelectItem>
                   <SelectItem value="Celo no servido">Celo no servido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado Operativo */}
            <div className="space-y-2">
              <Label htmlFor="select-estado" className="text-sm font-medium text-foreground">
                Estado del Proceso
              </Label>
              <Select 
                value={estado} 
                onValueChange={(v) => setEstado(v ?? "todos")}
              >
                <SelectTrigger id="select-estado" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Confirmada">Confirmada</SelectItem>
                  <SelectItem value="Fallida">Fallida</SelectItem>
                  <SelectItem value="Gestante">Gestante</SelectItem>
                 
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bloque 3: Rango de Fechas */}
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
            <Button onClick={handleConfirm} className="h-10 font-medium bg-emerald-600 hover:bg-emerald-700 text-white">
              Aplicar Filtros
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}