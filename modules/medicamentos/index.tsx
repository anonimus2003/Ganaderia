'use client';

import React from 'react';
import { useTratamientos } from './hooks/useTratamientos';
import { TratamientosHeader } from './components/TratamientosHeader';
import { TratamientosTable } from './components/TratamientosTable';
import { TratamientoModal } from './components/TratamientoModal';

export default function TratamientosPage() {
  const {
    bovinos,
    tratamientos,
    loading,
    searchTerm,
    setSearchTerm,
    filterVia,
    setFilterVia,
    filterFecha,
    setFilterFecha,
    isModalOpen,
    setIsModalOpen,
    editingId,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    ITEMS_PER_PAGE,
    formData,
    setFormData,
    paginatedTratamientos,
    filteredTratamientos,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSubmit,
    handleDelete,
    isEnRetiro,
  } = useTratamientos();

  return (
    <div className="min-h-screen bg-[#f4f7f4] p-4 md:p-8 text-slate-800 font-sans selection:bg-emerald-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <TratamientosHeader 
          bovinos={bovinos}
          tratamientos={tratamientos}
          onOpenCreateModal={handleOpenCreateModal}
          isEnRetiro={isEnRetiro}
        />

        {/* TABLA Y FILTROS */}
        <TratamientosTable 
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterVia={filterVia}
          setFilterVia={setFilterVia}
          filterFecha={filterFecha}
          setFilterFecha={setFilterFecha}
          paginatedTratamientos={paginatedTratamientos}
          filteredTratamientos={filteredTratamientos}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          handleOpenEditModal={handleOpenEditModal}
          handleDelete={handleDelete}
          isEnRetiro={isEnRetiro}
        />

      </div>

      {/* MODAL */}
      <TratamientoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        bovinos={bovinos}
      />
    </div>
  );
}