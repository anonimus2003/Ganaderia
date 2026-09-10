"use client";

import { Usuario } from "../schemas";
import { getUsuariosColumns } from "./UsuariosColumns";

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

interface UsuariosTableProps {
  data: Usuario[];
  loading?: boolean;

  onAddRecord?: () => void;
  onEdit?: (usuario: Usuario) => void;
  onDelete?: (usuario: Usuario) => void;
  onRowClick?: (usuario: Usuario) => void;
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

export function UsuariosTable({
  data = [],
  loading = false,
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
}: UsuariosTableProps) {
  const { exportFromTable } = useExportData();

  const columns = getUsuariosColumns({
    onEdit,
    onDelete,
    permisos,
  });

  const totalPages = Math.ceil(total / pageSize) || 1;

  // Paginación local sobre la data recibida
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* HEADER RESPONSIVO */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900 text-sm sm:text-base">
            GESTIÓN DE USUARIOS
          </h2>
          <p className="text-xs text-slate-500">
            Total Usuarios: {total}
          </p>
        </div>

        {/* CONTENEDOR DE BOTONES ADAPTADO A MÓVILES */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {onFilters && (
            <Button
              variant="outline"
              onClick={onFilters}
              className="text-xs h-9 flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => exportFromTable("usuarios", "*")}
            className="text-xs h-9"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">CSV</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => exportToPDF(data)}
            className="text-xs h-9"
          >
            <FileText className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>

          <Button
            onClick={onAddRecord}
            disabled={!permisos.puede_crear}
            className="text-xs h-9 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo usuario
          </Button>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="text-xs font-semibold text-slate-700 whitespace-nowrap">
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
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-xs text-slate-500"
                >
                  No hay usuarios encontrados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <TableRow
                  key={item.id || rowIndex}
                  className={
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-50/50"
                      : "hover:bg-slate-50/50"
                  }
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="py-3 text-xs whitespace-nowrap"
                      onClick={(event) => {
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
      <div className="px-4 sm:px-6 py-4 border-t flex justify-between items-center">
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