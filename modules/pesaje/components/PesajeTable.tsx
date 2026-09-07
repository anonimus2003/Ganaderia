"use client";

import { Pesaje } from "../schemas";
import { getPesajeColumns } from "./PesajeColumns";

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

interface PesajeTableProps {
  data: Pesaje[];
  loading?: boolean;

  onAddRecord?: () => void;
  onEdit?: (pesaje: Pesaje) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (pesaje: Pesaje) => void;
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

export default function PesajeTable({
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
}: PesajeTableProps) {
  const { exportFromTable } = useExportData();

  const columns = getPesajeColumns({
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
            REGISTROS DE PESAJE
          </h2>

          <p className="text-xs text-slate-500">
            Total Pesajes: {total}
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
            onClick={() =>
              exportFromTable("pesajes", "*")
            }
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
            Nuevo pesaje
          </Button>

        </div>
      </div>

      {/* TABLA */}

      <div className="overflow-x-auto">

        <Table>

          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={column.header || index}>
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
                  Cargando pesajes...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10"
                >
                  No hay pesajes registrados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((pesaje) => (
                <TableRow
                  key={pesaje.id}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50"
                      : ""
                  }
                  onClick={() =>
                    onRowClick?.(pesaje)
                  }
                >
                  {columns.map((column, index) => (
                    <TableCell
                      key={String(column.accessor || index)}
                      onClick={(event) => {
                        if (
                          column.accessor === "acciones"
                        ) {
                          event.stopPropagation();
                        }
                      }}
                    >
                      {column.render(pesaje)}
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