'use client';

import DataTable, { Column } from "@/components/ui/DataTable";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { Perfil } from "../hooks/useUsers";
import { exportToPDF } from "@/lib/utils/exportUtils";
import { useExportData } from "@/hooks/useExportData";
import { Pencil, Trash2 } from "lucide-react";

interface UserTableProps {
  users: Perfil[];
  onAddUser: () => void;
  onEdit: (user: Perfil) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  page: number;
  total: number;
  nextPage: () => void;
  prevPage: () => void;
  pageSize: number;
  onFilters?: () => void;
}

export default function UserTable({ 
  users, 
  onAddUser, 
  onEdit, 
  onDelete, 
  loading = false,
  page,
  total,
  nextPage,
  prevPage,
  pageSize,
  onFilters,
}: UserTableProps) {
  
  const { exportFromTable } = useExportData();

  // Función para obtener colores según el rol
  const getRoleBadgeStyle = (rol: string) => {
    const roleLower = rol.toLowerCase();
    if (roleLower.includes("administrador") || roleLower.includes("admin")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (roleLower.includes("veterinario")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (roleLower.includes("ordeñador")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (roleLower.includes("obrero") || roleLower.includes("trabajador")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (roleLower.includes("potreros")) return "bg-sky-100 text-sky-700 border-sky-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };
  
  const columns: Column<Perfil>[] = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Apellidos", accessor: "apellidos" },
    { header: "Teléfono", accessor: "telefono" },
    { 
      header: "Rol", 
      accessor: "rol", 
      render: (rol: any) => {
        const roleString = String(rol || "Trabajador");
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border inline-block ${getRoleBadgeStyle(roleString)}`}>
            {roleString}
          </span>
        );
      }
    },
    { 
      header: "", 
      accessor: "id",
      render: (_, item) => (
        <ActionDropdown actions={[
          { label: "Editar", icon: <Pencil className="w-4 h-4"/>, onClick: () => onEdit?.(item) },
          { label: "Eliminar", icon: <Trash2 className="w-4 h-4"/>, onClick: () => onDelete?.(item.id!), danger: true },
        ]} />
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <DataTable
        title="GESTIÓN DE USUARIOS"
        totalLabel="Total Usuarios:"
        data={users}
        columns={columns}
        loading={loading}
        onAddRecord={onAddUser}
        onFilters={onFilters}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={pageSize}
        onExportCSV={() => exportFromTable('perfiles')}
        onDownloadPDF={() => exportToPDF(users)}
      />
    </div>
  );
}
