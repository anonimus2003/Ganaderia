'use client';

import { MedicamentoRecord, getMedicamentosColumns } from "./MedicamentosColumns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, SlidersHorizontal, Pill, ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { exportToPDF } from "@/lib/utils/exportUtils";
import { useExportData } from "@/hooks/useExportData";

interface MedicamentosTableProps {
  data: MedicamentoRecord[];
  loading: boolean;
  onAddRecord: () => void;
  onEdit: (item: MedicamentoRecord) => void;
  onDelete: (item: MedicamentoRecord) => void;
  onFilters: () => void;
  page: number;
  total: number;
  pageSize: number;
  nextPage: () => void;
  prevPage: () => void;
  onRowClick?: (item: MedicamentoRecord) => void;
  permisos?: {
    puede_ver: boolean;
    puede_crear: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export default function MedicamentosTable({
  data,
  loading,
  onAddRecord,
  onEdit,
  onDelete,
  onFilters,
  page,
  total,
  pageSize,
  nextPage,
  prevPage,
  onRowClick,
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true },
}: MedicamentosTableProps) {
  const { exportFromTable } = useExportData();

  const columns = getMedicamentosColumns({
    onEdit,
    onDelete,
    permisos,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Control de Medicamentos</h1>
            <p className="text-xs text-slate-500">Registro histórico de aplicaciones sanitarias y periodos de retiro. Total: {total}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {onFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFilters}
              className="flex items-center gap-1.5 text-xs h-9"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportFromTable("medicamentos", "*")}
            className="text-xs h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF(data)}
            className="text-xs h-9"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            PDF
          </Button>

          <Button
            size="sm"
            onClick={onAddRecord}
            disabled={!permisos.puede_crear}
            className="flex items-center gap-1.5 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nueva Aplicación
          </Button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-10 text-slate-400">
                    Cargando registros de medicamentos...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-10 text-slate-400">
                    No hay registros de medicamentos disponibles.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, rowIndex) => (
                  <TableRow
                    key={item.id || rowIndex}
                    className={onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column, colIndex) => {
                      const value = item[column.accessor as keyof MedicamentoRecord];
                      return (
                        <TableCell
                          key={colIndex}
                          onClick={(event) => {
                            if (column.accessor === "acciones" || column.accessor === "id") {
                              event.stopPropagation();
                            }
                          }}
                        >
                          {column.render ? column.render(item) : (value as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINACIÓN */}
        <div className="px-6 py-4 border-t flex justify-between items-center bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages || 1}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={page <= 1 || loading}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={page >= totalPages || loading}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}