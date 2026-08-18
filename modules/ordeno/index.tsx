'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ProduccionTable from "@/modules/ordeno/components/ProduccionTable";
import ProduccionFormModal from "@/modules/ordeno/components/ProduccionFormModal";
import FilterBar from "@/components/ui/FilterBar";
import DetailOrdene from "@/modules/ordeno/components/DetailOrdene";
import { useModuloPermissions } from "@/hooks/useModuloPermissions";
import { createClient } from "@/lib/supabase/client";
import { ProduccionLeche } from "./schemas";
import { 
  getProduccionLechePaginated, 
  deleteProduccionLeche, 
  createProduccionLeche, 
  updateProduccionLeche 
} from "@/modules/ordeno/actions/leche.actions";
import { X } from "lucide-react";

export default function ProduccionPage() {
  const supabase = createClient();
  const PAGE_SIZE = 10;

  // 1. Estados de datos y paginación acoplados a tus actions
  const [registros, setRegistros] = useState<ProduccionLeche[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 2. Estados de filtros que coinciden con FetchTablaParams
  const [filterValues, setFilterValues] = useState({
    busqueda: "",
    bovinoFiltroId: "",
    fechaInicio: "",
    fechaFin: "",
    jornada: "",
  });

  // 3. Permisos del módulo
  const { permisos, loading: loadingPermisos } = useModuloPermissions('ordeno');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<ProduccionLeche | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // 4. Carga de datos usando tu action getProduccionLechePaginated
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProduccionLechePaginated(supabase, {
        page,
        busqueda: filterValues.busqueda,
        bovinoFiltroId: filterValues.bovinoFiltroId,
        fechaInicio: filterValues.fechaInicio,
        fechaFin: filterValues.fechaFin,
      });
      setRegistros(res.registros);
      setTotal(res.totalCount);
    } catch (error) {
      console.error("Error al cargar producción:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, page, filterValues]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrado adicional en cliente para la jornada
  const filteredRegistros = useMemo(() => {
    return registros.filter(item => {
      const coincideJornada = !filterValues.jornada || item.jornada === filterValues.jornada;
      return coincideJornada;
    });
  }, [registros, filterValues.jornada]);

  // Funciones protegidas con permisos
  const handleOpenCreate = () => {
    if (!permisos.puede_crear) return;
    setSelectedRegistro(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProduccionLeche) => {
    if (!permisos.puede_editar) return;
    setSelectedRegistro(item);
    setIsModalOpen(true);
  };

  // Función para guardar (Crear o Actualizar) usando las actions correctas
  const handleSaveRegistro = async (formData: Partial<ProduccionLeche>) => {
    try {
      if (formData.id) {
        // Si tiene ID, actualizamos el registro existente
        await updateProduccionLeche(supabase, formData.id, formData);
      } else {
        // Si no tiene ID, creamos un registro nuevo
        await createProduccionLeche(supabase, formData);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Error al guardar el registro:", error);
      throw error; // Deja pasar el error para que el modal muestre la alerta
    }
  };

  const handleDelete = async (id: string) => {
    if (!permisos.puede_eliminar) return;
    if (!confirm("¿Estás seguro de eliminar este registro de ordeño?")) return;
    try {
      await deleteProduccionLeche(supabase, id);
      fetchData();
    } catch (error: any) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleRowClick = (item: ProduccionLeche) => {
    setSelectedRegistro(item);
    setIsDetailModalOpen(true);
  };

  // Paginación basada en total
  const nextPage = () => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p));
  const prevPage = () => setPage(p => Math.max(1, p - 1));

  if (loadingPermisos) return <div className="p-6 text-center">Cargando permisos...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      
      {/* Panel Lateral de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/25 backdrop-blur-xs transition-all">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Filtrar Producción</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <FilterBar
              filters={[
                { id: "busqueda", type: "text", placeholder: "Buscar por arete o nombre..." },
                { id: "jornada", type: "select", placeholder: "Jornada", options: [{label: "Mañana", value: "Mañana"}, {label: "Tarde", value: "Tarde"}] }
              ]}
              values={filterValues}
              onChange={(id, val) => {
                setFilterValues(prev => ({ ...prev, [id]: val }));
                setPage(1);
              }}
              onReset={() => {
                setFilterValues({ busqueda: "", bovinoFiltroId: "", fechaInicio: "", fechaFin: "", jornada: "" });
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Tabla conectada con permisos y acciones */}
      <ProduccionTable 
        data={filteredRegistros}
        loading={loading}
        onAddRecord={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onView={handleRowClick}
        onFilters={() => setShowFilters(true)}
        page={page - 1}
        total={total}
        nextPage={nextPage}
        prevPage={prevPage}
        pageSize={PAGE_SIZE}
        permisos={permisos}
      />

      {/* Modal de Crear / Editar */}
      <ProduccionFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRegistro}
        initialData={selectedRegistro}
      />

      {/* Modal de Detalles de Ordeño */}
      <DetailOrdene 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        ordene={selectedRegistro}
      />
      
    </div>
  );
}