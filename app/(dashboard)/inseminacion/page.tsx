'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  X,
  Syringe,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Tag,
  Dna,
  ArrowUpRight,
  Activity,
  Sparkles,
  AlertCircle,
  TrendingUp,
  PieChart,
  Filter,
} from 'lucide-react';

// ==========================================
// INTERFACES
// ==========================================
export interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
}

export interface Inseminacion {
  id: string;
  bovino_id: string;
  toro_pajilla: string;
  raza_toro: string | null;
  numero_servicios: number;
  tipo: string;
  fecha_inseminacion: string;
  fecha_chequeo: string | null;
  fecha_probable_parto: string | null;
  tecnico: string;
  estado: string;
  created_at?: string;
  bovinos?: Bovino;
}

interface InseminacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  inseminacionToEdit?: Inseminacion | null;
}

// ==========================================
// COMPONENTE MODAL (VERDE ESMERALDA Y MODERNO)
// ==========================================
function InseminacionModal({
  isOpen,
  onClose,
  onSuccess,
  inseminacionToEdit,
}: InseminacionModalProps) {
  const supabase = createClient();
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
      fetchHembras();
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

  // Cálculo automático sugerido de fecha probable de parto (283 días promedio)
  const autoCalcularParto = (fechaIns: string) => {
    if (!fechaIns) return '';
    const date = new Date(fechaIns);
    date.setDate(date.getDate() + 283);
    return date.toISOString().split('T')[0];
  };

  const fetchHembras = async () => {
    setLoadingBovinos(true);
    const { data, error } = await supabase
      .from('bovinos')
      .select('id, arete, nombre')
      .eq('genero', 'Hembra')
      .order('arete', { ascending: true });

    if (!error && data) setBovinos(data);
    setLoadingBovinos(false);
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

    let error = null;

    if (isEditing && inseminacionToEdit) {
      const res = await supabase.from('inseminaciones').update(payload).eq('id', inseminacionToEdit.id);
      error = res.error;
    } else {
      const res = await supabase.from('inseminaciones').insert([payload]);
      error = res.error;
    }

    setLoading(false);

    if (error) {
      console.error('Error Supabase:', error);
      alert(`Error de Supabase: ${error.message}`);
    } else {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#f2f7f4] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-emerald-900/10">
        
        {/* Header Modal */}
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
          <button
            onClick={onClose}
            className="p-2 text-emerald-300/60 hover:text-white rounded-xl hover:bg-emerald-900/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
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

// ==========================================
// PÁGINA PRINCIPAL (BENTO VERDE AGRO)
// ==========================================
export default function InseminacionPage() {
  const supabase = createClient();
  const [inseminaciones, setInseminaciones] = useState<Inseminacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInseminacion, setSelectedInseminacion] = useState<Inseminacion | null>(null);

  useEffect(() => {
    fetchInseminaciones();
  }, []);

  const fetchInseminaciones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inseminaciones')
      .select(`
        *,
        bovinos (
          id,
          arete,
          nombre
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInseminaciones(data as Inseminacion[]);
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setSelectedInseminacion(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Inseminacion) => {
    setSelectedInseminacion(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar este registro de inseminación?')) return;
    const { error } = await supabase.from('inseminaciones').delete().eq('id', id);
    if (!error) fetchInseminaciones();
  };

  // Helper para dar formato a fechas
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  // ==========================================
  // CÁLCULOS ESTADÍSTICOS REALES
  // ==========================================
  const total = inseminaciones.length;
  const gestantes = inseminaciones.filter((i) => i.estado === 'Gestante' || i.estado === 'Confirmada').length;
  const pendientes = inseminaciones.filter((i) => i.estado === 'Pendiente').length;
  const fallidas = inseminaciones.filter((i) => i.estado === 'Fallida').length;
  const efectividad = total > 0 ? Math.round((gestantes / total) * 100) : 0;

  // Distribución por métodos
  const countIA = inseminaciones.filter((i) => i.tipo === 'I.A.' || !i.tipo).length;
  const countMonta = inseminaciones.filter((i) => i.tipo === 'Monta Natural').length;
  const countTE = inseminaciones.filter((i) => i.tipo === 'T.E.').length;

  const percentIA = total > 0 ? Math.round((countIA / total) * 100) : 0;
  const percentMonta = total > 0 ? Math.round((countMonta / total) * 100) : 0;
  const percentTE = total > 0 ? Math.round((countTE / total) * 100) : 0;

  // Promedio de servicios
  const avgServicios = total > 0 
    ? (inseminaciones.reduce((acc, curr) => acc + (curr.numero_servicios || 1), 0) / total).toFixed(1)
    : '1.0';

  // Agenda Dinámica
  const agendaEventos = useMemo(() => {
    const eventos: {
      id: string;
      fecha: string;
      titulo: string;
      subtitulo: string;
      tipo: 'chequeo' | 'parto';
      bovinoInfo: string;
    }[] = [];

    inseminaciones.forEach((item) => {
      if (item.fecha_chequeo && item.estado === 'Pendiente') {
        eventos.push({
          id: item.id + '-chk',
          fecha: item.fecha_chequeo,
          titulo: 'Chequeo Palpación',
          subtitulo: 'Pendiente de confirmación',
          tipo: 'chequeo',
          bovinoInfo: `Arete: ${item.bovinos?.arete || 'S/N'} ${item.bovinos?.nombre ? `(${item.bovinos.nombre})` : ''}`,
        });
      }
      if (item.fecha_probable_parto && (item.estado === 'Gestante' || item.estado === 'Confirmada')) {
        eventos.push({
          id: item.id + '-prt',
          fecha: item.fecha_probable_parto,
          titulo: 'Probable Parto',
          subtitulo: 'Preñez activa',
          tipo: 'parto',
          bovinoInfo: `Arete: ${item.bovinos?.arete || 'S/N'} ${item.bovinos?.nombre ? `(${item.bovinos.nombre})` : ''}`,
        });
      }
    });

    return eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [inseminaciones]);

  // Filtrado de la lista principal
  const filteredData = inseminaciones.filter((item) => {
    const arete = item.bovinos?.arete?.toLowerCase() || '';
    const nombre = item.bovinos?.nombre?.toLowerCase() || '';
    const toro = item.toro_pajilla?.toLowerCase() || '';
    const matchesQuery = arete.includes(searchQuery.toLowerCase()) || nombre.includes(searchQuery.toLowerCase()) || toro.includes(searchQuery.toLowerCase());

    if (selectedFilter === 'Gestantes') return matchesQuery && (item.estado === 'Gestante' || item.estado === 'Confirmada');
    if (selectedFilter === 'Pendientes') return matchesQuery && item.estado === 'Pendiente';
    if (selectedFilter === 'Fallidas') return matchesQuery && item.estado === 'Fallida';
    return matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#f0f5f1] p-4 md:p-8 space-y-6 text-emerald-950 font-sans">
      
      {/* ==========================================
          HEADER SUPERIOR
         ========================================== */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white/80 p-4 md:p-6 rounded-[2.5rem] border border-emerald-900/10 shadow-sm backdrop-blur-md">
        
        {/* Píldoras de Métricas Superior Izquierda */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Pill 1 - Barra de Progreso */}
          <div className="bg-[#062c19] text-white px-5 py-3 rounded-full flex items-center gap-4 text-xs font-bold shadow-sm">
            <span>Efectividad</span>
            <div className="w-28 bg-emerald-950/80 h-2.5 rounded-full overflow-hidden border border-emerald-800/40">
              <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${efectividad}%` }} />
            </div>
            <span className="text-emerald-400">{efectividad}%</span>
          </div>

          {/* Pill 2 - Preñeces */}
          <div className="bg-emerald-500 text-emerald-950 px-5 py-3 rounded-full flex items-center gap-2 text-xs font-extrabold shadow-sm">
            <span>Gestantes</span>
            <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[11px]">{gestantes}</span>
          </div>

          {/* Pill 3 - Pendientes */}
          <div className="bg-emerald-100/60 border border-emerald-200 text-emerald-900 px-5 py-3 rounded-full flex items-center gap-2 text-xs font-bold">
            <span>Pendientes</span>
            <span className="text-emerald-700 font-semibold">{pendientes}</span>
          </div>

          {/* Pill 4 - Estado del hato */}
          <div className="bg-white border border-emerald-200/80 text-emerald-800 px-4 py-3 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>I.A. Operativa</span>
          </div>
        </div>

        {/* Métricas en Números Grandes Arriba a la Derecha */}
        <div className="flex items-center gap-6 md:gap-8 self-end lg:self-auto">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[#062c19]">
              <span className="text-2xl md:text-3xl font-black tracking-tight">{total}</span>
            </div>
            <p className="text-[10px] font-bold uppercase text-emerald-700/60 tracking-wider">Inseminaciones</p>
          </div>

          <div className="h-8 w-[1px] bg-emerald-200" />

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-emerald-600">
              <span className="text-2xl md:text-3xl font-black tracking-tight">{gestantes}</span>
            </div>
            <p className="text-[10px] font-bold uppercase text-emerald-700/60 tracking-wider">Preñeces</p>
          </div>

          <div className="h-8 w-[1px] bg-emerald-200" />

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-amber-600">
              <span className="text-2xl md:text-3xl font-black tracking-tight">{agendaEventos.length}</span>
            </div>
            <p className="text-[10px] font-bold uppercase text-emerald-700/60 tracking-wider">En Agenda</p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="w-12 h-12 bg-[#062c19] hover:bg-emerald-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            title="Nueva Inseminación"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

      </div>

      {/* ==========================================
          BENTO GRID LAYOUT PRINCIPAL (3 - 6 - 3)
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ------------------------------------------
            COLUMNA IZQUIERDA: AGENDA DINÁMICA (3 Cols)
           ------------------------------------------ */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-6 border border-emerald-900/10 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-emerald-950 tracking-tight">Agenda</h2>
                <p className="text-[11px] text-emerald-600 font-medium">Chequeos y Partos próximos</p>
              </div>
              <button onClick={handleOpenCreateModal} className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Vertical de Eventos */}
            <div className="relative border-l-2 border-dashed border-emerald-200 ml-4 space-y-6 pl-6 py-2 max-h-[420px] overflow-y-auto pr-2">
              {agendaEventos.length === 0 ? (
                <div className="text-center py-8 text-emerald-800/50 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                  <p className="text-xs font-semibold">No hay chequeos o partos pendientes en la agenda.</p>
                </div>
              ) : (
                agendaEventos.slice(0, 5).map((evt) => {
                  const isParto = evt.tipo === 'parto';
                  return (
                    <div key={evt.id} className="relative">
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${isParto ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100">
                          {formatDate(evt.fecha)}
                        </span>
                      </div>

                      <div className={`mt-2 p-3.5 rounded-2xl shadow-sm space-y-1 border ${
                        isParto ? 'bg-amber-50/60 border-amber-200/80' : 'bg-[#062c19] text-white border-emerald-900'
                      }`}>
                        <p className={`text-xs font-bold ${isParto ? 'text-amber-900' : 'text-emerald-400'}`}>
                          {evt.titulo}
                        </p>
                        <p className={`text-[11px] font-medium ${isParto ? 'text-amber-800' : 'text-emerald-100/80'}`}>
                          {evt.bovinoInfo}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Registra las fechas de chequeo para alertar palpaciones.</span>
          </div>
        </div>

        {/* ------------------------------------------
            COLUMNA CENTRO: TABLA PRINCIPAL (6 Cols)
           ------------------------------------------ */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white rounded-[2.5rem] p-6 border border-emerald-900/10 shadow-sm space-y-5">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-emerald-950 tracking-tight">Inseminaciones</h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  {filteredData.length}
                </span>
              </div>

              {/* Buscador Integrado */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50" />
                <input
                  type="text"
                  placeholder="Buscar vaca, toro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {['Todos', 'Gestantes', 'Pendientes', 'Fallidas'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    selectedFilter === filter
                      ? 'bg-[#062c19] text-emerald-400'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Tabla Estilizada */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-100 text-[10px] font-bold text-emerald-700/60 uppercase tracking-wider">
                    <th className="py-3 px-3">Vaca / Arete</th>
                    <th className="py-3 px-3">Toro / Pajilla</th>
                    <th className="py-3 px-3">Fecha Ins.</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-emerald-700/60">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                        Cargando datos de Supabase...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-emerald-700/50">
                        No hay inseminaciones registradas en esta sección.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const isGestante = item.estado === 'Gestante' || item.estado === 'Confirmada';
                      const isFallida = item.estado === 'Fallida';

                      return (
                        <tr key={item.id} className="hover:bg-emerald-50/40 transition group">
                          <td className="py-3 px-3 font-bold text-emerald-950">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                                🐄
                              </div>
                              <div>
                                <span>{item.bovinos?.arete || 'S/N'}</span>
                                {item.bovinos?.nombre && (
                                  <span className="block text-[10px] font-normal text-emerald-700/70">{item.bovinos.nombre}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-medium text-emerald-900">
                            <span>{item.toro_pajilla}</span>
                            {item.raza_toro && <span className="block text-[10px] text-emerald-600">{item.raza_toro}</span>}
                          </td>

                          <td className="py-3 px-3 text-emerald-800 font-semibold">
                            {formatDate(item.fecha_inseminacion)}
                            <span className="block text-[10px] text-emerald-600/70 font-normal">{item.tecnico}</span>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                isGestante
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isFallida
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {isGestante && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {isFallida && <AlertCircle className="w-3 h-3 text-rose-600" />}
                              {item.estado}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-700 transition"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* ------------------------------------------
            COLUMNA DERECHA: MÉTRICAS Y DISTRIBUCIÓN (3 Cols)
           ------------------------------------------ */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Distribución por Método */}
          <div className="bg-white rounded-[2.5rem] p-6 border border-emerald-900/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-emerald-950">Métodos Reconstructivos</h3>
              <PieChart className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-3 pt-2">
              {/* Bar 1: I.A. */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-emerald-900">
                  <span>I.A. (Artificial)</span>
                  <span className="font-bold text-emerald-700">{percentIA}%</span>
                </div>
                <div className="w-full bg-emerald-50 h-2.5 rounded-full overflow-hidden border border-emerald-100">
                  <div className="bg-[#062c19] h-full rounded-full" style={{ width: `${percentIA}%` }} />
                </div>
              </div>

              {/* Bar 2: Monta Natural */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-emerald-900">
                  <span>Monta Natural</span>
                  <span className="font-bold text-emerald-700">{percentMonta}%</span>
                </div>
                <div className="w-full bg-emerald-50 h-2.5 rounded-full overflow-hidden border border-emerald-100">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentMonta}%` }} />
                </div>
              </div>

              {/* Bar 3: Transferencia Embrión */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-emerald-900">
                  <span>Transferencia (T.E.)</span>
                  <span className="font-bold text-emerald-700">{percentTE}%</span>
                </div>
                <div className="w-full bg-emerald-50 h-2.5 rounded-full overflow-hidden border border-emerald-100">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percentTE}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Indicador Clave de Eficiencia */}
          <div className="bg-[#062c19] text-white rounded-[2.5rem] p-6 shadow-md relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingUp className="w-32 h-32 text-emerald-300" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/50">
              Desempeño Técnico
            </span>

            <div className="pt-2">
              <div className="text-3xl font-black text-emerald-400">{avgServicios}</div>
              <p className="text-xs font-bold text-emerald-100 mt-0.5">Servicios por Concepción</p>
              <p className="text-[11px] text-emerald-300/70 mt-2">
                Un indicador menor a 1.8 refleja excelente manejo reproductivo en el hato.
              </p>
            </div>
          </div>

          {/* Card 3: Resumen de Fallas */}
          <div className="bg-white rounded-[2.5rem] p-6 border border-emerald-900/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-900">Servicios Fallidos</p>
              <p className="text-[11px] text-emerald-600">Requieren reevaluación</p>
            </div>
            <span className="text-xl font-extrabold text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-2xl border border-rose-100">
              {fallidas}
            </span>
          </div>

        </div>

      </div>

      {/* ==========================================
          MODAL DE CREACIÓN Y EDICIÓN
         ========================================== */}
      <InseminacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInseminaciones}
        inseminacionToEdit={selectedInseminacion}
      />

    </div>
  );
}