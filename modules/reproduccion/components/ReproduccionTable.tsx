"use client";

import { Reproduccion } from "../schemas";
import { getReproduccionColumns } from "./ReproduccionColumns";

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

interface ReproduccionTableProps {
  data: Reproduccion[];
  loading?: boolean;

  onAddRecord?: () => void;
  onEdit?: (reproduccion: Reproduccion) => void;
  onDelete?: (reproduccion: Reproduccion) => void;
  onRowClick?: (reproduccion: Reproduccion) => void;
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

export function ReproduccionTable({
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
}: ReproduccionTableProps) {
  const { exportFromTable } = useExportData();

  const columns = getReproduccionColumns({
    onEdit,
    onDelete,
    permisos,
  });

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* HEADER */}

      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <div>
          <h2 className="font-semibold text-slate-900">
            REGISTROS DE REPRODUCCIÓN
          </h2>

          <p className="text-xs text-slate-500">
            Total Registros: {total}
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
            Nueva inseminación
          </Button>

          {/* Grupo de botones secundarios (Filtros, CSV, PDF) distribuidos equitativamente en móvil (orden 2 abajo) */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1 ">
            {onFilters && (
            <Button
              variant="outline"
              onClick={onFilters}
              className="text-xs h-9"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() =>
              exportFromTable("reproduccion", "*")
            }
            className="text-xs h-9"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => exportToPDF(data)}
            className="text-xs h-9"
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

          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="text-xs font-semibold text-slate-700">
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
                  Cargando registros de reproducción...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-xs text-slate-500"
                >
                  No hay registros de reproducción encontrados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={item.id || rowIndex}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50/50"
                      : "hover:bg-slate-50/50"
                  }
                  onClick={() =>
                    onRowClick?.(item)
                  }
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="py-3 text-xs"
                      onClick={(event) => {
                        // Prevenir row click si se da click en la columna de acciones o botones
                        if (colIndex === columns.length - 1) {
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

      <div className="px-6 py-4 border-t flex justify-between items-center">

        <span className="text-xs text-slate-500">
          Página {page} de {totalPages}
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