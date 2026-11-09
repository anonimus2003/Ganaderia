"use client";

import { useState, useEffect, useCallback } from "react";
import { TransaccionCaja, FiltrosCaja } from "./schemas";
import {
  getCajaAction,
  saveCajaAction,
  deleteCajaAction,
} from "./actions/caja.actions"; // Asegúrate de crear este archivo de acciones más adelante
import CajaTable from "./Components/CajaTable";
import CajaFormModal from "./Components/CajaFormModal";
import { toast } from "sonner";

export default function CajaModule() {
  const [data, setData] = useState<TransaccionCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transaccionAEditar, setTransaccionAEditar] = useState<TransaccionCaja | null>(null);
  const [saving, setSaving] = useState(false);

  // Filtros (Opcional, puedes expandirlo según necesites)
  const [filtros] = useState<FiltrosCaja>({});

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const resultado = await getCajaAction(page, pageSize, filtros);
      setData(resultado.data);
      setTotal(resultado.total);
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar caja";
      toast.error("Error", { description: mensaje });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filtros]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleOpenCreate = () => {
    setTransaccionAEditar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (transaccion: TransaccionCaja) => {
    setTransaccionAEditar(transaccion);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: Partial<TransaccionCaja>) => {
    try {
      setSaving(true);
      await saveCajaAction(formData);
      await cargarDatos();
    } catch (err: unknown) {
      throw err; // El modal captura este error para mostrarlo en pantalla
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este movimiento de caja?")) {
      return;
    }

    try {
      await deleteCajaAction(id);
      toast.success("¡Movimiento eliminado!");
      await cargarDatos();
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "No se pudo eliminar";
      toast.error("Error", { description: mensaje });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Tabla Principal */}
      <CajaTable
        data={data}
        loading={loading}
        page={page}
        total={total}
        pageSize={pageSize}
        nextPage={() => setPage((p) => p + 1)}
        prevPage={() => setPage((p) => Math.max(p - 1, 1))}
        onAddRecord={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Registro / Edición */}
      <CajaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSave}
        transaccionAEditar={transaccionAEditar}
        saving={saving}
      />
    </div>
  );
}