// modules/reproduccion/index.tsx
'use client';

import { useState } from 'react';
import { useReproduccion } from './hooks/useReproduccion';
import ReproduccionTable from './components/ReproduccionTable';
import FiltrosReproduccionModal from './components/ReproduccionFiltersDrawer';
import ReproduccionFormModal from './components/ReproduccionFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { FiltrosReproduccion, Reproduccion } from './schemas';
import { crearReproduccion, actualizarReproduccion } from './actions/reproduccion.actions';
import { toast } from 'sonner';

export default function ReproduccionIndex() {
  const porPagina = 10;
  
  const [filtros, setFiltros] = useState<FiltrosReproduccion>({
    bovino: '',
    estado: '',
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const {
    reproducciones,
    loading,
    page,
    total,
    recargar,
    handleEliminar,
    nextPage,
    prevPage,
  } = useReproduccion(porPagina, filtros);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [reproduccionAEditar, setReproduccionAEditar] = useState<Reproduccion | null>(null);
  const [reproduccionAEliminar, setReproduccionAEliminar] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleGuardarReproduccion = async (payload: any) => {
    try {
      let resultado;
      if (payload.id) {
        resultado = await actualizarReproduccion(payload.id, payload);
      } else {
        resultado = await crearReproduccion(payload);
      }
      
      if (resultado && resultado.success === false) {
        throw new Error("No se pudo completar la operación en la base de datos.");
      }
      
      toast.success(payload.id ? 'Registro de reproducción actualizado correctamente' : 'Registro de reproducción creado correctamente');
      setModalAbierto(false);
      recargar();
    } catch (error: any) {
      console.error("Error al guardar reproducción:", error);
      toast.error(error.message || 'Ocurrió un error al guardar.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!reproduccionAEliminar?.id) return;

    try {
      setDeleting(true);
      await handleEliminar(reproduccionAEliminar.id);
      
      toast.success('Registro de reproducción eliminado correctamente');
      setReproduccionAEliminar(null);
      recargar();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Ocurrió un error al intentar eliminar el registro.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <ReproduccionTable 
        data={reproducciones} 
        loading={loading} 
        onAddRecord={() => {
          setReproduccionAEditar(null);
          setModalAbierto(true);
        }}
        onEdit={(item) => {
          setReproduccionAEditar(item);
          setModalAbierto(true);
        }}
        onDelete={(item) => setReproduccionAEliminar(item)}
        onFilters={() => setDrawerAbierto(true)}
        page={page}
        total={total}
        pageSize={porPagina}
        nextPage={nextPage}
        prevPage={prevPage}
      />

      {modalAbierto && (
        <ReproduccionFormModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          reproduccionAEditar={reproduccionAEditar}
          onSuccess={handleGuardarReproduccion}
        />
      )}

      <FiltrosReproduccionModal
        isOpen={drawerAbierto}
        onClose={() => setDrawerAbierto(false)}
        filtrosActuales={filtros}
        onApplyFilters={(nuevosFiltros) => {
          setFiltros(nuevosFiltros);
        }}
      />

      <ConfirmModal
        isOpen={!!reproduccionAEliminar}
        onClose={() => setReproduccionAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar el registro de reproducción del arete "${reproduccionAEliminar?.bovinos?.arete || 'S/N'}"?`}
        message={`Estás a punto de eliminar permanentemente el registro reproductivo de "${reproduccionAEliminar?.bovinos?.nombre || 'Sin nombre'}" con arete ${reproduccionAEliminar?.bovinos?.arete || 'S/N'}. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}