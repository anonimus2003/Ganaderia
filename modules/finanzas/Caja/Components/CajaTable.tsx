"use client";

import { TransaccionCaja } from "../schemas";
import { getCajaColumns } from "./cajaColumns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface CajaTableProps {
  data: TransaccionCaja[];
  loading?: boolean;

  onAddRecord?: () => void;
  onEdit?: (transaccion: TransaccionCaja) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (transaccion: TransaccionCaja) => void;
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

export default function CajaTable({
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
}: CajaTableProps) {
  const { exportFromTable } = useExportData();

  const columns = getCajaColumns({
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
          <h2 className="font-semibold text-slate-900 text-sm sm:text-base">
            REGISTROS DE CAJA (INGRESOS Y EGRESOS)
          </h2>
          <p className="text-xs text-slate-500">
            Total Movimientos: {total}
          </p>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={onAddRecord}
            disabled={!permisos.puede_crear}
            className="w-full sm:w-auto h-11 sm:h-9 text-sm font-medium shadow-xs bg-[#D1F843] hover:bg-[#bedf3b] text-slate-900 rounded-xl order-1 sm:order-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo movimiento
          </Button>

          <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
            {onFilters && (
              <Button
                variant="outline"
                onClick={onFilters}
                className="text-xs h-9 w-full sm:w-auto justify-center"
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filtros
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => exportFromTable("caja", "*")}
              className="text-xs h-9 w-full sm:w-auto justify-center"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              CSV
            </Button>

            <Button
              variant="outline"
              onClick={() => exportToPDF(data)}
              className="text-xs h-9 w-full sm:w-auto justify-center"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
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
              {columns.map((column) => (
                <TableHead
                  key={column.header}
                  className="text-xs font-semibold text-slate-700 whitespace-nowrap"
                >
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
                  className="text-center py-10 text-xs text-slate-500"
                >
                  Cargando movimientos...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-xs text-slate-500"
                >
                  No hay movimientos registrados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((transaccion) => (
                <TableRow
                  key={transaccion.id}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50/50"
                      : "hover:bg-slate-50/50"
                  }
                  onClick={() => onRowClick?.(transaccion)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.accessor)}
                      className="py-3 text-xs whitespace-nowrap"
                      onClick={(event) => {
                        if (column.accessor === "acciones") {
                          event.stopPropagation();
                        }
                      }}
                    >
                      {column.render(transaccion)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN */}
      <div className="px-4 sm:px-6 py-4 border-t flex justify-between items-center">
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
  );
}