'use client';
import React, { useState, useMemo } from "react";
import PesajeTable from "@/modules/pesaje/components/PesajeTable";
import PesajeFormModal from "@/modules/pesaje/components/PesajeFormModal";
import DetailPesaje from "@/modules/pesaje/components/DetailPesaje";
import FilterBar from "@/components/ui/FilterBar";
import { usePesajes } from "@/modules/pesaje/hooks/usePesajes";
import { useModuloPermissions } from "@/hooks/useModuloPermissions";
import { Pesaje } from "@/modules/pesaje/schemas";
import { X } from "lucide-react";

export default function PesajesPage() {
  const { 
    pesajes, loading, handleSave, handleDelete, 
    page, total, pesoPromedio, nextPage, prevPage, PAGE_SIZE 
  } = usePesajes();

  // 1. Cargamos los permisos reales desde la base de datos para el módulo 'pesajes'
  const { permisos, loading: loadingPermisos } = useModuloPermissions('pesajes');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Pesaje | null>(null);

  // Estados para el Modal de Detalles (Ver)
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Pesaje | null>(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({ busqueda: "", estado: "" });

  // 2. Funciones protegidas con validación de permisos
  const handleOpenCreate = () => {
    if (!permisos.puede_crear) return;
    setSelectedRegistro(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Pesaje) => {
    if (!permisos.puede_editar) return;
    setSelectedRegistro(item);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (item: Pesaje) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const filteredRegistros = useMemo(() => {
    return pesajes.filter(item => {
      const query = filterValues.busqueda?.toLowerCase().trim() || "";
      
      // Si no hay texto de búsqueda, evaluamos solo el estado
      if (!query) {
        if (!filterValues.estado) return true;
        return item.estado_fisiologico === filterValues.estado;
      }

      const arete = (item as any).bovinos?.arete?.toLowerCase() || "";
      const nombre = (item as any).bovinos?.nombre?.toLowerCase() || "";
      
      const coincideBusqueda = arete.includes(query) || nombre.includes(query);
      const coincideEstado = !filterValues.estado || item.estado_fisiologico === filterValues.estado;
      
      return coincideBusqueda && coincideEstado;
    });
  }, [pesajes, filterValues]);

  if (loadingPermisos) return <div className="p-6 text-center">Cargando permisos...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      
      {/* Panel de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/25 backdrop-blur-xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Filtrar Pesajes</h3>
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
                  placeholder: "Estado Fisiológico", 
                  options: [
                    {label: "Gestante", value: "Gestante"},
                    {label: "Vacía", value: "Vacía"},
                    {label: "Lactancia", value: "Lactancia"},
                    {label: "Crecimiento", value: "Crecimiento"},
                    {label: "Engorde", value: "Engorde"}
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

      {/* Tabla con la prop permisos conectada */}
      <PesajeTable 
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
        pesoPromedio={pesoPromedio}
        permisos={permisos}
      />

      {/* Modal de Crear / Editar */}
      <PesajeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (data?: any) => {
          if (data) {
            await handleSave(data);
          }
        }}
        pesajeAEditar={selectedRegistro}
      />

      {/* Modal de Detalles */}
      <DetailPesaje 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        pesaje={detailItem}
      />
    </div>
  );
}