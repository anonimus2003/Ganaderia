'use client';

import React, { useState, useEffect } from 'react';
import {
  Syringe,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  UserCheck,
  Clock,
  AlertTriangle,
  X,
  Stethoscope,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

// Importación usando tu cliente de Supabase
import { createClient } from '@/lib/supabase/client';

// Definición del tipo para las Vías de Aplicación
type ViaAplicacion = 'Intramuscular' | 'Subcutánea' | 'Oral' | 'Tópica' | 'Intrauterina' | 'Local';

// Tipos TypeScript según tus esquemas SQL
interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  estado: string | null;
}

interface Tratamiento {
  id: string;
  bovino_id: string;
  medicamento: string;
  dosis: string;
  via: ViaAplicacion;
  fecha_aplicacion: string;
  tiempo_retiro: number;
  veterinario: string;
  motivo: string | null;
  created_at?: string;
  bovino?: Bovino; // Para la relación JOIN
}

export default function TratamientosPage() {
  // Instanciamos el cliente de Supabase
  const supabase = createClient();

  // Estados de datos
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de control de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVia, setFilterVia] = useState<string>('Todas');
  const [filterFecha, setFilterFecha] = useState<string>(''); // Nuevo estado para filtro por fecha
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados para Paginación (5 datos por página)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Estado del formulario
  const [formData, setFormData] = useState<{
    bovino_id: string;
    medicamento: string;
    dosis: string;
    via: ViaAplicacion;
    fecha_aplicacion: string;
    tiempo_retiro: number;
    veterinario: string;
    motivo: string;
  }>({
    bovino_id: '',
    medicamento: '',
    dosis: '',
    via: 'Intramuscular',
    fecha_aplicacion: new Date().toISOString().split('T')[0],
    tiempo_retiro: 0,
    veterinario: '',
    motivo: '',
  });

  // ================= 1. CARGAR DATOS DESDE SUPABASE =================
  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener bovinos
      const { data: bovinosData, error: bovinosError } = await supabase
        .from('bovinos')
        .select('id, arete, nombre, raza, estado');

      if (bovinosError) throw bovinosError;
      setBovinos(bovinosData || []);

      // Obtener tratamientos haciendo JOIN con la tabla de bovinos
      const { data: tratamientosData, error: tratamientosError } = await supabase
        .from('tratamientos')
        .select(`
          *,
          bovino:bovinos (id, arete, nombre, raza, estado)
        `)
        .order('fecha_aplicacion', { ascending: false });

      if (tratamientosError) throw tratamientosError;
      setTratamientos(tratamientosData || []);
   } catch (error) {
      console.error('Error consultando Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reiniciar a la página 1 cuando el usuario busca o aplica filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterVia, filterFecha]);

  // ================= 2. MODAL Y FORMULARIO =================
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      bovino_id: bovinos[0]?.id || '',
      medicamento: '',
      dosis: '',
      via: 'Intramuscular',
      fecha_aplicacion: new Date().toISOString().split('T')[0],
      tiempo_retiro: 0,
      veterinario: '',
      motivo: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tratamiento: Tratamiento) => {
    setEditingId(tratamiento.id);
    setFormData({
      bovino_id: tratamiento.bovino_id,
      medicamento: tratamiento.medicamento,
      dosis: tratamiento.dosis,
      via: tratamiento.via,
      fecha_aplicacion: tratamiento.fecha_aplicacion,
      tiempo_retiro: tratamiento.tiempo_retiro,
      veterinario: tratamiento.veterinario,
      motivo: tratamiento.motivo || '',
    });
    setIsModalOpen(true);
  };

  // ================= 3. GUARDAR (CREAR O EDITAR) EN SUPABASE =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Actualizar registro
        const { error } = await supabase
          .from('tratamientos')
          .update({
            bovino_id: formData.bovino_id,
            medicamento: formData.medicamento,
            dosis: formData.dosis,
            via: formData.via,
            fecha_aplicacion: formData.fecha_aplicacion,
            tiempo_retiro: formData.tiempo_retiro,
            veterinario: formData.veterinario,
            motivo: formData.motivo || null,
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Crear nuevo registro
        const { error } = await supabase.from('tratamientos').insert([
          {
            bovino_id: formData.bovino_id,
            medicamento: formData.medicamento,
            dosis: formData.dosis,
            via: formData.via,
            fecha_aplicacion: formData.fecha_aplicacion,
            tiempo_retiro: formData.tiempo_retiro,
            veterinario: formData.veterinario,
            motivo: formData.motivo || null,
          },
        ]);

        if (error) throw error;
      }

      await fetchData(); // Recargar los datos actualizados
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar en Supabase:', error);
      alert('Ocurrió un error al guardar el registro.');
    }
  };

  // ================= 4. ELIMINAR EN SUPABASE =================
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro de tratamiento?')) {
      try {
        const { error } = await supabase.from('tratamientos').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el tratamiento');
      }
    }
  };

  // ================= 5. LÓGICA DE FILTRADO Y PAGINACIÓN =================
  const filteredTratamientos = tratamientos.filter((item) => {
    const bovinoInfo = `${item.bovino?.arete || ''} ${item.bovino?.nombre || ''}`.toLowerCase();
    
    // Búsqueda por texto
    const matchSearch =
      bovinoInfo.includes(searchTerm.toLowerCase()) ||
      item.medicamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.veterinario.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por Vía de Aplicación
    const matchVia = filterVia === 'Todas' || item.via === filterVia;

    // Filtro por Fecha de Aplicación
    const matchFecha = !filterFecha || item.fecha_aplicacion === filterFecha;

    return matchSearch && matchVia && matchFecha;
  });

  // Cálculo de páginas
  const totalPages = Math.ceil(filteredTratamientos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTratamientos = filteredTratamientos.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Cálculo de tiempo de retiro activo
  const isEnRetiro = (fechaAplicacion: string, diasRetiro: number) => {
    if (diasRetiro <= 0) return false;
    const fechaApp = new Date(fechaAplicacion);
    const fechaFin = new Date(fechaApp);
    fechaFin.setDate(fechaFin.getDate() + diasRetiro);
    return new Date() <= fechaFin;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] p-4 md:p-8 text-slate-800 font-sans selection:bg-emerald-200">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= ENCABEZADO Y ESTADÍSTICAS ================= */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
                <Stethoscope size={14} />
                <span>Control Sanitario Veterinario</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Gestión de Tratamientos
              </h1>
              <p className="text-emerald-100/80 text-xs md:text-sm mt-1 max-w-xl">
                Registro clínico de medicamentos, vías de aplicación y periodos de resguardo sanitario para el hato.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-3 rounded-2xl transition-all shadow-lg hover:shadow-emerald-400/20 active:scale-95 text-sm cursor-pointer"
            >
              <Plus size={18} />
              <span>Registrar Tratamiento</span>
            </button>
          </div>

          {/* Tarjetas rápidas de estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-700/50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-emerald-200 font-medium">Total Tratamientos</span>
              <div className="text-2xl font-bold mt-1">{tratamientos.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-emerald-200 font-medium">Animales en Retiro Sanitario</span>
              <div className="text-2xl font-bold mt-1 text-amber-300 flex items-center gap-2">
                {tratamientos.filter((t) => isEnRetiro(t.fecha_aplicacion, t.tiempo_retiro)).length}
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-emerald-200 font-medium">Bovinos Registrados</span>
              <div className="text-2xl font-bold mt-1">{bovinos.length}</div>
            </div>
          </div>
        </div>

        {/* ================= CONTROLES DE BÚSQUEDA Y FILTROS ================= */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por arete, nombre, medicamento o vet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Filtros: Vía y Fecha */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Desplegable de Vía */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <label htmlFor="select-via" className="text-xs font-semibold text-slate-500 shrink-0">
                Vía:
              </label>
              <select
                id="select-via"
                value={filterVia}
                onChange={(e) => setFilterVia(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Todas">Todas</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Oral">Oral</option>
                <option value="Tópica">Tópica</option>
                <option value="Intrauterina">Intrauterina</option>
                <option value="Local">Local</option>
              </select>
            </div>

            {/* Filtro por Fecha */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <label htmlFor="input-fecha" className="text-xs font-semibold text-slate-500 shrink-0">
                Fecha:
              </label>
              <input
                id="input-fecha"
                type="date"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              />
              {filterFecha && (
                <button
                  type="button"
                  onClick={() => setFilterFecha('')}
                  className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Limpiar fecha"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ================= TABLA / LISTADO DE TRATAMIENTOS ================= */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-4 px-6">Bovino / Arete</th>
                  <th className="py-4 px-6">Medicamento / Dosis</th>
                  <th className="py-4 px-6">Vía</th>
                  <th className="py-4 px-6">Fecha Aplicación</th>
                  <th className="py-4 px-6">Tiempo Retiro</th>
                  <th className="py-4 px-6">Veterinario / Motivo</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin text-emerald-600" size={20} />
                        <span>Cargando datos desde la base de datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTratamientos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No se encontraron registros de tratamientos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedTratamientos.map((t) => {
                    const enRetiro = isEnRetiro(t.fecha_aplicacion, t.tiempo_retiro);

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Bovino */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">
                            {t.bovino?.arete || 'Sin arete'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {t.bovino?.nombre ? t.bovino.nombre : 'Sin nombre asignado'}
                          </div>
                        </td>

                        {/* Medicamento */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{t.medicamento}</div>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-600 font-mono mt-0.5">
                            {t.dosis}
                          </span>
                        </td>

                        {/* Vía */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            {t.via}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{t.fecha_aplicacion}</span>
                          </div>
                        </td>

                        {/* Tiempo Retiro */}
                        <td className="py-4 px-6">
                          {t.tiempo_retiro > 0 ? (
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  enRetiro
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Clock size={12} />
                                {t.tiempo_retiro} días
                              </span>
                              {enRetiro && (
                                <div className="text-[10px] text-amber-600 font-semibold">
                                  Restringido
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Sin retiro</span>
                          )}
                        </td>

                        {/* Veterinario / Motivo */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <UserCheck size={14} className="text-slate-400" />
                            {t.veterinario}
                          </div>
                          {t.motivo && (
                            <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                              {t.motivo}
                            </div>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
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

          {/* ================= BARRA DE PAGINACIÓN ================= */}
          <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Mostrando{' '}
              <span className="font-semibold text-slate-700">
                {filteredTratamientos.length > 0 ? startIndex + 1 : 0}
              </span>{' '}
              a{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredTratamientos.length)}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-slate-700">
                {filteredTratamientos.length}
              </span>{' '}
              tratamientos
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft size={16} />
                <span>Atrás</span>
              </button>

              <span className="text-xs font-semibold text-slate-700">
                Página {currentPage} de {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || totalPages === 0 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <span>Siguiente</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ================= MODAL REGISTRAR / EDITAR TRATAMIENTO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="text-emerald-400" size={20} />
                <h2 className="font-bold text-base md:text-lg">
                  {editingId ? 'Editar Tratamiento' : 'Registrar Nuevo Tratamiento'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white rounded-full p-1 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Desplegable de Bovinos desde la BD */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Seleccionar Bovino <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.bovino_id}
                    onChange={(e) => setFormData({ ...formData, bovino_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="" disabled>Seleccione una vaca / bovino</option>
                    {bovinos.map((bovino) => (
                      <option key={bovino.id} value={bovino.id}>
                        {bovino.arete} - {bovino.nombre ? bovino.nombre : 'Sin Nombre'} ({bovino.raza})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medicamento */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Medicamento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Oxitetraciclina"
                    value={formData.medicamento}
                    onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Dosis */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dosis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 10 ml o 1 tableta"
                    value={formData.dosis}
                    onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Vía de aplicación */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Vía de Aplicación <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.via}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        via: e.target.value as ViaAplicacion,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Subcutánea">Subcutánea</option>
                    <option value="Oral">Oral</option>
                    <option value="Tópica">Tópica</option>
                    <option value="Intrauterina">Intrauterina</option>
                    <option value="Local">Local</option>
                  </select>
                </div>

                {/* Fecha de Aplicación */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Fecha de Aplicación <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_aplicacion}
                    onChange={(e) => setFormData({ ...formData, fecha_aplicacion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Tiempo de Retiro (días) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tiempo de Retiro (Días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.tiempo_retiro}
                    onChange={(e) => setFormData({ ...formData, tiempo_retiro: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Veterinario */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Veterinario / Responsable <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del veterinario"
                    value={formData.veterinario}
                    onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Motivo */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Motivo / Diagnóstico
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descripción opcional del diagnóstico o síntoma..."
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                </div>

              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Tratamiento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}