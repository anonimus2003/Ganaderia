"use client";

import { useState } from "react";
import { useUsuarios } from "./hooks/useUsuarios";
import { UsuariosTable } from "./components/UsuariosTable";
import { UsuarioModal } from "./components/UsuarioModal";
import { createUsuario, updateUsuario, deleteUsuario } from "./actions/userActions";
import { Usuario } from "./schemas";

export default function UsuariosModule() {
  const { data, loading, page, total, nextPage, prevPage, pageSize, refresh } = useUsuarios();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (formData: any) => {
    setActionLoading(true);
    try {
      if (selectedUser?.id) {
        await updateUsuario(selectedUser.id, formData);
      } else {
        await createUsuario(formData);
      }
      setIsModalOpen(false);
      refresh();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!usuario.id) return;
    if (confirm(`¿Estás seguro de eliminar a ${usuario.nombre}?`)) {
      await deleteUsuario(usuario.id);
      refresh();
    }
  };

  return (
    <div className="p-6">
      <UsuariosTable
        data={data}
        loading={loading}
        page={page}
        total={total}
        pageSize={pageSize}
        nextPage={nextPage}
        prevPage={prevPage}
        onAddRecord={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={selectedUser}
        loading={actionLoading}
      />
    </div>
  );
}