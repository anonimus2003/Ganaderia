'use client';

import React, { useState, useMemo } from "react";
import BovinoTable from "@/modules/inventario/components/BovinoTable";
import BovinoFormModal from "@/modules/inventario/components/BovinoFormModal";
import DetailInventario from "@/modules/inventario/components/DetailInventario";
import FilterBar from "@/components/ui/FilterBar";
import { useBovinos } from "@/modules/inventario/hooks/usebovinos";
import { useModuloPermissions } from "@/hooks/useModuloPermissions";
import { Bovino } from "@/modules/inventario/schemas";
import { X } from "lucide-react";

export default function InventarioPage() {
  const { 
    bovinos, 
    allBovinos, // 👈 Extraemos allBovinos del hook para la genealogía
    loading, 
    handleSave, 
    handleDelete,
    page, 
    total, 
    nextPage, 
    prevPage, 
    PAGE_SIZE 
  } = useBovinos();
  
  const { permisos, loading: loadingPermisos } = useModuloPermissions("inventario");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBovino, setSelectedBovino] = useState<Bovino | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({ busqueda: "", estado: "" });

  const filteredBovinos = useMemo(() => {
    return bovinos.filter(bovino => {
      const coincideBusqueda = 
        bovino.arete.toLowerCase().includes(filterValues.busqueda.toLowerCase()) ||
        (bovino.nombre && bovino.nombre.toLowerCase().includes(filterValues.busqueda.toLowerCase()));
      const coincideEstado = !filterValues.estado || bovino.estado === filterValues.estado;
      return coincideBusqueda && coincideEstado;
    });
  }, [bovinos, filterValues]);

  const handleOpenCreate = () => {
    if (!permisos.puede_crear) return;
    setSelectedBovino(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bovino: Bovino) => {
    if (!permisos.puede_editar) return;
    setSelectedBovino(bovino);
    setIsModalOpen(true);
  };

  if (loadingPermisos) return <div className="p-6 text-center">Cargando permisos...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
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
        permisos={permisos}
      />

      {/* Panel Lateral de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/25 backdrop-blur-xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Filtrar Inventario</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FilterBar
              filters={[
                { id: "busqueda", type: "text", placeholder: "Buscar por arete o nombre..." },
                { 
                  id: "estado", 
                  type: "select", 
                  placeholder: "Estado Productivo", 
                  options: [
                    { label: "Ternera en lactancia", value: "Ternera en lactancia" },
                    { label: "Destete", value: "Destete" },
                    { label: "En producción", value: "En producción" },
                    { label: "Seca", value: "Seca" },
                    { label: "Macho", value: "Macho" }
                  ] 
                }
              ]}
              values={filterValues}
              onChange={(id, val) => {
                setFilterValues(prev => ({ ...prev, [id]: val }));
              }}
              onReset={() => {
                setFilterValues({ busqueda: "", estado: "" });
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Crear / Editar */}
      <BovinoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedBovino}
        bovinosDisponibles={allBovinos}
      />
      
      {/* Modal de Expediente / Detalles */}
      <DetailInventario 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        bovino={selectedBovino}
        bovinosDisponibles={allBovinos} // 👈 ¡Aquí está la clave para que traduzca los UUIDs de los padres a aretes y nombres!
      />
    </div>
  );
}