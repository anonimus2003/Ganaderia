'use client';

import DataTable, { Column } from "@/components/ui/DataTable";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { Inseminacion } from "../schemas";
import { Pencil, Trash2 } from "lucide-react";
import { exportToPDF } from "@/lib/utils/exportUtils"; 
import { useExportData } from "@/hooks/useExportData"; 

interface InseminacionTableProps {
  data: Inseminacion[];
  loading?: boolean;
  onAddRecord?: () => void;
  onEdit?: (item: Inseminacion) => void;
  onDelete?: (id: string) => void;
  onView?: (item: Inseminacion) => void;
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

export default function InseminacionTable({
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
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true },
}: InseminacionTableProps) {
  
  const { exportAll } = useExportData();
  
  const columns: Column<any>[] = [
    { header: "Fecha", accessor: "fecha_inseminacion" },
    { 
      header: "Bovino", 
      accessor: "bovino_id",
      render: (_, item: any) => (
        <div>
          {/* Número del arete arriba en negrita */}
          <span className="font-semibold text-slate-800 block">
            {item.bovinos?.arete || "Sin arete"}
          </span>
          {/* Nombre abajo en gris más pequeño */}
          {item.bovinos?.nombre && (
            <span className="text-xs text-slate-500 block">
              {item.bovinos.nombre}
            </span>
          )}
        </div>
      )
    },
    { header: "Toro - Pajilla", accessor: "toro_pajilla" },
    { 
      header: "Estado", 
      accessor: "estado",
      render: (value) => {
        const estadoStr = String(value);
        let colorClass = "bg-amber-100 text-amber-700 border-amber-200";
        if (estadoStr === "Preñada") colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (estadoStr === "Vacía") colorClass = "bg-rose-100 text-rose-700 border-rose-200";

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-block ${colorClass}`}>
            {estadoStr}
          </span>
        );
      }
    },
    { header: "Técnico", accessor: "tecnico" },
    { 
      header: "Parto Probable", 
      accessor: "fecha_probable_parto",
      render: (value) => value ? String(value) : <span className="text-slate-400 italic">No calculada</span>
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
        title="CONTROL REPRODUCTIVO E INSEMINACIONES" 
        totalLabel="total registros"
        data={data} 
        columns={columns} 
        loading={loading}
        onAddRecord={onAddRecord}
        isAddDisabled={!permisos.puede_crear}
        onExportCSV={() => exportAll('tratamientos', '*')}
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