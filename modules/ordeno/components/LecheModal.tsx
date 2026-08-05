// modules/leche/components/LecheModal.tsx
import { useState } from 'react';
import { X, Milk, Search, AlertTriangle } from 'lucide-react';
import { useLeche } from '../hooks/useLeche';

interface LecheModalProps {
  state: ReturnType<typeof useLeche>;
}

export function LecheModal({ state }: LecheModalProps) {
  const {
    supabase,
    isModalOpen,
    closeModal,
    editingId,
    bovinosLista,
    filtroBovinoModal,
    setFiltroBovinoModal,
    formData,
    setFormData,
    fetchDataTabla,
    fetchMetricasData,
  } = state;

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isModalOpen) return null;

  // Filtrar bovinos dentro del modal mediante búsqueda rápida
  const bovinosFiltradosModal = bovinosLista.filter((b) => {
    const term = filtroBovinoModal.toLowerCase();
    const areteMatch = b.arete.toLowerCase().includes(term);
    const nombreMatch = b.nombre?.toLowerCase().includes(term) || false;
    return areteMatch || nombreMatch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.bovino_id) {
      setErrorMessage('Por favor selecciona un bovino.');
      return;
    }
    if (!formData.litros || Number(formData.litros) <= 0) {
      setErrorMessage('Ingresa una cantidad válida de litros.');
      return;
    }

    setSaving(true);

    try {
      // Validación de duplicados: Verificar si ya existe un registro para este bovino, fecha y jornada
      let query = supabase
        .from('produccion_leche')
        .select('id')
        .eq('bovino_id', formData.bovino_id)
        .eq('fecha', formData.fecha)
        .eq('jornada', formData.jornada);

      if (editingId) {
        query = query.neq('id', editingId);
      }

      const { data: existente, error: errDuplicado } = await query;
      if (errDuplicado) throw errDuplicado;

      if (existente && existente.length > 0) {
        setErrorMessage(`Ya existe un registro de leche para este bovino en la jornada de ${formData.jornada} para la fecha ${formData.fecha}.`);
        setSaving(false);
        return;
      }

      const payload = {
        bovino_id: formData.bovino_id,
        fecha: formData.fecha,
        litros: Number(formData.litros),
        jornada: formData.jornada,
        concentrado_kg: Number(formData.concentrado_kg) || 0,
        observaciones: formData.observaciones.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase.from('produccion_leche').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('produccion_leche').insert([payload]);
        if (error) throw error;
      }

      fetchDataTabla();
      fetchMetricasData();
      closeModal();
    } catch (err: any) {
      setErrorMessage('Error al guardar el registro: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Milk className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-900">
              {editingId ? 'Editar Registro de Ordeño' : 'Nuevo Registro de Ordeño'}
            </h2>
          </div>
          <button 
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selector de Bovino con Buscador Interno */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Seleccionar Bovino *</label>
            <select
              required
              value={formData.bovino_id}
              onChange={(e) => setFormData({ ...formData, bovino_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="" disabled>Seleccione un animal...</option>
              {bovinosFiltradosModal.map((b) => (
                <option key={b.id} value={b.id}>
                   {b.arete} {b.nombre ? `- ${b.nombre}` : ''} 
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Fecha */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Fecha *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Jornada */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Jornada *</label>
              <select
                value={formData.jornada}
                onChange={(e) => setFormData({ ...formData, jornada: e.target.value as 'Mañana' | 'Tarde' })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Litros */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Litros Producidos (L) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="Ej. 12.5"
                value={formData.litros}
                onChange={(e) => setFormData({ ...formData, litros: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Concentrado */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Concentrado (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ej. 2.0"
                value={formData.concentrado_kg}
                onChange={(e) => setFormData({ ...formData, concentrado_kg: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Observaciones (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Notas sobre el ordeño, novedad sanitaria o comportamiento..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {editingId ? 'Guardar Cambios' : 'Registrar Ordeño'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}