'use client';

import { useState } from 'react';
import { useMedicamentos } from './hooks/useMedicamentos';
import MedicamentosTable from './components/MedicamentosTable';
import MedicamentoFormModal from './components/MedicamentoFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { crearMedicamento, actualizarMedicamento, eliminarMedicamento } from './actions/medicamentos.actions';
import { toast } from 'sonner';
import { MedicamentoRecord } from './components/MedicamentosColumns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function MedicamentosIndex() {
  const porPagina = 10;
  
  const {
    medicamentos,
    total,
    pagina,
    setPagina,
    filtros,
    setFiltros,
    cargando,
    cargarMedicamentos,
  } = useMedicamentos();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [medicamentoAEditar, setMedicamentoAEditar] = useState<MedicamentoRecord | null>(null);
  const [medicamentoAEliminar, setMedicamentoAEliminar] = useState<MedicamentoRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tempFiltros, setTempFiltros] = useState(filtros);

  const handleGuardarMedicamento = async (payload: any) => {
    try {
      let resultado;
      if (payload.id) {
        resultado = await actualizarMedicamento(payload.id, payload);
      } else {
        resultado = await crearMedicamento(payload);
      }
      
      if (resultado && resultado.success === false) {
        throw new Error("No se pudo completar la operación en la base de datos.");
      }
      
      toast.success(payload.id ? 'Medicamento actualizado correctamente' : 'Medicamento creado correctamente');
      setModalAbierto(false);
      cargarMedicamentos();
    } catch (error: any) {
      console.error("Error al guardar medicamento:", error);
      toast.error(error.message || 'Ocurrió un error al guardar.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!medicamentoAEliminar?.id) return;

    try {
      setDeleting(true);
      const resultado = await eliminarMedicamento(medicamentoAEliminar.id);
      
      if (resultado && resultado.success === false) {
        toast.error('Error al eliminar el medicamento');
        return;
      }
      
      toast.success('Medicamento eliminado correctamente');
      setMedicamentoAEliminar(null);
      cargarMedicamentos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Ocurrió un error al intentar eliminar el registro.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <MedicamentosTable 
        data={medicamentos} 
        loading={cargando} 
        onAddRecord={() => {
          setMedicamentoAEditar(null);
          setModalAbierto(true);
        }}
        onEdit={(item: MedicamentoRecord) => {
          setMedicamentoAEditar(item);
          setModalAbierto(true);
        }}
        onDelete={(item: MedicamentoRecord) => {
          if (item) setMedicamentoAEliminar(item);
        }}
        onFilters={() => {
          setTempFiltros(filtros);
          setDrawerAbierto(true);
        }}
        page={pagina}
        total={total}
        pageSize={porPagina}
        nextPage={() => setPagina(p => p + 1)}
        prevPage={() => setPagina(p => Math.max(p - 1, 1))}
      />

      <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filtrar Medicamentos</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bovino (Arete o Nombre)</label>
              <Input
                placeholder="Ej. 001, Lucero..."
                value={tempFiltros.bovino || ""}
                onChange={(e) => setTempFiltros((prev: any) => ({ ...prev, bovino: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre del Medicamento</label>
              <Input
                placeholder="Ej. Ivermectina..."
                value={tempFiltros.medicamento || ""}
                onChange={(e) => setTempFiltros((prev: any) => ({ ...prev, medicamento: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Fecha Desde</label>
              <Input
                type="date"
                value={tempFiltros.fechaInicio || ""}
                onChange={(e) => setTempFiltros((prev: any) => ({ ...prev, fechaInicio: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Fecha Hasta</label>
              <Input
                type="date"
                value={tempFiltros.fechaFin || ""}
                onChange={(e) => setTempFiltros((prev: any) => ({ ...prev, fechaFin: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setTempFiltros({});
                  setFiltros({});
                  setPagina(1);
                  setDrawerAbierto(false);
                }}
              >
                Limpiar
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  setFiltros(tempFiltros);
                  setPagina(1);
                  setDrawerAbierto(false);
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <MedicamentoFormModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        medicamentoAEditar={medicamentoAEditar}
        onSuccess={handleGuardarMedicamento}
      />    

      <ConfirmModal
        isOpen={!!medicamentoAEliminar}
        onClose={() => setMedicamentoAEliminar(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        title={`¿Eliminar registro de ${medicamentoAEliminar?.medicamento || 'Medicamento'}?`}
        message={`Estás a punto de eliminar permanentemente el tratamiento para el bovino "${medicamentoAEliminar?.bovinos?.nombre || 'Sin nombre'}" con arete "${medicamentoAEliminar?.bovinos?.arete || 'S/N'}". Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar registro"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}