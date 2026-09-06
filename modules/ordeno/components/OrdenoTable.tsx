"use client";

import { Ordeno } from "../schemas";
import { getOrdenoColumns } from "./OrdenoColumns";

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

interface OrdenoTableProps {
  data: Ordeno[];
  loading?: boolean;

  onAddRecord?: () => void;
  onEdit?: (item: Ordeno) => void;
  onDelete?: (id: string) => void;
  onView?: (item: Ordeno) => void;
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

export default function OrdenoTable({
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
  permisos = {
    puede_ver: true,
    puede_crear: true,
    puede_editar: true,
    puede_eliminar: true,
  },
}: OrdenoTableProps) {
  const { exportFromTable } = useExportData();

  const columns = getOrdenoColumns({
    onEdit,
    onDelete,
    permisos,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* HEADER */}

      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

        <div>
          <h2 className="font-semibold text-slate-900">
            CONTROL DE ORDEÑO
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Total Registros:{" "}
            <span className="font-semibold text-slate-700">
              {total}
            </span>
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
            type="button"
            variant="outline"
            onClick={() =>
              exportFromTable("ordeño", "*")
            }
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => exportToPDF(data)}
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>

          <Button
            type="button"
            onClick={onAddRecord}
            disabled={!permisos.puede_crear}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo ordeño
          </Button>

        </div>
      </div>

      {/* TABLA */}

      <div className="overflow-x-auto">

        <Table>

          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessor)}
                  className="text-xs font-semibold text-slate-600 whitespace-nowrap"
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
                  className="text-center py-10 text-sm text-slate-500"
                >
                  Cargando registros...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-sm text-slate-500"
                >
                  No hay registros de ordeño.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className={
                    onView
                      ? "cursor-pointer hover:bg-slate-50"
                      : "hover:bg-slate-50"
                  }
                  onClick={() => onView?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${item.id}-${String(column.accessor)}`}
                      className="text-xs"
                      onClick={(event) => {
                        if (column.header === "Acciones") {
                          event.stopPropagation();
                        }
                      }}
                    >
                      {column.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}

          </TableBody>

        </Table>

      </div>

      {/* PAGINACIÓN */}

      <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">

        <span className="text-xs text-slate-500">
          Página{" "}
          <span className="font-semibold text-slate-700">
            {page}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-slate-700">
            {totalPages || 1}
          </span>
        </span>

        <div className="flex gap-2">

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={page <= 1 || loading}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />

            <span className="sr-only">
              Página anterior
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={
              page >= totalPages || loading
            }
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />

            <span className="sr-only">
              Página siguiente
            </span>
          </Button>

        </div>

      </div>

    </div>
  );
}
