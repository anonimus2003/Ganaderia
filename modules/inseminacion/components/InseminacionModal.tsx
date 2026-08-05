'use client';

import React, { useEffect, useState } from 'react';
import { X, Syringe, Tag, Dna, User, Calendar, RefreshCw } from 'lucide-react';
import { Bovino, InseminacionModalProps } from '../schemas';
import { fetchHembrasAction, saveInseminacionAction } from '../actions/inseminacionActions';

export function InseminacionModal({
  isOpen,
  onClose,
  onSuccess,
  inseminacionToEdit,
}: InseminacionModalProps) {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBovinos, setLoadingBovinos] = useState(true);

  const initialFormState = {
    bovino_id: '',
    toro_pajilla: '',
    raza_toro: '',
    numero_servicios: 1,
    tipo: 'I.A.',
    fecha_inseminacion: new Date().toISOString().split('T')[0],
    fecha_chequeo: '',
    fecha_probable_parto: '',
    tecnico: '',
    estado: 'Pendiente',
  };

  const [formData, setFormData] = useState(initialFormState);
  const isEditing = !!inseminacionToEdit;

  useEffect(() => {
    if (isOpen) {
      loadHembras();
      if (inseminacionToEdit) {
        setFormData({
          bovino_id: inseminacionToEdit.bovino_id || '',
          toro_pajilla: inseminacionToEdit.toro_pajilla || '',
          raza_toro: inseminacionToEdit.raza_toro || '',
          numero_servicios: inseminacionToEdit.numero_servicios || 1,
          tipo: inseminacionToEdit.tipo || 'I.A.',
          fecha_inseminacion: inseminacionToEdit.fecha_inseminacion || '',
          fecha_chequeo: inseminacionToEdit.fecha_chequeo || '',
          fecha_probable_parto: inseminacionToEdit.fecha_probable_parto || '',
          tecnico: inseminacionToEdit.tecnico || '',
          estado: inseminacionToEdit.estado || 'Pendiente',
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [isOpen, inseminacionToEdit]);

  const loadHembras = async () => {
    setLoadingBovinos(true);
    const { data } = await fetchHembrasAction();
    if (data) setBovinos(data);
    setLoadingBovinos(false);
  };

  const autoCalcularParto = (fechaIns: string) => {
    if (!fechaIns) return '';
    const date = new Date(fechaIns);
    date.setDate(date.getDate() + 283); // Promedio de gestación bovina (283 días)
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'fecha_inseminacion' && value) {
      const fechaSugeridaParto = autoCalcularParto(value);
      setFormData(prev => ({
        ...prev,
        fecha_inseminacion: value,
        fecha_probable_parto: prev.fecha_probable_parto || fechaSugeridaParto
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bovino_id) {
      alert('Por favor selecciona un bovino.');
      return;
    }

    setLoading(true);

    const payload = {
      bovino_id: formData.bovino_id,
      toro_pajilla: formData.toro_pajilla.trim(),
      raza_toro: formData.raza_toro.trim() || null,
      numero_servicios: Number(formData.numero_servicios) || 1,
      tipo: formData.tipo,
      fecha_inseminacion: formData.fecha_inseminacion,
      fecha_chequeo: formData.fecha_chequeo ? formData.fecha_chequeo : null,
      fecha_probable_parto: formData.fecha_probable_parto ? formData.fecha_probable_parto : null,
      tecnico: formData.tecnico.trim(),
      estado: formData.estado,
    };

    const { error } = await saveInseminacionAction(payload, isEditing, inseminacionToEdit?.id);

    setLoading(false);

    if (error) {
      console.error('Error Supabase:', error);
      alert(`Error al guardar: ${error.message}`);
    } else {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#f2f7f4] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-emerald-900/10">
        <div className="flex justify-between items-center p-6 bg-[#062c19] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-emerald-950 shadow-md font-bold">
              <Syringe className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {isEditing ? 'Editar Inseminación' : 'Nueva Inseminación'}
              </h2>
              <p className="text-xs text-emerald-200/70">Control biológico reproductivo del hato</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-emerald-300/60 hover:text-white rounded-xl hover:bg-emerald-900/50 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-emerald-600" /> Vaca / Novilla *
            </label>
            <select
              name="bovino_id"
              value={formData.bovino_id}
              onChange={handleChange}
              required
              disabled={loadingBovinos}
              className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="">-- Selecciona por Arete o Nombre --</option>
              {bovinos.map((b) => (
                <option key={b.id} value={b.id}>
                  Arete: {b.arete} {b.nombre ? `- ${b.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <Dna className="w-4 h-4 text-emerald-600" /> Toro / Código Pajilla *
              </label>
              <input
                type="text"
                name="toro_pajilla"
                value={formData.toro_pajilla}
                onChange={handleChange}
                required
                placeholder="Ej. PAJ-9082"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Raza del Toro</label>
              <input
                type="text"
                name="raza_toro"
                value={formData.raza_toro}
                onChange={handleChange}
                placeholder="Ej. Gyr / Holstein"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">N° Servicios</label>
              <input
                type="number"
                name="numero_servicios"
                min="1"
                value={formData.numero_servicios}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Tipo</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="I.A.">I.A. (Artificial)</option>
                <option value="Monta Natural">Monta Natural</option>
                <option value="T.E.">T.E. (Transf. Embrión)</option>
                <option value="Celo no Servido">Celo no Servido</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Gestante">Gestante</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Fallida">Fallida</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <User className="w-4 h-4 text-emerald-600" /> Técnico Inseminador *
              </label>
              <input
                type="text"
                name="tecnico"
                value={formData.tecnico}
                onChange={handleChange}
                required
                placeholder="Nombre del inseminador"
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-600" /> Fecha Inseminación *
              </label>
              <input
                type="date"
                name="fecha_inseminacion"
                value={formData.fecha_inseminacion}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Fecha Chequeo</label>
              <input
                type="date"
                name="fecha_chequeo"
                value={formData.fecha_chequeo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm space-y-2">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Probable Parto</label>
              <input
                type="date"
                name="fecha_probable_parto"
                value={formData.fecha_probable_parto}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/30 text-emerald-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-emerald-200 font-semibold text-emerald-900 hover:bg-emerald-100/50 transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#062c19] hover:bg-emerald-900 text-emerald-400 font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{isEditing ? 'Guardar Cambios' : 'Registrar'}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}