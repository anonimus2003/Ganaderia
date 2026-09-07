"use client";

import { Pencil, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Reproduccion } from "../schemas";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ReproduccionColumn {
  header: string;
  accessor: keyof Reproduccion | "acciones" | string;
  render: (item: Reproduccion) => React.ReactNode;
}

interface GetReproduccionColumnsProps {
  onEdit?: (item: Reproduccion) => void;
  onDelete?: (item: Reproduccion) => void;
  permisos: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getReproduccionColumns = ({
  onEdit,
  onDelete,
  permisos,
}: GetReproduccionColumnsProps): ReproduccionColumn[] => [
  {
    header: "Fecha Inseminación",
    accessor: "fecha_inseminacion",
    render: (item) => (
      <div className="text-xs">
        <span className="font-semibold text-slate-800 block">Fecha: {item.fecha_inseminacion}</span>
        <span className="text-slate-500 block">Técnico: {item.tecnico}</span>
      </div>
    ),
  },

  {
    header: "Bovino",
    accessor: "bovinos",
    render: (item) => (
      <div>
        <span className="font-semibold text-slate-800 block">
          {String(item.bovinos?.arete || "Sin arete")}
        </span>
        {item.bovinos?.nombre && (
          <span className="text-xs text-slate-500 block">
            {String(item.bovinos.nombre)}
          </span>
        )}
      </div>
    ),
  },

  {
    header: "Reproducción",
    accessor: "toro_pajilla",
    render: (item) => (
      <div className="text-xs">
        <span className="font-medium text-slate-800 block">{item.toro_pajilla}</span>
        {item.tipo && <span className="text-slate-500 block">Tipo: {item.tipo}</span>}
        {item.numero_servicios !== undefined && item.numero_servicios !== null && (
          <span className="text-slate-400 block">Servicios: {item.numero_servicios}</span>
        )}
      </div>
    ),
  },

  {
    header: "Estado",
    accessor: "estado",
    render: (item) => {
      const estadoStr = String(item.estado ?? "Pendiente");
      let colorClass = "bg-amber-50 text-amber-800 border-amber-200";
      let Icon = Clock;
      
      if (estadoStr === "Preñada") {
        colorClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
        Icon = CheckCircle2;
      } else if (estadoStr === "Vacía") {
        colorClass = "bg-rose-50 text-rose-800 border-rose-200";
        Icon = XCircle;
      }

      return (
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm ${colorClass}`}>
            <Icon className="w-3 h-3 shrink-0" />
            {estadoStr}
          </span>
          {item.fecha_chequeo && (
            <span className="text-[11px] text-slate-500 block">Chequeo: {item.fecha_chequeo}</span>
          )}
        </div>
      );
    },
  },

  {
    header: "Partos y Proyecciones",
    accessor: "fecha_parto",
    render: (item) => (
      <div className="text-xs space-y-0.5">
        {item.fecha_probable_parto && (
          <span className="text-indigo-600 font-medium block">Probable: {item.fecha_probable_parto}</span>
        )}
        {item.fecha_parto ? (
          <span className="text-slate-800 font-semibold block">Parto Real: {item.fecha_parto}</span>
        ) : (
          <span className="text-slate-400 italic block">Sin parto registrado</span>
        )}
      </div>
    ),
  },

  {
    header: "Lactancia y Notas",
    accessor: "fecha_secado",
    render: (item) => {
      let diasLactancia: number | null = null;
      if (item.fecha_parto) {
        const fechaParto = new Date(item.fecha_parto);
        const fechaSecado = item.fecha_secado ? new Date(item.fecha_secado) : new Date();
        diasLactancia = Math.floor((fechaSecado.getTime() - fechaParto.getTime()) / (1000 * 60 * 60 * 24));
      }

      return (
        <div className="text-xs space-y-0.5">
          {item.fecha_parto ? (
            item.fecha_secado ? (
              <span className="text-indigo-600 font-semibold block">Seca: {item.fecha_secado} ({diasLactancia} días)</span>
            ) : (
              <span className="text-emerald-600 font-semibold block">En Producción: {diasLactancia} días</span>
            )
          ) : (
            <span className="text-slate-400 italic block">-</span>
          )}
          {item.observaciones && (
            <span className="text-slate-500 italic block truncate max-w-[150px]" title={item.observaciones}>
              Obs: {item.observaciones}
            </span>
          )}
        </div>
      );
    },
  },

  {
    header: "",
    accessor: "acciones",
    render: (item) => (
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
            onClick={() => onEdit?.(item)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={!permisos.puede_eliminar}
            onClick={() => onDelete?.(item)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];