'use client';

import React, { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useInventario } from "./hooks/useInventario";
import { ESTADOS_BOVINOS, Bovino } from "./schemas";
import BovinoStats from "./components/BovinoStats";
import BovinoTable from "./components/BovinoTable";
import { BovinoModalContainer } from "./components/BovinoModal";
import { createClient } from "@/lib/supabase/client";

export default function InventarioBovinosDashboard() {
  const supabase = createClient();
  const {
    bovinos,
    filteredBovinos,
    loading,
    searchTerm,
    setSearchTerm,
    selectedEstado,
    setSelectedEstado,
    selectedGenero,
    setSelectedGenero,
    fetchBovinos,
    setBovinos
  } = useInventario();

  // Estados locales para controlar los modales y el bovino seleccionado
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Estado para el modal de crear
  const [activeBovino, setActiveBovino] = useState<Bovino | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bovino>>({});
  const [createForm, setCreateForm] = useState<Partial<Bovino>>({
    estado: ESTADOS_BOVINOS[0] || "Cría",
    genero: "Hembra"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Métricas
  const totalBovinos = bovinos.length;
  const totalHembras = bovinos.filter((b) => b.genero === "Hembra").length;
  const totalMachos = bovinos.filter((b) => b.genero === "Macho").length;
  const enProduccionCount = bovinos.filter((b) => b.estado === "Producción" || b.estado === "En producción").length;
  const pesoPromedio = totalBovinos > 0 
    ? (bovinos.reduce((acc, curr) => acc + Number(curr.peso_inicial || 0), 0) / totalBovinos).toFixed(1) 
    : "0.0";

  // 1. VER DETALLES
  const handleOpenView = (bovino: Bovino) => {
    setActiveBovino(bovino);
    setIsViewModalOpen(true);
  };

  // 2. ABRIR EDICIÓN
  const handleOpenEdit = (bovino: Bovino) => {
    setActiveBovino(bovino);
    setEditForm(bovino);
    setIsEditModalOpen(true);
  };

  // 3. GUARDAR CAMBIOS DE EDICIÓN
  const handleUpdateBovino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBovino) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("bovinos")
        .update({
          arete: editForm.arete,
          nombre: editForm.nombre,
          raza: editForm.raza,
          genero: editForm.genero,
          peso_inicial: Number(editForm.peso_inicial),
          fecha_nacimiento: editForm.fecha_nacimiento,
          estado: editForm.estado,
          observaciones: editForm.observaciones,
        })
        .eq("id", activeBovino.id);

      if (error) {
        alert("Error al actualizar el registro.");
        return;
      }

      setIsEditModalOpen(false);
      await fetchBovinos();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. CREAR NUEVO BOVINO
  const handleCreateBovino = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("bovinos")
        .insert([{
          arete: createForm.arete,
          nombre: createForm.nombre,
          raza: createForm.raza,
          genero: createForm.genero,
          peso_inicial: Number(createForm.peso_inicial || 0),
          fecha_nacimiento: createForm.fecha_nacimiento || null,
          estado: createForm.estado,
          observaciones: createForm.observaciones,
        }]);

      if (error) {
        alert("Error al registrar el bovino: " + error.message);
        return;
      }

      setIsCreateModalOpen(false);
      setCreateForm({ estado: ESTADOS_BOVINOS[0] || "Cría", genero: "Hembra" });
      await fetchBovinos();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. ELIMINAR BOVINO
  const handleDelete = async (id: string, arete: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el bovino con arete "${arete}"?`)) return;

    const { error } = await supabase.from("bovinos").delete().eq("id", id);
    if (error) {
      alert("No se pudo eliminar el registro.");
      return;
    }

    setBovinos((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO CON BOTÓN CHEVRE DE REGISTRAR GANADO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Inventario de Bovinos</h1>
            <p className="text-sm text-slate-500 mt-1">Gestión y control inteligente del hato ganadero</p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-[0.98] transition-all duration-200"
          >
            <div className="bg-white/20 p-1 rounded-xl">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span>Registrar Ganado</span>
          </button>
        </div>

        <BovinoStats 
          totalBovinos={totalBovinos}
          totalHembras={totalHembras}
          totalMachos={totalMachos}
          enProduccionCount={enProduccionCount}
          pesoPromedio={pesoPromedio}
        />

        {/* Tabla conectada a las funciones */}
        <BovinoTable 
          bovinos={filteredBovinos}
          loading={loading}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />

        {/* MODAL DE VISTA (DETALLES) */}
        <BovinoModalContainer 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
          title="Detalles del Bovino"
        >
          {activeBovino && (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Arete</span>
                  <strong className="text-slate-800 text-base">{activeBovino.arete}</strong>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Nombre</span>
                  <strong className="text-slate-800 text-base">{activeBovino.nombre || "Sin nombre"}</strong>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Raza</span>
                  <span>{activeBovino.raza}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Género</span>
                  <span>{activeBovino.genero}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Peso Inicial</span>
                  <span>{activeBovino.peso_inicial} kg</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Estado Actual</span>
                  <span>{activeBovino.estado}</span>
                </div>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase mb-1">Observaciones</span>
                <p className="bg-slate-50 p-3 rounded-xl">{activeBovino.observaciones || "Sin observaciones registradas."}</p>
              </div>
            </div>
          )}
        </BovinoModalContainer>

        {/* MODAL DE CREAR / REGISTRAR NUEVO BOVINO */}
        <BovinoModalContainer 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          title="Registrar Nuevo Bovino"
        >
          <form onSubmit={handleCreateBovino} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Arete *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. 001"
                  value={createForm.arete || ""}
                  onChange={(e) => setCreateForm({ ...createForm, arete: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre</label>
                <input 
                  type="text"
                  placeholder="Ej. Lucero"
                  value={createForm.nombre || ""}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Raza *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Brahman, Holstein..."
                  value={createForm.raza || ""}
                  onChange={(e) => setCreateForm({ ...createForm, raza: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Género *</label>
                <select
                  value={createForm.genero || "Hembra"}
                  onChange={(e) => setCreateForm({ ...createForm, genero: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Peso Inicial (kg) *</label>
                <input 
                  type="number"
                  step="any"
                  required
                  placeholder="Ej. 180"
                  value={createForm.peso_inicial || ""}
                  onChange={(e) => setCreateForm({ ...createForm, peso_inicial: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Estado / Etapa *</label>
                <select
                  value={createForm.estado || ""}
                  onChange={(e) => setCreateForm({ ...createForm, estado: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {ESTADOS_BOVINOS.map((est) => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Observaciones</label>
              <textarea 
                rows={3}
                placeholder="Notas adicionales sobre el animal..."
                value={createForm.observaciones || ""}
                onChange={(e) => setCreateForm({ ...createForm, observaciones: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {isSubmitting ? "Registrando..." : "Guardar Registro"}
              </button>
            </div>
          </form>
        </BovinoModalContainer>

        {/* MODAL DE EDICIÓN */}
        <BovinoModalContainer 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          title="Editar Registro de Bovino"
        >
          <form onSubmit={handleUpdateBovino} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Arete</label>
              <input 
                type="text"
                required
                value={editForm.arete || ""}
                onChange={(e) => setEditForm({ ...editForm, arete: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre</label>
              <input 
                type="text"
                value={editForm.nombre || ""}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Raza</label>
                <input 
                  type="text"
                  required
                  value={editForm.raza || ""}
                  onChange={(e) => setEditForm({ ...editForm, raza: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Peso Inicial (kg)</label>
                <input 
                  type="number"
                  step="any"
                  required
                  value={editForm.peso_inicial || ""}
                  onChange={(e) => setEditForm({ ...editForm, peso_inicial: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Estado</label>
              <select
                value={editForm.estado || ""}
                onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                {ESTADOS_BOVINOS.map((est) => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </BovinoModalContainer>

      </div>
    </div>
  );
}