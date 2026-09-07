"use client";

import { useState } from "react";
import { useOrdeños } from "./hooks/useOrdeno";
import { useBovinos } from "@/modules/inventario/hooks/usebovinos";
import OrdeñoTable from "./components/OrdenoTable";
import OrdeñoFormModal from "./components/OrdenoFormModal";
import OrdeñoFiltersDrawer from "./components/OrdenoFiltersDrawer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Ordeño } from "./schemas";

export default function OrdeñoPage() {
  const {
    ordeños,
    allOrdeños,
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
    setFiltros,
  } = useOrdeños();

  const { allBovinos } = useBovinos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrdeño, setSelectedOrdeño] = useState<Ordeño | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [ordeñoAEliminar, setOrdeñoAEliminar] = useState<Ordeño | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedOrdeño(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ordeño: Ordeño) => {
    setSelectedOrdeño(ordeño);
    setIsModalOpen(true);
  };

const handleApplyFilters = (nuevosFiltros: {
    busqueda: string;
    jornada: string;
    fechaInicio: string;
    fechaFin: string;
  }) => {
    setFiltros({
      busqueda: nuevosFiltros.busqueda,
      turno: nuevosFiltros.jornada,
      fecha: nuevosFiltros.fechaInicio,
    });
  };

  const handleConfirmDelete = async () => {
    if (!ordeñoAEliminar) return;

    try {
      setDeleting(true);
      await handleDelete(ordeñoAEliminar.id);
      setOrdeñoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar el registro de ordeño:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <OrdeñoTable
        data={ordeños}
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleEdit}
        onDelete={(id) => {
          const registro = allOrdeños.find((o) => o.id === id);
          if (registro) setOrdeñoAEliminar(registro);
        }}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
        onFilters={() => setIsFilterOpen(true)}
      />

      <OrdeñoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedOrdeño}
        bovinos={allBovinos}
      />

      <OrdeñoFiltersDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={handleApplyFilters}
      />

      <ConfirmModal
        isOpen={!!ordeñoAEliminar}
        onClose={() => setOrdeñoAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title="¿Eliminar este registro de ordeño?"
        message={`Estás a punto de eliminar permanentemente el registro de ordeño del ${
          ordeñoAEliminar?.fecha || ""
        } (${ordeñoAEliminar?.jornada || ""}). Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}