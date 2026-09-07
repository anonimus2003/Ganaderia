"use client";

import { Medicamento } from "../schemas";
import { getMedicamentosColumns } from "./MedicamentosColumns";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { exportToPDF } from "@/lib/utils/exportUtils";
import { useExportData } from "@/hooks/useExportData";

interface MedicamentoTableProps {
  data: Medicamento[];
  loading?: boolean;

  onAddRecord?: () => void;
  onEdit?: (medicamento: Medicamento) => void;
  onDelete?: (itemOrId: string | Medicamento) => void; // <-- Actualizado aquí
  onRowClick?: (medicamento: Medicamento) => void;
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

export default function MedicamentoTable({
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
  permisos = {
    puede_ver: true,
    puede_crear: true,
    puede_editar: true,
    puede_eliminar: true,
  },
}: MedicamentoTableProps) {
  const { exportFromTable } = useExportData();

  const columns = getMedicamentosColumns({
    onEdit,
    onDelete,
    permisos,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-5 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">
            INVENTARIO DE MEDICAMENTOS
          </h2>
          <p className="text-xs text-slate-500">
            Total Medicamentos: {total}
          </p>
        </div>

        <div className="flex gap-2">
          {onFilters && (
            <Button
              variant="outline"
              onClick={onFilters}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => exportFromTable("medicamentos", "*")}
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => exportToPDF(data)}
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>

          <Button
            onClick={onAddRecord}
            disabled={!permisos.puede_crear}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo medicamento
          </Button>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10"
                >
                  Cargando medicamentos...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10"
                >
                  No hay medicamentos registrados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((medicamento) => (
                <TableRow
                  key={medicamento.id}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50"
                      : ""
                  }
                  onClick={() => onRowClick?.(medicamento)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.accessor)}
                      onClick={(event) => {
                        if (column.accessor === "acciones") {
                          event.stopPropagation();
                        }
                      }}
                    >
                      {column.render ? column.render(medicamento) : String(medicamento[column.accessor as keyof Medicamento] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="px-6 py-4 border-t flex justify-between items-center">
        <span className="text-xs text-slate-500">
          Página {page} de {totalPages || 1}
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={page >= totalPages || loading}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

    </div>
  );
}