"use client";

import { useState } from "react";
import { useMedicamentos } from "./hooks/useMedicamentos";
import MedicamentoTable from "./components/MedicamentosTable";
import MedicamentoFormModal from "./components/MedicamentoFormModal";
import MedicamentoFiltersDrawer from "./components/MedicamentosFiltersDrawer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Medicamento } from "./schemas";

export default function MedicamentosPage() {
  const {
    medicamentos,
    allMedicamentos,
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
    setFiltros,
  } = useMedicamentos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [medicamentoAEliminar, setMedicamentoAEliminar] = useState<Medicamento | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedMedicamento(null);
    setIsModalOpen(true);
  };

  const handleEdit = (medicamento: Medicamento) => {
    setSelectedMedicamento(medicamento);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!medicamentoAEliminar?.id) return;

    try {
      setDeleting(true);
      await handleDelete(medicamentoAEliminar.id);
      setMedicamentoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <MedicamentoTable
        data={medicamentos}
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleEdit}
        onDelete={(itemOrId) => {
          if (typeof itemOrId === "string") {
            const item = allMedicamentos.find((m) => m.id === itemOrId);
            if (item) setMedicamentoAEliminar(item);
          } else if (itemOrId) {
            setMedicamentoAEliminar(itemOrId);
          }
        }}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
        onFilters={() => setIsFilterOpen(true)}
      />

      <MedicamentoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSave}
        medicamentoAEditar={selectedMedicamento}
      />

      <MedicamentoFiltersDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={(filters) => {
          setFiltros({
            search: filters.busqueda,
            viaSeleccionada: filters.via === "todas" ? "" : filters.via,
            fechaInicio: filters.fechaInicio,
            fechaFin: filters.fechaFin,
          });
        }}
      />

      <ConfirmModal
        isOpen={!!medicamentoAEliminar}
        onClose={() => setMedicamentoAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar registro de "${medicamentoAEliminar?.medicamento || 'S/N'}"?`}
        message={`Estás a punto de eliminar permanentemente este registro de aplicación. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}