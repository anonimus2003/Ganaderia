"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HistorialAbono } from "@/modules/potreros/schemas"; // Ajusta la ruta a tu archivo schemas

export interface AbonoColumn {
  header: string;
  accessor: keyof HistorialAbono | "acciones";
  render: (abono: HistorialAbono) => React.ReactNode;
}

interface GetColumnsProps {
  onEdit?: (abono: HistorialAbono) => void;
  onDelete?: (id: string) => void; // El id en abonos es un uuid (string)
  permisos: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getAbonosColumns = ({
  onEdit,
  onDelete,
  permisos,
}: GetColumnsProps): AbonoColumn[] => [
  {
    header: "Potrero",
    accessor: "potrero_id",
    render: (abono) => (
      <span className="font-semibold text-slate-900 text-xs">
        Potrero #{abono.potrero_id}
      </span>
    ),
  },

  {
    header: "Tipo de Abono",
    accessor: "tipo_abono",
    render: (abono) => (
      <div>
        <span className="font-medium text-slate-900 block text-xs">
          {abono.tipo_abono}
        </span>
        {abono.observaciones && (
          <span className="text-[11px] text-slate-500 truncate max-w-[150px] block" title={abono.observaciones}>
            {abono.observaciones}
          </span>
        )}
      </div>
    ),
  },

  {
    header: "Cantidad",
    accessor: "cantidad",
    render: (abono) => (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
        {abono.cantidad} {abono.unidad_medida}
      </Badge>
    ),
  },

  {
    header: "Fecha Aplicación",
    accessor: "fecha_aplicacion",
    render: (abono) => (
      <span className="text-xs text-slate-700 block">
        {abono.fecha_aplicacion ? String(abono.fecha_aplicacion).split("T")[0] : "-"}
      </span>
    ),
  },

  {
    header: "Responsable",
    accessor: "responsable",
    render: (abono) => (
      <span className="text-xs text-slate-700">
        {abono.responsable || "-"}
      </span>
    ),
  },

  {
    header: "Registrado Por",
     accessor: "registrado_por_nombre"as any, // Debe apuntar a esta propiedad mapeada
    render: (abono: any) => (
      <span className="text-xs text-slate-700 font-medium">
        {abono.registrado_por_nombre || "Desconocido"}
      </span>
    ),
  },

  {
    header: "",
    accessor: "acciones",
    render: (abono) => (
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
            onClick={() => onEdit?.(abono)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={!permisos.puede_eliminar}
            onClick={() => onDelete?.(abono.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];