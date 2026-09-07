"use client";

import { useState } from "react";
import { useReproduccion } from "./hooks/useReproduccion";
import { ReproduccionTable } from "./components/ReproduccionTable";
import { ReproduccionFormModal } from "./components/ReproduccionFormModal";
import ReproduccionFiltersDrawer from "./components/ReproduccionFiltersDrawer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Reproduccion } from "./schemas";
import { useBovinos } from "@/modules/inventario/hooks/useBovinos";

export default function ReproduccionPage() {
  const {
    reproducciones,
    allReproducciones, // <--- Extraemos la lista completa sin paginar del hook
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
    setFiltros,
  } = useReproduccion();

  const { allBovinos } = useBovinos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReproduccion, setSelectedReproduccion] = useState<Reproduccion | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reproduccionAEliminar, setReproduccionAEliminar] = useState<Reproduccion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedReproduccion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reproduccion: Reproduccion) => {
    setSelectedReproduccion(reproduccion);
    setIsModalOpen(true);
  };

  const handleApplyFilters = (nuevosFiltros: {
    busqueda: string;
    tipo: string;
    estado: string;
    fechaInicio: string;
    fechaFin: string;
  }) => {
    setFiltros(nuevosFiltros);
  };

  const handleConfirmDelete = async () => {
    if (!reproduccionAEliminar) return;

    try {
      setDeleting(true);
      await handleDelete(reproduccionAEliminar.id);
      setReproduccionAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar el registro de reproducción:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ReproduccionTable
        data={reproducciones}
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleEdit}
        onDelete={(item) => {
          setReproduccionAEliminar(item);
        }}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
        onFilters={() => setIsFilterOpen(true)}
      />

      <ReproduccionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedReproduccion}
        bovinosList={allBovinos} // <--- Pasamos la lista completa real aquí
      />

      <ReproduccionFiltersDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={handleApplyFilters}
      />

      <ConfirmModal
        isOpen={!!reproduccionAEliminar}
        onClose={() => setReproduccionAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar el registro de reproducción del arete "${reproduccionAEliminar?.bovinos?.arete || 'S/N'}"?`}
        message={`Estás a punto de eliminar permanentemente el registro de reproducción de "${
          reproduccionAEliminar?.bovinos?.nombre || "Sin nombre"
        }" con arete ${reproduccionAEliminar?.bovinos?.arete || 'S/N'}. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}