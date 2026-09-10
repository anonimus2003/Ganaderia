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

      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <div>
          <h2 className="font-semibold text-slate-900">
            REGISTROS DE PESAJE
          </h2>

          <p className="text-xs text-slate-500">
            Total Pesajes: {total}
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
            Nuevo pesaje
          </Button>

          {/* Grupo de botones secundarios (Filtros, CSV, PDF) distribuidos equitativamente en móvil (orden 2 abajo) */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1 ">
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
            onClick={() =>
              exportFromTable("pesajes", "*") }
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