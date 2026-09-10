import { Usuario } from "../schemas";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface GetUsuariosColumnsProps {
  onEdit?: (usuario: Usuario) => void;
  onDelete?: (usuario: Usuario) => void;
  permisos: {
    puede_ver: boolean;
    puede_crear: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
  };
}

export function getUsuariosColumns({ onEdit, onDelete, permisos }: GetUsuariosColumnsProps) {
  return [
    { header: "Nombre", render: (item: Usuario) => item.nombre },
    { header: "Apellido", render: (item: Usuario) => item.apellidos },
    { header: "Email", render: (item: Usuario) => item.email || "-" },
    { header: "Teléfono", render: (item: Usuario) => item.telefono || "-" },
    { header: "Rol", render: (item: Usuario) => item.rol },
    {
      header: "Acciones",
      render: (item: Usuario) => (
        <div className="flex gap-2">
          {permisos.puede_editar && (
            <Button variant="ghost" size="icon" onClick={() => onEdit?.(item)}>
              <Pencil className="w-4 h-4 text-slate-500" />
            </Button>
          )}
          {permisos.puede_eliminar && (
            <Button variant="ghost" size="icon" onClick={() => onDelete?.(item)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}