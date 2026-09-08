'use client';

import ActionDropdown from "@/components/ui/ActionDropdown";
import { Medicamento } from "../schemas";
import { Pencil, Trash2 } from "lucide-react";
import { calcularEstadoRetiro } from "../utils/utils";

export type MedicamentoRecord = Medicamento;

export interface Column {
  header: string;
  accessor: keyof MedicamentoRecord | string;
  render?: (item: MedicamentoRecord) => React.ReactNode;
}

interface GetMedicamentosColumnsProps {
  onEdit?: (item: MedicamentoRecord) => void;
  onDelete?: (itemOrId: MedicamentoRecord | string) => void;
  onViewDetails?: (item: MedicamentoRecord) => void;
  permisos?: {
    puede_ver: boolean;
    puede_crear: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export const getMedicamentosColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true },
}: GetMedicamentosColumnsProps): Column[] => [
  {
    header: "Bovino",
    accessor: "bovinos",
    render: (item) => {
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
    header: "Medicamento/Dosis",
    accessor: "medicamento",
    render: (item) => (
      <div>
        <span className="font-medium text-slate-800 block">{item.medicamento}</span>
        <span className="text-xs text-slate-400">{item.dosis} • {item.via}</span>
      </div>
    )
  },
  {
    header: "Fecha de Aplicación",
    accessor: "fecha_aplicacion",
  },
  {
    header: "Período de Retiro (Días)",
    accessor: "fecha_aplicacion",
    render: (item) => {
      const retiroLeche = calcularEstadoRetiro(item.fecha_aplicacion, item.retiro_leche);
      const retiroCarne = calcularEstadoRetiro(item.fecha_aplicacion, item.retiro_carne);

      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-medium text-slate-500 w-11">Leche:</span>
            <span className={`font-semibold ${retiroLeche.esApto ? "text-emerald-600" : "text-rose-600"}`}>
              {item.retiro_leche} días
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-slate-500 w-11">Carne:</span>
            <span className={`font-semibold ${retiroCarne.esApto ? "text-emerald-600" : "text-rose-600"}`}>
              {item.retiro_carne} días
            </span>
          </div>
        </div>
      );
    }
  },
  {
    header: "Liberación",
    accessor: "id",
    render: (item) => {
      const retiroLeche = calcularEstadoRetiro(item.fecha_aplicacion, item.retiro_leche);
      const retiroCarne = calcularEstadoRetiro(item.fecha_aplicacion, item.retiro_carne);

      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-medium text-slate-400 w-11">Leche:</span>
            <span className={`font-semibold ${retiroLeche.esApto ? "text-emerald-600" : "text-rose-600"}`}>
              {retiroLeche.esApto ? "Liberado" : retiroLeche.fechaLibre}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-slate-400 w-11">Carne:</span>
            <span className={`font-semibold ${retiroCarne.esApto ? "text-emerald-600" : "text-rose-600"}`}>
              {retiroCarne.esApto ? "Liberado" : retiroCarne.fechaLibre}
            </span>
          </div>
        </div>
      );
    }
  },
  {
    header: "Veterinario y Motivo",
    accessor: "veterinario",
    render: (item) => (
      <div className="text-xs">
        <span className="font-medium text-slate-700 block">{item.veterinario}</span>
        {item.motivo && (
          <span className="text-slate-400 truncate max-w-[140px] block" title={item.motivo}>
            {item.motivo}
          </span>
        )}
      </div>
    )
  },
  {
    header: "",
    accessor: "acciones",
    render: (item) => (
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
