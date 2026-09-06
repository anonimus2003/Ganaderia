// modules/reproduccion/components/ReproduccionTable.tsx
'use client';

import DataTable from "@/components/ui/DataTable";
import { Reproduccion } from "../schemas";
import { getReproduccionColumns } from "./ReproduccionColumns";
import { exportToPDF } from "@/lib/utils/exportUtils"; 
import { useExportData } from "@/hooks/useExportData"; 

interface ReproduccionTableProps {
  data: Reproduccion[];
  loading?: boolean;
  onAddRecord?: () => void;
  onEdit?: (item: Reproduccion) => void;
  onDelete?: (item: Reproduccion) => void;
  onView?: (item: Reproduccion) => void;
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

export default function ReproduccionTable({
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
}: ReproduccionTableProps) {
  
  const { exportFromTable } = useExportData();
  
  const columns = getReproduccionColumns({
    onEdit,
    onDelete,
    permisos: {
      puede_editar: permisos.puede_editar,
      puede_eliminar: permisos.puede_eliminar,
    }
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable 
          title="CONTROL REPRODUCTIVO" 
          totalLabel="total registros"
          data={data} 
          columns={columns} 
          loading={loading}
          onAddRecord={onAddRecord}
          isAddDisabled={!permisos.puede_crear}
          onExportCSV={() => exportFromTable('reproducciones', '*, bovinos(arete, nombre)', 'reproducciones_completo.csv')}
          onDownloadPDF={() => exportToPDF(data)}
          onFilters={onFilters}
          onRowClick={onView}
          page={page}
          total={total}
          nextPage={nextPage}
          prevPage={prevPage}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}