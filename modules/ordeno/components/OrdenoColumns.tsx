"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Ordeño } from "../schemas";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface OrdeñoColumn {
  header: string;
  accessor: keyof Ordeño | "acciones";
  render: (ordeño: Ordeño) => React.ReactNode;
}

interface GetOrdeñoColumnsProps {
  onEdit?: (ordeño: Ordeño) => void;
  onDelete?: (id: string) => void;
  permisos: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getOrdeñoColumns = ({
  onEdit,
  onDelete,
  permisos,
}: GetOrdeñoColumnsProps): OrdeñoColumn[] => [
  {
    header: "Fecha",
    accessor: "fecha",
    render: (ordeño) => (
      <span className="text-xs font-medium text-slate-900">
        {ordeño.fecha ? String(ordeño.fecha).split("T")[0] : "S/F"}
      </span>
    ),
  },

  {
    header: "Turno",
    accessor: "jornada",
    render: (ordeño) => {
      const jornada = String(ordeño.jornada || "").toLowerCase();
      const esMañana = jornada.includes("mañana") || jornada.includes("am");

      return (
        <Badge
          variant="outline"
          className={
            esMañana
              ? "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
              : "bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]"
          }
        >
          {ordeño.jornada || "General"}
        </Badge>
      );
    },
  },

  {
    header: "Bovino",
    accessor: "bovino_id",
    render: (ordeño) => (
      <div>
        <span className="font-semibold text-slate-900 block text-xs">
          {ordeño.bovinos?.arete || "Sin arete"}
        </span>
        {ordeño.bovinos?.nombre && (
          <span className="text-[11px] text-slate-500">
            {ordeño.bovinos.nombre}
          </span>
        )}
      </div>
    ),
  },

  {
    header: "Cantidad (L)",
    accessor: "litros",
    render: (ordeño) => (
      <span className="text-xs font-semibold text-blue-700 block">
        {ordeño.litros !== undefined && ordeño.litros !== null
          ? `${Number(ordeño.litros).toLocaleString()} L`
          : "-"}
      </span>
    ),
  },

  {
    header: "Concentrado (Kg)",
    accessor: "concentrado_kg",
    render: (ordeño) => (
      <span className="text-xs font-semibold text-emerald-700 block">
        {ordeño.concentrado_kg !== undefined && ordeño.concentrado_kg !== null && Number(ordeño.concentrado_kg) > 0
          ? `${Number(ordeño.concentrado_kg).toLocaleString()} kg`
          : "-"}
      </span>
    ),
  },

  {
    header: "Observaciones",
    accessor: "observaciones",
    render: (ordeño) => (
      <span className="text-xs text-slate-600">
        {ordeño.observaciones || "-"}
      </span>
    ),
  },

  {
    header: "",
    accessor: "acciones",
    render: (ordeño) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
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
            onClick={() => onEdit?.(ordeño)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={!permisos.puede_eliminar}
            onClick={() => onDelete?.(ordeño.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];