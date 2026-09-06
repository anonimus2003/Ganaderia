"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Bovino } from "../schemas";
import { calcularEdad } from "../utils/dateUtils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BovinoColumn {
  header: string;
  accessor: keyof Bovino | "acciones";
  render: (bovino: Bovino) => React.ReactNode;
}

interface GetColumnsProps {
  onEdit?: (bovino: Bovino) => void;
  onDelete?: (id: string, arete: string) => void;
  permisos: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getBovinoColumns = ({
  onEdit,
  onDelete,
  permisos,
}: GetColumnsProps): BovinoColumn[] => [
  {
    header: "Bovino",
    accessor: "arete",
    render: (bovino) => (
      <div>
        <span className="font-semibold text-slate-900 block text-xs">
          {bovino.arete || "S/A"}
        </span>

        {bovino.nombre && (
          <span className="text-[11px] text-slate-500">
            {bovino.nombre}
          </span>
        )}
      </div>
    ),
  },

  {
    header: "Gen - Raza",
    accessor: "genero",
    render: (bovino) => {
      const genero = String(bovino.genero || "").toLowerCase();

      const esFemenino =
        genero.includes("femenino") ||
        genero === "f" ||
        genero.includes("hembra");

      return (
        <div>
          <span
            className={
              esFemenino
                ? "text-[11px] text-rose-700"
                : "text-[11px] text-sky-700"
            }
          >
            {bovino.genero || "Sin género"}
          </span>

          <span className="text-[11px] text-slate-500 block">
            {bovino.raza || "Sin raza"}
          </span>
        </div>
      );
    },
  },

  {
    header: "Categoría",
    accessor: "categoria",
    render: (bovino) => {
      const activo =
        String(bovino.condicion || "Activo").toLowerCase() ===
        "activo";

      return (
        <div>
          <span className="text-xs font-medium text-slate-800 block">
            {bovino.categoria || "Sin categoría"}
          </span>

          <Badge
            variant="outline"
            className={
              activo
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }
          >
            {bovino.condicion || "Activo"}
          </Badge>
        </div>
      );
    },
  },

  {
    header: "Propósito",
    accessor: "proposito",
    render: (bovino) => (
      <span className="text-xs text-slate-700">
        {bovino.proposito || "-"}
      </span>
    ),
  },

  {
    header: "Edad - F. Nac.",
    accessor: "fecha_nacimiento",
    render: (bovino) => (
      <div>
        <span className="text-xs font-medium block">
          {calcularEdad(bovino.fecha_nacimiento as string)}
        </span>

        <span className="text-[11px] text-slate-500">
          {bovino.fecha_nacimiento
            ? String(bovino.fecha_nacimiento).split("T")[0]
            : "S/F"}
        </span>
      </div>
    ),
  },

  {
    header: "Origen",
    accessor: "origen",
    render: (bovino) => (
      <span className="text-xs text-slate-600">
        {bovino.origen || "-"}
      </span>
    ),
  },

  {
    header: "Obs.",
    accessor: "observaciones",
    render: (bovino) => (
      <span className="text-xs text-slate-600">
        {bovino.observaciones || "-"}
      </span>
    ),
  },

  {
    header: "",
    accessor: "acciones",
    render: (bovino) => (
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
            onClick={() => onEdit?.(bovino)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={!permisos.puede_eliminar}
            onClick={() =>
              onDelete?.(bovino.id, bovino.arete)
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
