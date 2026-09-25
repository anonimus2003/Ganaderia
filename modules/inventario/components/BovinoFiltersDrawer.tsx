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

import { FiltrosBovino } from "../hooks/usebovinos";

interface BovinoFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: FiltrosBovino) => void;
}

export default function BovinoFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
}: BovinoFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [genero, setGenero] = React.useState("todos");
  const [condicion, setCondicion] = React.useState("Activo");
  const [categoria, setCategoria] = React.useState("todas");
  const [origen, setOrigen] = React.useState("todos");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({
        busqueda,
        genero,
        condicion,
        categoria,
        origen,
      });
    }

    toast("Filtros de inventario aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Condición: ${condicion} | Género: ${genero}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setGenero("todos");
    setCondicion("Activo");
    setCategoria("todas");
    setOrigen("todos");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        genero: "todos",
        condicion: "Activo",
        categoria: "todas",
        origen: "todos",
      });
    }

    toast("Filtros restablecidos", {
      description: "Se muestran todos los registros activos.",
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
            Filtrar Inventario Bovino
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Refina la búsqueda por arete/nombre, categoría, género y condición.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Búsqueda por Arete o Nombre */}
          <div className="space-y-2">
            <Label htmlFor="busqueda-arete" className="text-sm font-medium text-foreground">
              Número de Arete o Nombre
            </Label>
            <Input
              id="busqueda-arete"
              placeholder="Ej: 0045 o Lucero"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 px-3 text-sm rounded-md bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="select-categoria" className="text-sm font-medium text-foreground">
                Categoría
              </Label>
              <Select
                value={categoria}
                onValueChange={(v) => setCategoria(v ?? "todas")}
              >
                <SelectTrigger id="select-categoria" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  <SelectItem value="Ternera en lactancia">Ternera en lactancia</SelectItem>
                  <SelectItem value="Destete">Destete</SelectItem>
                  <SelectItem value="Ternera en crecimiento">Ternera en crecimiento</SelectItem>
                  <SelectItem value="Levante">Levante</SelectItem>
                  <SelectItem value="Novilla en desarrollo">Novilla en desarrollo</SelectItem>
                  <SelectItem value="Novilla de vientre">Novilla de vientre</SelectItem>
                  <SelectItem value="Vaca">Vaca</SelectItem>
                   <SelectItem value="Toro">Toro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Género */}
            <div className="space-y-2">
              <Label htmlFor="select-genero" className="text-sm font-medium text-foreground">
                Género
              </Label>
              <Select
                value={genero}
                onValueChange={(v) => setGenero(v ?? "todos")}
              >
                <SelectTrigger id="select-genero" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los géneros</SelectItem>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condición */}
            <div className="space-y-2">
              <Label htmlFor="select-condicion" className="text-sm font-medium text-foreground">
                Condición Operativa
              </Label>
              <Select
                value={condicion}
                onValueChange={(v) => setCondicion(v ?? "Activo")}
              >
                <SelectTrigger id="select-condicion" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="todos">Todas las condiciones</SelectItem>
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