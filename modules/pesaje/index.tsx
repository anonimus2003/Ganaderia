"use client";

import { useState } from 'react';
import { usePesajes } from './hooks/usePesajes';
import { useBovinos } from '@/modules/inventario/hooks/useBovinos';
import PesajeTable from './components/PesajeTable';
import PesajeFormModal from './components/PesajeFormModal';
import PesajeFiltersDrawer from './components/PesajeFiltersDrawer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { crearPesaje, actualizarPesaje, eliminarPesaje } from './actions/pesaje.actions';
import { toast } from 'sonner';

export interface FiltrosPesaje {
  busqueda: string;
  metodo: string;
  condicion: string;
  fechaInicio: string;
  fechaFin: string;
}

export default function PesajesIndex() {
  const porPagina = 10;
  
  const [filtros, setFiltros] = useState<FiltrosPesaje>({
    busqueda: '',
    metodo: 'todos',
    condicion: 'todas',
    fechaInicio: '',
    fechaFin: '',
  });

  const { pesajes, cargando, pagina, setPagina, total, recargar } = usePesajes(porPagina, filtros);
  const { bovinos } = useBovinos(); // Carga la lista completa de animales para el selector
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [pesajeAEditar, setPesajeAEditar] = useState<any>(null);
  const [pesajeAEliminar, setPesajeAEliminar] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleGuardarPesaje = async (payload: any) => {
    try {
      let resultado;
      if (pesajeAEditar?.id) {
        resultado = await actualizarPesaje(pesajeAEditar.id, payload);
      } else {
        resultado = await crearPesaje(payload);
      }
      
      if (resultado && resultado.success === false) {
        throw new Error("No se pudo completar la operación en la base de datos.");
      }
      
      toast.success(pesajeAEditar?.id ? 'Pesaje actualizado correctamente' : 'Pesaje creado correctamente');
      setModalAbierto(false);
      setPesajeAEditar(null);
      recargar();
    } catch (error: any) {
      console.error("Error al guardar pesaje:", error);
      toast.error(error.message || 'Ocurrió un error al guardar.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!pesajeAEliminar?.id) return;

    try {
      setDeleting(true);
      const resultado = await eliminarPesaje(pesajeAEliminar.id);
      
      if (resultado && resultado.success === false) {
        toast.error('Error al eliminar el pesaje');
        return;
      }
      
      toast.success('Pesaje eliminado correctamente');
      setPesajeAEliminar(null);
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
      <PesajeTable 
        data={pesajes} 
        loading={cargando} 
        onAddRecord={() => {
          setPesajeAEditar(null);
          setModalAbierto(true);
        }}
        onEdit={(pesaje) => {
          setPesajeAEditar(pesaje);
          setModalAbierto(true);
        }}
        onDelete={(pesaje) => setPesajeAEliminar(pesaje)}
        onFilters={() => setDrawerAbierto(true)}
        page={pagina}
        total={total}
        pageSize={porPagina}
        nextPage={() => setPagina(p => p + 1)}
        prevPage={() => setPagina(p => Math.max(p - 1, 1))}
      />

      {modalAbierto && (
        <PesajeFormModal
          isOpen={modalAbierto}
          onClose={() => {
            setModalAbierto(false);
            setPesajeAEditar(null);
          }}
          initialData={pesajeAEditar}
          onSave={handleGuardarPesaje}
          bovinos={bovinos} // Se pasa el listado completo para que el formulario liste los animales disponibles
        />
      )}

      <PesajeFiltersDrawer
        open={drawerAbierto}
        onOpenChange={setDrawerAbierto}
        onApplyFilters={(nuevosFiltros) => {
          setFiltros(nuevosFiltros);
          setPagina(1);
        }}
      />

      <ConfirmModal
        isOpen={!!pesajeAEliminar}
        onClose={() => setPesajeAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar el registro del arete "${pesajeAEliminar?.bovinos?.arete || 'S/N'}"?`}
        message={`Estás a punto de eliminar permanentemente el registro de pesaje de "${pesajeAEliminar?.bovinos?.nombre || 'Sin nombre'}" con arete ${pesajeAEliminar?.bovinos?.arete || 'S/N'}. Esta acción no se puede deshacer y borrará su trazabilidad en el hato.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}