"use client";

import { useState } from "react";
import { usePesajes } from "./hooks/usePesajes";
import PesajeTable from "./components/PesajeTable";
import PesajeFormModal from "./components/PesajeFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Pesaje } from "./schemas";
import { useBovinos } from "@/modules/inventario/hooks/usebovinos";

export default function PesajesPage() {
  const {
    pesajes,
    allPesajes,
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
    setFiltros,
  } = usePesajes();

  const { allBovinos } = useBovinos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPesaje, setSelectedPesaje] = useState<Pesaje | null>(null);
  const [pesajeAEliminar, setPesajeAEliminar] = useState<Pesaje | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedPesaje(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pesaje: Pesaje) => {
    setSelectedPesaje(pesaje);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pesajeAEliminar) return;

    try {
      setDeleting(true);
      await handleDelete(pesajeAEliminar.id);
      setPesajeAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar el pesaje:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PesajeTable
        data={pesajes}
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleEdit}
        onDelete={(id) => {
          const registro = allPesajes.find((p) => p.id === id);
          if (registro) setPesajeAEliminar(registro);
        }}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
      />

      <PesajeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSave}
        pesajeAEditar={selectedPesaje}
        bovinosList={allBovinos} // <--- Pasamos la lista completa real aquí

      />

      <ConfirmModal
        isOpen={!!pesajeAEliminar}
        onClose={() => setPesajeAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar registro de pesaje?`}
        message={`Estás a punto de eliminar permanentemente este registro de peso del bovino con arete "${
          pesajeAEliminar?.bovinos?.arete || "S/A"
        }". Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}