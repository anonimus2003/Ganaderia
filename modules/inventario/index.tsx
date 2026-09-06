"use client";

import { useState } from "react";
import { useBovinos } from "./hooks/useBovinos";
import BovinoTable from "./components/BovinoTable";
import BovinoFormModal from "./components/BovinoFormModal";
import BovinoFiltersDrawer from "./components/BovinoFiltersDrawer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Bovino } from "./schemas";

export default function InventarioPage() {
  const {
    bovinos,
    allBovinos, // <--- Extraemos la lista completa sin paginar del hook
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
    setFiltros,
  } = useBovinos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBovino, setSelectedBovino] = useState<Bovino | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bovinoAEliminar, setBovinoAEliminar] = useState<Bovino | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedBovino(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bovino: Bovino) => {
    setSelectedBovino(bovino);
    setIsModalOpen(true);
  };

  const handleApplyFilters = (nuevosFiltros: {
    busqueda: string;
    sexo: string;
    estado: string;
    categoria: string;
    origen: string;
  }) => {
    setFiltros(nuevosFiltros);
  };

  const handleConfirmDelete = async () => {
    if (!bovinoAEliminar) return;

    try {
      setDeleting(true);
      await handleDelete(bovinoAEliminar.id);
      setBovinoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar el bovino:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <BovinoTable
        data={bovinos}
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleEdit}
        onDelete={(id) => {
          const animal = allBovinos.find((b) => b.id === id);
          if (animal) setBovinoAEliminar(animal);
        }}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
        onFilters={() => setIsFilterOpen(true)}
      />

      <BovinoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedBovino}
        allBovinos={allBovinos} // <--- Pasamos la lista completa real aquí
      />

      <BovinoFiltersDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={handleApplyFilters}
      />

      <ConfirmModal
        isOpen={!!bovinoAEliminar}
        onClose={() => setBovinoAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar el registro de "${bovinoAEliminar?.arete}"?`}
        message={`Estás a punto de eliminar permanentemente el expediente de "${
          bovinoAEliminar?.nombre || "Sin nombre"
        }" con arete ${bovinoAEliminar?.arete}. Esta acción no se puede deshacer y borrará su trazabilidad en el hato.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}