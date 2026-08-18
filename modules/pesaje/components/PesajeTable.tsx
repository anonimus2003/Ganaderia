'use client';
import DataTable, { Column } from "@/components/ui/DataTable";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { Pesaje } from "../schemas";
import { Pencil, Trash2 } from "lucide-react";
import { exportToPDF } from "@/lib/utils/exportUtils"; 
import { useExportData } from "@/hooks/useExportData"; 

interface PesajeTableProps {
  data: Pesaje[];
  loading?: boolean;
  onAddRecord?: () => void;
  onEdit?: (item: Pesaje) => void;
  onDelete?: (id: string) => void;
  onView?: (item: Pesaje) => void;
  onFilters?: () => void;
  page: number;
  total: number;
  nextPage: () => void;
  prevPage: () => void;
  pageSize: number;
  pesoPromedio: number;
  permisos?: {
    puede_ver: boolean;
    puede_crear: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export default function PesajeTable({
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
  pesoPromedio,
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true },
}: PesajeTableProps) {
  
  const { exportAll } = useExportData();
  
  const columns: Column<any>[] = [
    { header: "Fecha", accessor: "fecha" },
    { 
      header: "Bovino", 
      accessor: "bovino_id",
      render: (_, item: any) => (
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
      header: "Peso (kg)", 
      accessor: "peso_kgs",
      render: (value) => <span className="font-bold text-blue-600">{value} kg</span>
    },
    { 
      header: "Cond. Corporal", 
      accessor: "condicion_corporal",
      render: (value) => value ? <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium">{value} / 5</span> : <span className="text-slate-400">N/A</span>
    },
    { 
      header: "Estado Fisiológico", 
      accessor: "estado_fisiologico",
      render: (value) => value ? String(value) : <span className="text-slate-400 italic">No especificado</span>
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
        title="CONTROL DE PESAJE Y CONDICIÓN CORPORAL" 
        totalLabel="Registros" 
        data={data} 
        columns={columns} 
        loading={loading}
        onAddRecord={onAddRecord}
        isAddDisabled={!permisos.puede_crear}
        onExportCSV={() => exportAll('pesajes', '*, bovinos(arete, nombre)')}
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