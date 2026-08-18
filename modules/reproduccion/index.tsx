'use client';
import React, { useState, useMemo } from "react";
import InseminacionTable from "@/modules/reproduccion/components/InseminacionTable";
import InseminacionFormModal from "@/modules/reproduccion/components/InseminacionFormModal";
import DetailInseminacion from "@/modules/reproduccion/components/DetailInseminacion";
import FilterBar from "@/components/ui/FilterBar";
import { useInseminaciones } from "@/modules/reproduccion/hooks/useInseminacion";
import { useModuloPermissions } from "@/hooks/useModuloPermissions";
import { Inseminacion } from "@/modules/reproduccion/schemas";
import { X } from "lucide-react";

export default function ReproduccionPage() {
  const { 
    inseminaciones, loading, handleSave, handleDelete, 
    page, total, nextPage, prevPage, PAGE_SIZE 
  } = useInseminaciones();

  // 1. Cargamos los permisos reales desde la base de datos para el módulo 'reproduccion'
  const { permisos, loading: loadingPermisos } = useModuloPermissions('reproduccion');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Inseminacion | null>(null);
  
  // Estados para el Modal de Detalles (Ver)
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Inseminacion | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({ busqueda: "", estado: "" });

  // 2. Funciones protegidas con validación de permisos
  const handleOpenCreate = () => {
    if (!permisos.puede_crear) return;
    setSelectedRegistro(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Inseminacion) => {
    if (!permisos.puede_editar) return;
    setSelectedRegistro(item);
    setIsModalOpen(true);
  };

  // Función para abrir el modal de detalles al hacer clic en una fila o ver
  const handleOpenDetail = (item: Inseminacion) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const filteredRegistros = useMemo(() => {
    return inseminaciones.filter(item => {
      const arete = (item as any).bovinos?.arete?.toLowerCase() || "";
      const query = filterValues.busqueda.toLowerCase();
      const coincideBusqueda = arete.includes(query);
      const coincideEstado = !filterValues.estado || item.estado === filterValues.estado;
      return coincideBusqueda && coincideEstado;
    });
  }, [inseminaciones, filterValues]);

  if (loadingPermisos) return <div className="p-6 text-center">Cargando permisos...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      
      {/* Panel de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/25 backdrop-blur-xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Filtrar Inseminaciones</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FilterBar
              filters={[
                { id: "busqueda", type: "text", placeholder: "Buscar por arete..." },
                { 
                  id: "estado", 
                  type: "select", 
                  placeholder: "Estado", 
                  options: [
                    { label: "Pendiente", value: "Pendiente" },
                    { label: "Preñada", value: "Preñada" },
                    { label: "Vacía", value: "Vacía" }
                  ] 
                }
              ]}
              values={filterValues}
              onChange={(id, val) => setFilterValues(prev => ({ ...prev, [id]: val }))}
              onReset={() => setFilterValues({ busqueda: "", estado: "" })}
            />
          </div>
        </div>
      )}

      {/* Tabla con permisos conectados */}
      <InseminacionTable 
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

      {/* Modal de Crear / Editar */}
      <InseminacionFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedRegistro}
      />

      {/* Modal de Detalles */}
      <DetailInseminacion 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        registro={detailItem}
      />
    </div>
  );
}