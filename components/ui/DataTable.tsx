'use client';

import React, { useState, useEffect } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  totalLabel?: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onAddRecord?: () => void;
  isAddDisabled?: boolean; // <--- 1. Prop agregada para deshabilitar el botón de agregar
  onExportCSV?: () => void;
  onDownloadPDF?: () => void;
  onColumns?: () => void;
  onAnalytics?: () => void;
  onAIInfo?: () => void;
  onFilters?: () => void;
  onRowClick?: (item: T) => void;
  // Props opcionales para paginación externa (Base de datos)
  page?: number;
  total?: number;
  nextPage?: () => void;
  prevPage?: () => void;
  pageSize?: number;
}

export default function DataTable<T>({ 
  title, 
  totalLabel = "Total Bovinos:", 
  data, 
  columns, 
  onAddRecord, 
  isAddDisabled = false, // <--- 2. Recibida en las destructuraciones por defecto en false
  onExportCSV, 
  onDownloadPDF,
  onFilters,
  onRowClick, 
  page,
  total,
  nextPage,
  prevPage,
  pageSize = 10
}: DataTableProps<T>) {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'long' };
      const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
      
      const weekday = now.toLocaleDateString('es-ES', optionsDate);
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const time = now.toLocaleTimeString('es-ES', optionsTime);
      
      setCurrentDateTime(`${capitalizedWeekday} ${time}`);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const isExternalPagination = page !== undefined && total !== undefined && nextPage && prevPage;
  
  const totalPages = isExternalPagination 
    ? Math.ceil(total / pageSize) || 1 
    : Math.ceil(data.length / pageSize) || 1;

  const currentDisplayData = isExternalPagination 
    ? data 
    : data.slice((page || 0) * pageSize, ((page || 0) + 1) * pageSize);

  const handleNext = () => {
    if (isExternalPagination) {
      nextPage?.();
    }
  };

  const handlePrev = () => {
    if (isExternalPagination) {
      prevPage?.();
    }
  };

  return (
    <div className="w-full min-w-0 bg-white py-5 rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      
      {/* Header Superior - CORREGIDO */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 px-6">
  
  {/* Título: ocupa espacio a la izquierda, evita que se comprima demasiado */}
  <div className="min-w-0 flex-1">
    <h2 className="text-xl font-bold text-slate-800 tracking-tight truncate">{title}</h2>
  </div>

  {/* Contenedor de Tarjetas: ahora usando flex-nowrap para que no se bajen a la izquierda */}
  <div className="flex items-center gap-3 shrink-0">
    <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
      <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider whitespace-nowrap">
        {totalLabel}
      </span>
      <span className="font-bold text-slate-800 text-sm sm:text-base">
        {isExternalPagination ? total : data.length}
      </span>
    </div>

    <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
      <img src="/tiempo.png" alt="Tiempo" className="w-4 h-4 object-contain" />
      <span className="font-semibold text-slate-700 text-sm whitespace-nowrap">
        {currentDateTime || "Cargando..."}
      </span>
    </div>
  </div>
</div>


      {/* Barra de Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-5 px-6">
        <div className="flex items-center">
          {onAddRecord && (
            <button 
              onClick={onAddRecord} 
              disabled={isAddDisabled} // <--- 3. Atributo HTML disabled aplicado
              className={`flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all w-full md:w-auto ${
                isAddDisabled 
                  ? "bg-slate-200 border border-slate-200 text-slate-400 cursor-not-allowed opacity-80 shadow-none" // <--- Estilo en gris deshabilitado
                  : "bg-[#D1F843] border border-[#D1F843] hover:bg-[#c3e63a] text-zinc-950 hover:shadow-md cursor-pointer" // <--- Estilo activo normal
              }`}
            >
              <img src="/mas.png" alt="Agregar" className={`w-3 h-3 object-contain ${isAddDisabled ? "opacity-40" : "brightness-0"}`} />
              <span>Agregar registro</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onExportCSV && (
            <button onClick={onExportCSV} className="flex items-center justify-center gap-2 text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl font-medium shadow-xs transition-all flex-1 md:flex-initial cursor-pointer">
              <img src="/descargas excel.png" alt="CSV" className="w-4 h-4 object-contain" />
              <span>Exportar CSV</span>
            </button>
          )}
          {onDownloadPDF && (
            <button onClick={onDownloadPDF} className="flex items-center justify-center gap-2 text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl font-medium shadow-xs transition-all flex-1 md:flex-initial cursor-pointer">
              <img src="/descargar pdf.png" alt="PDF" className="w-4 h-4 object-contain" />
              <span>Descargar PDF</span>
            </button>
          )}
          {onFilters && (
            <button onClick={onFilters} className="flex items-center justify-center gap-2 text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl font-medium shadow-xs transition-all flex-1 md:flex-initial cursor-pointer">
              <img src="/filtrar.png" alt="Filtros" className="w-4 h-4 object-contain" />
              <span>Filtros</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Tabla y Paginación */}
      <div className="border-y border-slate-200 w-full mt-4">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-black bg-gray-50 border-b border-slate-200">
                {columns.map((c, i) => (
                  <th key={i} className="py-3 px-6 font-bold whitespace-nowrap">{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 bg-white">
              {currentDisplayData.length > 0 ? (
                currentDisplayData.map((item, i) => (
                  <tr 
                    key={i} 
                    onClick={() => onRowClick?.(item)} 
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 cursor-pointer transition-colors"
                  >
                    {columns.map((c, j) => (
                      <td key={j} className="py-3.5 px-6 whitespace-nowrap">
                        {c.render ? c.render(item[c.accessor], item) : String(item[c.accessor])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                    No hay registros disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isExternalPagination && (
        <div className="flex items-center justify-between p-4 bg-white">
          <span className="text-xs text-slate-400 font-medium">{total} registros en total</span>
          <div className="flex gap-2">
            <button onClick={handlePrev} disabled={(page || 0) === 0} className="px-4 py-2 bg-slate-100 rounded-xl text-sm disabled:opacity-30 hover:bg-slate-200">Anterior</button>
            <button onClick={handleNext} disabled={((page || 0) + 1) * pageSize >= (total || 0)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm disabled:opacity-30 hover:bg-slate-200">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}