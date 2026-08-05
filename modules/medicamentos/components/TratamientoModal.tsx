import React from 'react';
import { Syringe, X } from 'lucide-react';
import { Bovino, TratamientoFormData } from '../schemas';

interface TratamientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingId: string | null;
  formData: TratamientoFormData;
  setFormData: React.Dispatch<React.SetStateAction<TratamientoFormData>>;
  bovinos: Bovino[];
}

export const TratamientoModal: React.FC<TratamientoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  formData,
  setFormData,
  bovinos,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="text-emerald-400" size={20} />
            <h2 className="font-bold text-base">{editingId ? 'Editar Tratamiento' : 'Registrar Nuevo Tratamiento'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bovino</label>
              <select
                required
                value={formData.bovino_id}
                onChange={(e) => setFormData({ ...formData, bovino_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="" disabled>Seleccione un bovino</option>
                {bovinos.map((b) => (
                  <option key={b.id} value={b.id}>{b.arete} - {b.nombre || 'Sin Nombre'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medicamento</label>
              <input
                type="text"
                required
                value={formData.medicamento}
                onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dosis</label>
              <input
                type="text"
                required
                value={formData.dosis}
                onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vía</label>
              <select
                required
                value={formData.via}
                onChange={(e) => setFormData({ ...formData, via: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Oral">Oral</option>
                <option value="Tópica">Tópica</option>
                <option value="Intrauterina">Intrauterina</option>
                <option value="Local">Local</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha</label>
              <input
                type="date"
                required
                value={formData.fecha_aplicacion}
                onChange={(e) => setFormData({ ...formData, fecha_aplicacion: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiempo Retiro (Días)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.tiempo_retiro}
                onChange={(e) => setFormData({ ...formData, tiempo_retiro: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Veterinario</label>
              <input
                type="text"
                required
                value={formData.veterinario}
                onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border text-xs cursor-pointer">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};