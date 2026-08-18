'use client';

import DataTable, { Column } from "@/components/ui/DataTable";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { ProduccionLeche } from "../schemas";
import { Pencil, Trash2 } from "lucide-react";
import { exportToPDF } from "@/lib/utils/exportUtils";
import { useExportData } from "@/hooks/useExportData";

interface ProduccionTableProps {
  data: ProduccionLeche[];
  loading?: boolean;
  onAddRecord?: () => void;
  onEdit?: (item: ProduccionLeche) => void;
  onDelete?: (id: string) => void;
  onView?: (item: ProduccionLeche) => void;
  onFilters?: () => void;
  // Props de Paginación
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

export default function ProduccionTable({ 
  data, 
  loading,
  onAddRecord, 
  onEdit, 
  onDelete, 
  onView,
  onFilters,
  page,
  total,
  nextPage,
  prevPage,
  pageSize,
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true }
}: ProduccionTableProps) {
  
  const { exportAll } = useExportData();
  
  const columns: Column<ProduccionLeche>[] = [
    { header: "Fecha", accessor: "fecha" },
    { 
      header: "Bovino", 
      accessor: "bovinos",
      render: (_, item) => (
        <div>
          <span className="font-semibold text-slate-800 block">
            {item.bovinos?.arete || "Sin arete"}
          </span>
          {item.bovinos?.nombre && (
            <span className="text-xs text-slate-500 block">
              {item.bovinos.nombre}
            </span>
          )}
        </div>
      )
    },
    { 
      header: "Jornada", 
      accessor: "jornada",
      render: (value) => {
        const esMañana = String(value) === "Mañana";
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-block ${
            esMañana ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-indigo-100 text-indigo-700 border-indigo-200"
          }`}>
            {value}
          </span>
        );
      }
    },
    { 
      header: "Litros (L)", 
      accessor: "litros",
      render: (value) => <span className="font-bold text-emerald-600">{value} L</span>
    },
    { 
      header: "Concentrado", 
      accessor: "concentrado_kg",
      render: (value) => `${value || 0} kg`
    },
    { 
      header: "Observaciones", 
      accessor: "observaciones",
      render: (value) => value ? String(value) : <span className="text-slate-400 italic">Sin novedades</span>
    },
    { 
      header: "", 
      accessor: "id",
      render: (_, item) => (
        <ActionDropdown actions={[
          { 
            label: "Editar", 
            icon: <Pencil className="w-4 h-4"/>, 
            onClick: () => onEdit?.(item),
            disabled: !permisos.puede_editar 
          },
          { 
            label: "Eliminar", 
            icon: <Trash2 className="w-4 h-4"/>, 
            onClick: () => onDelete?.(item.id!), 
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
        title="CONTROL DE PRODUCCIÓN DE LECHE" 
        totalLabel="Registros" 
        data={data} 
        columns={columns} 
        loading={loading}
        onAddRecord={onAddRecord}
        isAddDisabled={!permisos.puede_crear}
        onExportCSV={() => exportAll('produccion_leche', '*, bovinos(arete, nombre)')}
        onDownloadPDF={exportToPDF}
        onFilters={onFilters}
        onRowClick={onView}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={pageSize}
      />
    </div>
  );
}