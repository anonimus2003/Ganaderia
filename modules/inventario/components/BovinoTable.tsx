'use client';

import DataTable, { Column } from "@/components/ui/DataTable";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { Bovino } from "../schemas";
import { Pencil, Trash2 } from "lucide-react";
import { exportToPDF } from "@/lib/utils/exportUtils";
import { useExportData } from "@/hooks/useExportData";

interface BovinoTableProps {
  data: Bovino[];
  loading?: boolean;
  onAddRecord?: () => void;
  onEdit?: (bovino: Bovino) => void;
  onDelete?: (id: string, arete: string) => void;
  onRowClick?: (bovino: Bovino) => void;
  onFilters?: () => void;
  page: number;
  total: number;
  nextPage: () => void;
  prevPage: () => void;
  pageSize: number;
  permisos?: {
    puede_ver: boolean;
    puede_crear: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export default function BovinoTable({ 
  data, 
  loading,
  onAddRecord, 
  onEdit, 
  onDelete, 
  onRowClick, 
  onFilters,
  page,
  total,
  nextPage,
  prevPage,
  pageSize,
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true }
}: BovinoTableProps) {
  
  const { exportAll, isExporting } = useExportData();
  
  const columns: Column<Bovino>[] = [
    { 
      header: "Bovino", 
      accessor: "arete",
      render: (_, b) => (
        <div>
          <span className="font-semibold text-slate-800 block">{b.arete || "Sin arete"}</span>
          {b.nombre && <span className="text-xs text-slate-500 block">{b.nombre}</span>}
        </div>
      )
    },
    { 
      header: "Género", 
      accessor: "genero",
      render: (value) => {
        const genero = String(value || "").toLowerCase();
        const esFemenino = genero.includes("femenino") || genero === "f" || genero.includes("hembra");
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block border ${
            esFemenino 
              ? "bg-rose-100 text-rose-700 border-rose-200" 
              : "bg-sky-100 text-sky-700 border-sky-200"
          }`}>
            {value}
          </span>
        );
      }
    },
    { header: "Raza", accessor: "raza" },
    { 
      header: "Peso", 
      accessor: "peso_inicial",
      render: (value) => value ? `${value} kg` : "-"
    },
    { 
      header: "Estado", 
      accessor: "estado",
      render: (value) => {
        const estado = String(value || "").toLowerCase();
        let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
        
        if (estado.includes("producción") || estado.includes("produccion")) {
          badgeStyle = "bg-emerald-100 text-emerald-700 border-emerald-200";
        } else if (estado.includes("novilla en desarrollo")) {
          badgeStyle = "bg-amber-100 text-amber-700 border-amber-200";
        } else if (estado.includes("novilla de vientre")) {
          badgeStyle = "bg-pink-100 text-pink-700 border-pink-200";
        } else if (estado.includes("crecimiento")) {
          badgeStyle = "bg-blue-100 text-blue-700 border-blue-200";
        } else if (estado.includes("lactancia")) {
          badgeStyle = "bg-purple-100 text-purple-700 border-purple-200";
        } else if (estado.includes("destete") || estado.includes("levante")) {
          badgeStyle = "bg-indigo-100 text-indigo-700 border-indigo-200";
        } else if (estado.includes("seca")) {
          badgeStyle = "bg-orange-100 text-orange-700 border-orange-200";
        }

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-block ${badgeStyle}`}>
            {value}
          </span>
        );
      }
    },
    { 
      header: "Condición", 
      accessor: "condicion",
      render: (value, b) => {
        const condicion = String(value || "Activo");
        const esActivo = condicion === "Activo";
        
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-block w-fit ${
              esActivo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {condicion}
            </span>
            {!esActivo && b.motivo_baja && (
              <span className="text-xs text-slate-500 italic max-w-xs truncate" title={`${b.motivo_baja}${b.observacion_baja ? ` - ${b.observacion_baja}` : ""}`}>
                <strong>{b.motivo_baja}</strong> {b.observacion_baja ? `- ${b.observacion_baja}` : ""}
              </span>
            )}
          </div>
        );
      }
    },
    { 
      header: "Observaciones", 
      accessor: "observaciones",
      render: (value) => {
        const obs = String(value || "").trim();
        if (!obs) return <span className="text-slate-400 italic">Sin observaciones</span>;
        
        return (
          <span className="text-slate-600 truncate max-w-xs block" title={obs}>
            {obs}
          </span>
        );
      }
    },
    { 
      header: "", 
      accessor: "id",
      render: (_, b) => (
        <ActionDropdown actions={[
          { 
            label: "Editar", 
            icon: <Pencil className="w-4 h-4"/>, 
            onClick: () => onEdit?.(b),
            disabled: !permisos.puede_editar 
          },
          { 
            label: "Eliminar", 
            icon: <Trash2 className="w-4 h-4"/>, 
            onClick: () => onDelete?.(b.id, b.arete), 
            danger: true,
            disabled: !permisos.puede_eliminar 
          },
        ]} />
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <DataTable 
        title="REGISTROS DE ANIMALES" 
        totalLabel="Total Bovinos:"
        data={data} 
        columns={columns} 
        loading={loading}
        onAddRecord={onAddRecord}
        isAddDisabled={!permisos.puede_crear}
        onRowClick={onRowClick}
        onExportCSV={() => exportAll('bovinos', '*')} 
        onDownloadPDF={exportToPDF}
        onFilters={onFilters}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={pageSize}
      />
    </div>
  );
}