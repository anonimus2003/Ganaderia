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
  onDelete?: (itemOrId: string | Medicamento) => void;
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
       <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <div>
          <h2 className="font-semibold text-slate-900">
            INVENTARIO DE MEDICAMENTOS
          </h2>
          <p className="text-xs text-slate-500">
            Total Medicamentos: {total}
          </p>
        </div>

        {/* ACCIONES: En móvil se apilan, en desktop van en fila */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          
       {/* Botón Nuevo Bovino: Grande y de ancho completo en móvil (orden 1 arriba) */}
         <Button
            onClick={onAddRecord}
            disabled={!permisos.puede_crear}
            className="w-full sm:w-auto h-11 sm:h-9 text-sm sm:text-black order-1 sm:order-2 font-medium shadow-xs bg-[#D1F843] hover:bg-[#bedf3b] text-slate-900 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo medicamento
          </Button>

          {/* Grupo de botones secundarios (Filtros, CSV, PDF) distribuidos equitativamente en móvil (orden 2 abajo) */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1 ">
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

          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={`${String(column.header || column.accessor)}-${index}`}>
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
                  {columns.map((column, index) => (
                    <TableCell
                      key={`${String(column.accessor)}-${index}`}
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