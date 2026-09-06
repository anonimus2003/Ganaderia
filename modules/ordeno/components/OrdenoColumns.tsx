"use client";

import { Ordeno } from "../schemas";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  Pencil,
  Trash2,

} from "lucide-react";


interface GetOrdenoColumnsProps {
  onEdit?: (item: Ordeno) => void;
  onDelete?: (id: string) => void;

  permisos?: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export function getOrdenoColumns({
  onEdit,
  onDelete,
  permisos = {
    puede_editar: true,
    puede_eliminar: true,
  },
}: GetOrdenoColumnsProps) {
  return [
    {
      header: "Fecha",
      accessor: "fecha" as const,

      render: (item: Ordeno) => (
        <span className="text-sm text-slate-700">
          {item.fecha}
        </span>
      ),
    },

    {
      header: "Bovino",
      accessor: "bovinos" as const,

      render: (item: Ordeno) => (
        <div>
          <span className="font-semibold text-slate-800 block">
            {item.bovinos?.arete || "Sin arete"}
          </span>

          {item.bovinos?.nombre && (
            <span className="text-xs text-slate-500 block">
              {item.bovinos.nombre}
            </span>
          )}
        </div>
      ),
    },

    {
      header: "Jornada",
      accessor: "jornada" as const,

      render: (item: Ordeno) => {
        const esMañana = item.jornada === "Mañana";

        return (
          <span
            className={`inline-flex items-center    text-xs font-semibold ${
              esMañana
                ? "text-amber-800 "
                : " text-indigo-800 "
            }`}
          >

            {item.jornada}
          </span>
        );
      },
    },

    {
      header: "Litros (L)",
      accessor: "litros" as const,

      render: (item: Ordeno) => (
        <span className="font-semibold text-emerald-600">
          {item.litros ?? 0} L
        </span>
      ),
    },

    {
      header: "Concentrado",
      accessor: "concentrado_kg" as const,

      render: (item: Ordeno) => (
        <span className="text-slate-700">
          {item.concentrado_kg ?? 0} kg
        </span>
      ),
    },

    {
      header: "Observaciones",
      accessor: "observaciones" as const,

      render: (item: Ordeno) =>
        item.observaciones ? (
          <span className="text-slate-700">
            {item.observaciones}
          </span>
        ) : (
          <span className="text-slate-400 italic">
            Sin novedades
          </span>
        ),
    },

    {
      header: "",
      accessor: "id" as const,

      render: (item: Ordeno) => (
        <DropdownMenu>
  <DropdownMenuTrigger
    render={
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
      >
        ⋮
      </Button>
    }
  />

  <DropdownMenuContent align="end">
    <DropdownMenuItem
      disabled={!permisos.puede_editar}
      onClick={() => onEdit?.(item)}
    >
      <Pencil className="mr-2 h-4 w-4" />
      Editar
    </DropdownMenuItem>

    <DropdownMenuItem
      variant="destructive"
      disabled={!permisos.puede_eliminar}
      onClick={() => onDelete?.(item.id!)}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Eliminar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

      ),
    },
  ];
}
