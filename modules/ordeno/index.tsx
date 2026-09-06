"use client";

import { useState } from 'react';
import { useOrdeno } from './hooks/useOrdeno';
import { useBovinos } from '@/modules/inventario/hooks/useBovinos';
import OrdenoTable from './components/OrdenoTable';
import OrdenoFormModal from './components/OrdenoFormModal';
import OrdenoFiltersDrawer from './components/OrdenoFiltersDrawer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { crearOrdeno, actualizarOrdeno, eliminarOrdeno } from './actions/ordeno.actions';
import { Ordeno } from './schemas';
import { toast } from 'sonner';

export default function OrdenoPage() {
  const { allBovinos } = useBovinos(); // <--- Usamos allBovinos para traer absolutamente todos sin importar la paginación
  
  // Filtramos todas las hembras de la lista global
  const bovinosHembras = allBovinos.filter(
    (b) => b.genero?.toLowerCase().trim() === "hembra"
  );

  const porPagina = 10;
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    bovino: '',
    jornada: 'todas',
    fechaInicio: '',
    fechaFin: '',
  });

  const { ordenos, cargando, pagina, setPagina, total, recargar } = useOrdeno(porPagina, filtros);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [ordenoAEditar, setOrdenoAEditar] = useState<Ordeno | null>(null);
  const [ordenoAEliminar, setOrdenoAEliminar] = useState<Ordeno | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleGuardarOrdeno = async (payload: any) => {
    try {
      let resultado;
      if (payload.id) {
        resultado = await actualizarOrdeno(payload.id, payload);
      } else {
        resultado = await crearOrdeno(payload);
      }
      
      if (resultado && resultado.success === false) {
        throw new Error("No se pudo completar la operación en la base de datos.");
      }
      
      toast.success(payload.id ? 'Ordeño actualizado correctamente' : 'Ordeño creado correctamente');
      setModalAbierto(false);
      recargar();
    } catch (error: any) {
      console.error("Error al guardar ordeño:", error);
      toast.error(error.message || 'Ocurrió un error al guardar.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!ordenoAEliminar?.id) return;

    try {
      setDeleting(true);
      const resultado = await eliminarOrdeno(ordenoAEliminar.id);
      
      if (resultado && resultado.success === false) {
        toast.error('Error al eliminar el registro de ordeño');
        return;
      }
      
      toast.success('Ordeño eliminado correctamente');
      setOrdenoAEliminar(null);
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
      <OrdenoTable 
        data={ordenos} 
        loading={cargando} 
        onAddRecord={() => {
          setOrdenoAEditar(null);
          setModalAbierto(true);
        }}
        onEdit={(ordeno) => {
          setOrdenoAEditar(ordeno);
          setModalAbierto(true);
        }}
        onDelete={(id) => {
          const itemEncontrado = ordenos.find(o => o.id === id);
          if (itemEncontrado) setOrdenoAEliminar(itemEncontrado);
        }}
        onFilters={() => setDrawerAbierto(true)}
        page={pagina}
        total={total}
        pageSize={porPagina}
        nextPage={() => setPagina(p => p + 1)}
        prevPage={() => setPagina(p => Math.max(p - 1, 1))}
      />

      <OrdenoFormModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={handleGuardarOrdeno}
        initialData={ordenoAEditar}
        bovinos={bovinosHembras} // <--- Pasamos la lista completa de hembras sin restricciones de paginación
      />

      <OrdenoFiltersDrawer
        open={drawerAbierto}
        onOpenChange={setDrawerAbierto}
        onApplyFilters={(nuevosFiltros) => {
          setFiltros({
            ...nuevosFiltros,
            bovino: nuevosFiltros.busqueda,
          });
          setPagina(1);
        }}
      />

      <ConfirmModal
        isOpen={!!ordenoAEliminar}
        onClose={() => setOrdenoAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar el registro del arete "${ordenoAEliminar?.bovinos?.arete || 'S/N'}"?`}
        message={`Estás a punto de eliminar permanentemente el registro de ordeño de "${ordenoAEliminar?.bovinos?.nombre || 'Sin nombre'}" con arete ${ordenoAEliminar?.bovinos?.arete || 'S/N'}. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}