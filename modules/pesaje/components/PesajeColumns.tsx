"use client";

import { Pencil, Trash2 } from "lucide-react";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { Pesaje } from "../schemas";

export interface PesajeColumn {
  header: string;
  accessor: keyof Pesaje | "id";
  render?: (value: any, item: Pesaje) => React.ReactNode;
}

interface GetPesajeColumnsProps {
  onEdit?: (item: Pesaje) => void;
  onDelete?: (item: Pesaje) => void;
  permisos?: {
    puede_ver: boolean;
    puede_crear: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export default function getPesajeColumns({
  onEdit,
  onDelete,
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true },
}: GetPesajeColumnsProps): PesajeColumn[] {
  return [
    { header: "Fecha", accessor: "fecha" },
    { 
      header: "Bovino", 
      accessor: "bovinos",
      render: (_, item) => {
        const arete = item.bovinos?.arete || "Sin arete";
        const nombre = item.bovinos?.nombre || "";
        const nombreCortado = nombre.length > 10 ? nombre.substring(0, 10) + '...' : nombre;

        return (
          <div>
            <span className="font-semibold text-slate-800 block">
              {arete}
            </span>
            {nombre && (
              <span className="text-xs text-slate-500 block truncate max-w-[100px]" title={nombre}>
                {nombreCortado}
              </span>
            )}
          </div>
        );
      }
    },
    { 
      header: "Peso (Kg)", 
      accessor: "peso_kgs",
      render: (_, item) => {
        const peso = item.peso_kgs ?? 0;
        const ganancia = item.ganancia_diaria_kg;
        
        return (
          <div>
            <span className="font-bold text-blue-600 block">{peso} kg</span>
            {ganancia !== null && ganancia !== undefined ? (
              <span className={`text-xs font-medium block ${Number(ganancia) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Number(ganancia) >= 0 ? `+${ganancia}` : ganancia} kg dif.
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic block">Primer pesaje</span>
            )}
          </div>
        );
      }
    },
    { 
      header: "Condición C.", 
      accessor: "condicion_corporal",
      render: (_, item) => {
        const estado = item.estado_fisiologico || "Sin estado fisiológico";
        const estadoCortado = estado.length > 12 ? estado.substring(0, 12) + '...' : estado;

        return (
          <div>
            {item.condicion_corporal ? (
              <span className="inline-block py-0.5 text-xs font-medium text-slate-700">
                CC: {item.condicion_corporal} / 5
              </span>
            ) : (
              <span className="text-xs text-slate-400">CC: N/A</span>
            )}
            <span className="text-xs text-slate-500 block mt-0.5 truncate max-w-[110px]" title={estado}>
              {estadoCortado}
            </span>
          </div>
        );
      }
    },
    { 
      header: "Método - Resp.", 
      accessor: "metodo_pesaje",
      render: (_, item) => {
        const metodo = item.metodo_pesaje || "Método no especificado";
        const metodoCortado = metodo.length > 10 ? metodo.substring(0, 10) + '...' : metodo;
        
        const responsable = item.responsable ? `Por: ${item.responsable}` : "Sin responsable";
        const respCortado = responsable.length > 12 ? responsable.substring(0, 12) + '...' : responsable;

        return (
          <div>
            <span className="text-xs font-medium text-slate-700 block truncate max-w-[100px]" title={metodo}>
              {metodoCortado}
            </span>
            <span className="text-xs text-slate-400 block truncate max-w-[100px]" title={responsable}>
              {respCortado}
            </span>
          </div>
        );
      }
    },
    { 
      header: "Observaciones", 
      accessor: "observaciones",
      render: (value) => {
        const obs = String(value || "").trim();
        if (!obs) return <span className="text-slate-400 italic text-xs">Sin novedades</span>;
        const obsCortada = obs.length > 12 ? obs.substring(0, 12) + '...' : obs;
        return <span className="text-xs text-slate-600 block truncate max-w-[110px]" title={obs}>{obsCortada}</span>;
      }
    },
    { 
      header: "", 
      accessor: "id",
      render: (_, item) => (
        <ActionDropdown 
          actions={[
            { 
              label: "Editar", 
              icon: <Pencil className="w-3.5 h-3.5"/>, 
              onClick: () => onEdit?.(item),
              disabled: !permisos.puede_editar
            },
            { 
              label: "Eliminar", 
              icon: <Trash2 className="w-3.5 h-3.5"/>, 
              onClick: () => onDelete?.(item),
              danger: true,
              disabled: !permisos.puede_eliminar
            },
          ]} 
        />
      )
    }
  ];
}