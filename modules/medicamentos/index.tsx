'use client';
import React, { useState, useMemo } from "react";
import TratamientoTable from "./components/TratamientosTable";
import TratamientoFormModal from "./components/TratamientoFormModal";
import DetailTratamiento from "./components/DetailTratamiento";
import FilterBar from "@/components/ui/FilterBar";
import { useTratamientos } from "./hooks/useTratamientos";
import { useModuloPermissions } from "@/hooks/useModuloPermissions";
import { Tratamiento, viasEnum } from "./schemas";
import { X } from "lucide-react";

export default function TratamientosPage() {
  const { 
    tratamientos, loading, handleSave, handleDelete, 
    page, total, nextPage, prevPage, PAGE_SIZE 
  } = useTratamientos();

  // 1. Cargamos los permisos reales desde la base de datos para el módulo 'tratamientos'
  const { permisos, loading: loadingPermisos } = useModuloPermissions('medicamentos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Tratamiento | null>(null);
  
  // Estados para el Modal de Detalles (Ver)
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Tratamiento | null>(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({ busqueda: "", via: "" });

  // 2. Funciones protegidas con validación de permisos
  const handleOpenCreate = () => {
    if (!permisos.puede_crear) return;
    setSelectedRegistro(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Tratamiento) => {
    if (!permisos.puede_editar) return;
    setSelectedRegistro(item);
    setIsModalOpen(true);
  };

  // Función para abrir el modal de detalles al hacer clic en una fila o ver
  const handleOpenDetail = (item: Tratamiento) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const filteredRegistros = useMemo(() => {
    return tratamientos.filter(item => {
      const arete = (item as any).bovinos?.arete?.toLowerCase() || "";
      const medicamento = item.medicamento?.toLowerCase() || "";
      const query = filterValues.busqueda.toLowerCase();
      
      const coincideBusqueda = arete.includes(query) || medicamento.includes(query);
      const coincideVia = !filterValues.via || item.via === filterValues.via;
      
      return coincideBusqueda && coincideVia;
    });
  }, [tratamientos, filterValues]);

  if (loadingPermisos) return <div className="p-6 text-center">Cargando permisos...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      
      {/* Panel Lateral de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/25 backdrop-blur-xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Filtrar Tratamientos</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FilterBar
              filters={[
                { id: "busqueda", type: "text", placeholder: "Buscar por arete o medicamento..." },
                { 
                  id: "via", 
                  type: "select", 
                  placeholder: "Vía de aplicación", 
                  options: viasEnum.map(v => ({ label: v, value: v }))
                }
              ]}
              values={filterValues}
              onChange={(id, val) => setFilterValues(prev => ({ ...prev, [id]: val }))}
              onReset={() => setFilterValues({ busqueda: "", via: "" })}
            />
          </div>
        </div>
      )}

      {/* Tabla con permisos conectados */}
      <TratamientoTable 
        data={filteredRegistros}
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={(id) => {
          if (!permisos.puede_eliminar) return;
          handleDelete(id);
        }}
        onView={handleOpenDetail}
        onFilters={() => setShowFilters(true)}
        page={page}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
        permisos={permisos}
      />

      {/* Modal de Formulario (Crear / Editar) */}
      <TratamientoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedRegistro}
      />

      {/* Modal de Detalles */}
      <DetailTratamiento 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        tratamiento={detailItem}
      />
    </div>
  );
}