'use client';
import React, { useState, useRef, useEffect } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Edit2, Trash2, MoreVertical, Eye } from "lucide-react";
import { exportToPDF } from "@/lib/utils/exportUtils";
import { useExportData } from "@/hooks/useExportData";

interface TratamientoTableProps {
  data: any[];
  loading: boolean;
  onAddRecord: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onView?: (item: any) => void;
  onFilters: () => void;
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
  }; // 👈 1. Añadido a la interfaz
}

// Componente auxiliar actualizado para recibir y aplicar restricciones de permisos
function ActionMenu({ 
  onEdit, 
  onDelete, 
  onView, 
  permisos 
}: { 
  onEdit: () => void; 
  onDelete: () => void; 
  onView?: () => void;
  permisos: { puede_editar: boolean; puede_eliminar: boolean };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white shadow-lg border border-slate-100 z-50 py-1">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onView();
              }}
              className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver</span>
            </button>
          )}
          
          {/* 2. Botón Editar condicionado */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!permisos.puede_editar) return;
              setIsOpen(false);
              onEdit();
            }}
            disabled={!permisos.puede_editar}
            className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2 ${
              permisos.puede_editar 
                ? "text-slate-600 hover:bg-slate-50 cursor-pointer" 
                : "text-slate-300 bg-slate-50/50 cursor-not-allowed"
            }`}
          >
            <Edit2 className={`w-3.5 h-3.5 ${permisos.puede_editar ? "text-slate-400" : "text-slate-300"}`} />
            <span>Editar</span>
          </button>

          {/* 3. Botón Eliminar condicionado */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!permisos.puede_eliminar) return;
              setIsOpen(false);
              onDelete();
            }}
            disabled={!permisos.puede_eliminar}
            className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2 ${
              permisos.puede_eliminar 
                ? "text-rose-600 hover:bg-rose-50 cursor-pointer" 
                : "text-slate-300 bg-slate-50/50 cursor-not-allowed"
            }`}
          >
            <Trash2 className={`w-3.5 h-3.5 ${permisos.puede_eliminar ? "text-rose-400" : "text-slate-300"}`} />
            <span>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function TratamientoTable({
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
  permisos = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true }, // 👈 4. Valores por defecto seguros
}: TratamientoTableProps) {
  
  const { exportAll } = useExportData();

  const columns: Column<any>[] = [
    {
      header: "Bovino",
      accessor: "bovinos",
      render: (value, item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.bovinos?.arete || "Sin arete"}</span>
          {item.bovinos?.nombre && <span className="font-normal text-slate-500 block text-xs">{item.bovinos.nombre}</span>}
        </div>
      )
    },
    {
      header: "Medicamento",
      accessor: "medicamento",
      render: (value, item) => (
        <div>
          <span className="font-medium text-slate-800 block">{item.medicamento}</span>
          <span className="text-xs text-slate-400">{item.dosis}</span>
        </div>
      )
    },
    {
      header: "Vía",
      accessor: "via",
      render: (value) => (
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          {value}
        </span>
      )
    },
    {
      header: "Fecha Aplicación",
      accessor: "fecha_aplicacion",
    },
    {
      header: "Retiros (Días)",
      accessor: "tiempo_retiro",
      render: (value, item) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 font-medium">Gen: {item.tiempo_retiro}d</div>
          <div className="text-amber-600">Leche: {item.retiro_leche ?? 0}d</div>
          <div className="text-rose-600">Carne: {item.retiro_carne ?? 0}d</div>
        </div>
      )
    },
    {
      header: "Responsable",
      accessor: "veterinario",
      render: (value, item) => (
        <div>
          <span>{item.veterinario}</span>
          {item.motivo && <span className="text-xs text-slate-400 block truncate max-w-[150px]">Motivo: {item.motivo}</span>}
        </div>
      )
    },
    {
      header: "",
      accessor: "id",
      render: (value, item) => (
        <div className="text-right">
          <ActionMenu 
            onEdit={() => onEdit(item)} 
            onDelete={() => onDelete(item.id)} 
            permisos={permisos} // 👈 5. Pasamos los permisos al ActionMenu interno
          />
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <DataTable
        title="Control de Tratamientos"
        totalLabel="Total Tratamientos:"
        data={data}
        columns={columns}
        loading={loading}
        onAddRecord={onAddRecord}
        isAddDisabled={!permisos.puede_crear} // 👈 6. Bloquea el botón principal de agregar si no tiene permiso
        onFilters={onFilters}
        onRowClick={onView}
        onExportCSV={() => exportAll('tratamientos', '*, bovinos(arete, nombre)')}
        onDownloadPDF={exportToPDF}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={pageSize}
      />
    </div>
  );
}