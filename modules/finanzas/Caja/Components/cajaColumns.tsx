"use client";

import { Pencil, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { TransaccionCaja } from "../schemas";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface CajaColumn {
  header: string;
  accessor: keyof TransaccionCaja | "acciones";
  render: (transaccion: TransaccionCaja) => React.ReactNode;
}

interface GetCajaColumnsProps {
  onEdit?: (transaccion: TransaccionCaja) => void;
  onDelete?: (id: string) => void;
  permisos: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getCajaColumns = ({
  onEdit,
  onDelete,
  permisos,
}: GetCajaColumnsProps): CajaColumn[] => [
  {
    header: "Fecha",
    accessor: "fecha",
    render: (transaccion) => (
      <span className="text-xs font-medium text-slate-800">
        {transaccion.fecha ? String(transaccion.fecha).split("T")[0] : "S/F"}
      </span>
    ),
  },
  {
    header: "Tipo",
    accessor: "tipo",
    render: (transaccion) => {
      const esIngreso = String(transaccion.tipo || "").toLowerCase() === "ingreso";

      return (
        <Badge
          variant="outline"
          className={
            esIngreso
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit"
              : "bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1 w-fit"
          }
        >
          {esIngreso ? (
            <ArrowDownLeft className="h-3 w-3" />
          ) : (
            <ArrowUpRight className="h-3 w-3" />
          )}
          {esIngreso ? "Ingreso" : "Egreso"}
        </Badge>
      );
    },
  },
  {
    header: "Categoría",
    accessor: "categoria",
    render: (transaccion) => (
      <span className="text-xs font-semibold text-slate-900 block">
        {transaccion.categoria || "Sin categoría"}
      </span>
    ),
  },
  {
    header: "Detalle",
    accessor: "descripcion",
    render: (transaccion) => (
      <span className="text-xs text-slate-600 block max-w-xs truncate" title={transaccion.descripcion || ""}>
        {transaccion.descripcion || "-"}
      </span>
    ),
  },
  {
    header: "Cantidad",
    accessor: "cantidad" as any,
    render: (transaccion: any) => (
      <span className="text-xs text-slate-700 font-medium">
        {transaccion.cantidad ?? 1}
      </span>
    ),
  },
  {
    header: "Monto",
    accessor: "monto",
    render: (transaccion) => {
      const esIngreso = String(transaccion.tipo || "").toLowerCase() === "ingreso";
      const montoNum = Number(transaccion.monto || 0);

      return (
        <span
          className={`text-xs font-bold ${
            esIngreso ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {esIngreso ? "+" : "-"}${montoNum.toFixed(2)}
        </span>
      );
    },
  },
  {
    header: "Registrado Por",
    accessor: "registrado_por_nombre" as any,
    render: (transaccion: any) => (
      <span className="text-xs text-slate-700 font-medium">
        {transaccion.registrado_por_nombre || "Desconocido"}
      </span>
    ),
  },
  {
    header: "",
    accessor: "acciones",
    render: (transaccion) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild = {true} {...({} as any)}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            ⋮
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!permisos.puede_editar}
            onClick={() => onEdit?.(transaccion)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-rose-600 focus:text-rose-600"
            disabled={!permisos.puede_eliminar}
            onClick={() => transaccion.id && onDelete?.(transaccion.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];