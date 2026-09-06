"use client";

import * as React from "react";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BovinoFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: {
    busqueda: string;
    sexo: string;
    estado: string;
    categoria: string;
    origen: string;
  }) => void;
}

export default function BovinoFiltersDrawer({
  open,
  onOpenChange,
  onApplyFilters,
}: BovinoFiltersDrawerProps) {
  const [busqueda, setBusqueda] = React.useState("");
  const [sexo, setSexo] = React.useState("todos");
  const [estado, setEstado] = React.useState("Activo"); // Cambiado a "Activo" para hacer match con Supabase
  const [categoria, setCategoria] = React.useState("todas");
  const [origen, setOrigen] = React.useState("todos");

  const isMobile = useIsMobile();

  function handleConfirm() {
    onOpenChange(false);

    if (onApplyFilters) {
      onApplyFilters({ busqueda, sexo, estado, categoria, origen });
    }

    toast("Filtros de inventario aplicados", {
      description: `Búsqueda: "${busqueda || "General"}" | Categoría: ${categoria} | Sexo: ${sexo}`,
    });
  }

  function handleReset() {
    setBusqueda("");
    setSexo("todos");
    setEstado("Activo"); // Restablece al valor exacto de la base de datos
    setCategoria("todas");
    setOrigen("todos");

    if (onApplyFilters) {
      onApplyFilters({
        busqueda: "",
        sexo: "todos",
        estado: "Activo",
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
            Refina la búsqueda por identificación, categoría zootécnica, origen y estado operativo.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bloque 1: Identificación principal */}
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

          {/* Bloque 2: Contenedor en 2 columnas pulido y simétrico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="select-categoria" className="text-sm font-medium text-foreground">
                Categoría Zootécnica
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
                  <SelectItem value="ternero">Ternero</SelectItem>
                  <SelectItem value="crecimiento">En Crecimiento</SelectItem>
                  <SelectItem value="levante">Levante</SelectItem>
                  <SelectItem value="engorde">Engorde</SelectItem>
                  <SelectItem value="vaca">Vaca</SelectItem>
                  <SelectItem value="toro">Toro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <Label htmlFor="select-sexo" className="text-sm font-medium text-foreground">
                Sexo
              </Label>
              <Select 
                value={sexo} 
                onValueChange={(v) => setSexo(v ?? "todos")}
              >
                <SelectTrigger id="select-sexo" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Ambos sexos</SelectItem>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="select-estado" className="text-sm font-medium text-foreground">
                Estado Operativo
              </Label>
              <Select 
                value={estado} 
                onValueChange={(v) => setEstado(v ?? "Activo")}
              >
                <SelectTrigger id="select-estado" className="h-10 w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {/* Los values deben coincidir con lo que acepta el check constraint de Supabase ('Activo' / 'Inactivo') */}
                  <SelectItem value="Activo">Activos</SelectItem>
                  <SelectItem value="Inactivo">Inactivos</SelectItem>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer optimizado para garantizar visibilidad total de los botones */}
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