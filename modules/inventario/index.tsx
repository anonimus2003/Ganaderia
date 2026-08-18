'use client';

import React, { useState, useMemo } from "react";
import BovinoTable from "@/modules/inventario/components/BovinoTable";
import BovinoFormModal from "@/modules/inventario/components/BovinoFormModal";
import DetailInventario from "@/modules/inventario/components/DetailInventario";
import FilterBar from "@/components/ui/FilterBar";
import { useBovinos } from "@/modules/inventario/hooks/usebovinos";
import { useModuloPermissions } from "@/hooks/useModuloPermissions"; // 👈 Hook reutilizable
import { Bovino } from "@/modules/inventario/schemas";
import { X } from "lucide-react";

export default function InventarioPage() {
  const { 
    bovinos, loading, handleSave, handleDelete,
    page, total, nextPage, prevPage, PAGE_SIZE 
  } = useBovinos();
  
  // 1. Usamos el hook global que detecta permisos según el módulo
  const { permisos, loading: loadingPermisos } = useModuloPermissions("inventario");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBovino, setSelectedBovino] = useState<Bovino | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({ busqueda: "", estado: "" });

  // Lógica de filtrado
  const filteredBovinos = useMemo(() => {
    return bovinos.filter(bovino => {
      const coincideBusqueda = 
        bovino.arete.toLowerCase().includes(filterValues.busqueda.toLowerCase()) ||
        (bovino.nombre && bovino.nombre.toLowerCase().includes(filterValues.busqueda.toLowerCase()));
      const coincideEstado = !filterValues.estado || bovino.estado === filterValues.estado;
      return coincideBusqueda && coincideEstado;
    });
  }, [bovinos, filterValues]);

  // Funciones de acción
  const handleOpenCreate = () => {
    if (!permisos.puede_crear) return; // Se bloquea la ejecución
    setSelectedBovino(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bovino: Bovino) => {
    if (!permisos.puede_editar) return; // Se bloquea la ejecución
    setSelectedBovino(bovino);
    setIsModalOpen(true);
  };

  // Mantenemos el estado de carga
  if (loadingPermisos) return <div className="p-6 text-center">Cargando permisos...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {/* ... (Tu código de FilterBar se mantiene igual) ... */}
      
      {/* 2. Pasamos el objeto 'permisos' a la tabla */}
      <BovinoTable 
        data={filteredBovinos} 
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onRowClick={(b) => { setSelectedBovino(b); setIsDetailModalOpen(true); }}
        onFilters={() => setShowFilters(true)} 
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
        permisos={permisos} // 👈 ¡CLAVE! Se lo pasamos a la tabla
      />

      {/* Modales */}
      <BovinoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedBovino}
      />
      <DetailInventario 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        bovino={selectedBovino}
      />
    </div>
  );
}