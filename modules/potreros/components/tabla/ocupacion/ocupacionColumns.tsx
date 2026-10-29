"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistorialOcupacionPotrero } from "@/modules/potreros/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export interface OcupacionColumn {
  header: string;
  accessor: keyof HistorialOcupacionPotrero | "acciones";
  render: (ocupacion: HistorialOcupacionPotrero) => React.ReactNode;
}

interface GetColumnsProps {
  onEdit?: (ocupacion: HistorialOcupacionPotrero) => void;
  onDelete?: (id: number) => void;
  permisos: {
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getOcupacionColumns = ({
  onEdit,
  onDelete,
  permisos,
}: GetColumnsProps): OcupacionColumn[] => [
  {
    header: "Potrero",
    accessor: "potrero_id",
    render: (ocupacion) => (
      <span className="font-semibold text-slate-900 text-xs">
        {ocupacion.potrero_id}
      </span>
    ),
  },

  {
    header: "Bovino",
    accessor: "bovinos" as any,
    render: (ocupacion: any) => {
      // Extrae el arete y el nombre según cómo vengan estructurados los datos
      const arete = ocupacion.bovinos?.arete || ocupacion.bovino_arete || "S/A";
      const nombre = ocupacion.bovinos?.nombre || ocupacion.bovino_nombre;

      return (
        <div>
          <span className="font-semibold text-slate-900 block text-xs">
            {arete}
          </span>
          {nombre && (
            <span className="text-[11px] text-slate-500 block">
              {nombre}
            </span>
          )}
        </div>
      );
    },
  },

  {
    header: "Fecha Entrada",
    accessor: "fecha_entrada",
    render: (ocupacion) => (
      <span className="text-xs text-slate-700 block">
        {ocupacion.fecha_entrada ? ocupacion.fecha_entrada.replace("T", " ").substring(0, 19) : "-"}
      </span>
    ),
  },

{
    header: "Fecha Salida",
    accessor: "fecha_salida",
    render: (ocupacion) => {
      // 🕵️‍♂️ MIRA ESTO EN LA CONSOLA DEL NAVEGADOR (F12)
      console.log("Objeto recibido en la fila:", ocupacion);

      return (
        <span className="text-xs text-slate-700 block">
          {ocupacion.fecha_salida ? ocupacion.fecha_salida.replace("T", " ").substring(0, 19) : "Activo en potrero"}
        </span>
      );
    },
  },

  {
    header: "Aforo",
    accessor: "aforo",
    render: (ocupacion) => (
      <span className="text-xs text-slate-700">
        {ocupacion.aforo !== null ? `${ocupacion.aforo}` : "-"}
      </span>
    ),
  },

  {
    header: "Registrado Por",
    accessor: "registrado_por_nombre"as any, // Debe apuntar a esta propiedad mapeada
    render: (ocupacion: any) => (
      <span className="text-xs text-slate-700 font-medium">
        {ocupacion.registrado_por_nombre || "Desconocido"}
      </span>
    ),
  },

  {
    header: "",
    accessor: "acciones",
    render: (ocupacion) => (
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
            onClick={() => onEdit?.(ocupacion)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={!permisos.puede_eliminar}
            onClick={() => onDelete?.(ocupacion.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];