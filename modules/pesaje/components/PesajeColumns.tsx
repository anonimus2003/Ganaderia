"use client";

import { Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Pesaje } from "../schemas";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PesajeColumn {
  header: string;
  accessor: keyof Pesaje | "acciones";
  render: (pesaje: Pesaje) => React.ReactNode;
}

interface GetPesajeColumnsProps {
  onEdit?: (pesaje: Pesaje) => void;
  onDelete?: (id: string) => void;
  permisos: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getPesajeColumns = ({
  onEdit,
  onDelete,
  permisos,
}: GetPesajeColumnsProps): PesajeColumn[] => [
  {
    header: "Fecha",
    accessor: "fecha",
    render: (pesaje) => (
      <span className="text-xs font-medium text-slate-900">
        {pesaje.fecha ? String(pesaje.fecha).split("T")[0] : "S/F"}
      </span>
    ),
  },

  {
    header: "Bovino",
    accessor: "bovino_id",
    render: (pesaje) => (
      <div>
        <span className="font-semibold text-slate-900 block text-xs">
          {pesaje.bovinos?.arete || "Sin arete"}
        </span>
        {pesaje.bovinos?.nombre && (
          <span className="text-[11px] text-slate-500">
            {pesaje.bovinos.nombre}
          </span>
        )}
      </div>
    ),
  },

  {
    header: "Peso & Ganancia",
    accessor: "peso_kgs",
    render: (pesaje) => {
      const peso = pesaje.peso_kgs;
      const gdp = pesaje.ganancia_diaria_kg;
      const numGdp = gdp !== undefined && gdp !== null ? Number(gdp) : null;
      const esPositiva = numGdp !== null && numGdp > 0;
      const esNegativa = numGdp !== null && numGdp < 0;

      return (
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-emerald-700 block">
            {peso !== undefined && peso !== null
              ? `${Number(peso).toLocaleString()} kg`
              : "-"}
          </span>
          {numGdp !== null ? (
            <div className="flex items-center gap-1">
              {esPositiva && <TrendingUp className="h-3 w-3 text-emerald-600" />}
              {esNegativa && <TrendingDown className="h-3 w-3 text-rose-600" />}
              {!esPositiva && !esNegativa && <Minus className="h-3 w-3 text-slate-400" />}
              <span
                className={`text-[10px] font-medium ${
                  esPositiva
                    ? "text-emerald-700"
                    : esNegativa
                    ? "text-rose-700"
                    : "text-slate-500"
                }`}
              >
                {numGdp > 0 ? `+${numGdp.toFixed(2)}` : numGdp.toFixed(2)} kg/día
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 block">Sin GDP</span>
          )}
        </div>
      );
    },
  },

  {
    header: "Condición Corporal",
    accessor: "condicion_corporal",
    render: (pesaje) => {
      const cc = pesaje.condicion_corporal;
      return (
        <div>
          <span className="text-xs font-medium text-slate-800 block">
            {cc !== undefined && cc !== null ? `CC: ${cc}` : "Sin registrar"}
          </span>
          {cc !== undefined && cc !== null && (
            <Badge
              variant="outline"
              className="bg-sky-50 text-sky-700 border-sky-200 text-[10px]"
            >
              Escala 1-5
            </Badge>
          )}
        </div>
      );
    },
  },

  {
    header: "Método",
    accessor: "metodo_pesaje",
    render: (pesaje) => (
      <span className="text-xs text-slate-600">
        {pesaje.metodo_pesaje || "-"}
      </span>
    ),
  },

  {
    header: "Estado Fisiológico",
    accessor: "estado_fisiologico",
    render: (pesaje) => (
      <span className="text-xs text-slate-600">
        {pesaje.estado_fisiologico || "-"}
      </span>
    ),
  },

  {
    header: "Responsable",
    accessor: "responsable",
    render: (pesaje) => (
      <span className="text-xs text-slate-600">
        {pesaje.responsable || "-"}
      </span>
    ),
  },

  {
    header: "Observaciones",
    accessor: "observaciones",
    render: (pesaje) => (
      <span
        className="text-xs text-slate-600 block max-w-[150px] truncate"
        title={pesaje.observaciones || ""}
      >
        {pesaje.observaciones || "-"}
      </span>
    ),
  },

  {
    header: "",
    accessor: "acciones",
    render: (pesaje) => (
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
            onClick={() => onEdit?.(pesaje)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={!permisos.puede_eliminar}
            onClick={() => onDelete?.(pesaje.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];