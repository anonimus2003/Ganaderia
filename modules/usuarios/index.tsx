'use client';

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUsers, Perfil } from "./hooks/useUsers";
import { userFormSchema, UserFormValues } from "./schemas";
import { createUserAction, updateUserAction } from "./actions/userActions";
import UserTable from "./components/UserTable";
import { UserForm } from "./components/UserForm";
import FormModal from "@/components/ui/FormModal";
import {RolesPermissionsView }  from "./components/RolesPermissionsView"; // <--- Importamos el componente de permisos

export default function PerfilesPage() {
  const { users, loading, refetch, deleteUser, ...pagination } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Perfil | null>(null);

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { rol: "Trabajador" }
  });

  const handleOpenEdit = (user: Perfil) => {
    setEditingUser(user);
    methods.reset({
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email || "",
      telefono: user.telefono,
      rol: user.rol as any,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: UserFormValues) => {
    const res = editingUser 
      ? await updateUserAction(editingUser.id, data) 
      : await createUserAction(data);

    if (res.success) {
      setIsModalOpen(false);
      refetch();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* 1. Sección de la Tabla de Usuarios (CRUD que ya tenías) */}
      <UserTable 
        users={users} 
        onAddUser={() => { setEditingUser(null); methods.reset(); setIsModalOpen(true); }}
        onEdit={handleOpenEdit}
        onDelete={deleteUser}
        loading={loading}
        {...pagination}
      />

      {/* 2. Nueva Sección: Matriz de Permisos por Rol */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">CONTROL DE ACCESO Y PERMISOS</h2>
          <p className="text-xs text-slate-500">Configura qué acciones puede realizar cada rol en los módulos del sistema.</p>
        </div>
        <RolesPermissionsView />
      </div>

      {/* Modal para Crear / Editar Usuario */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <FormProvider {...methods}>
          <UserForm initialData={editingUser ? { ...editingUser, rol: editingUser.rol as any } : null} />
        </FormProvider>
      </FormModal>
    </div>
  );
}