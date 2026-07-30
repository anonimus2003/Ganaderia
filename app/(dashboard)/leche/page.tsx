'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Milk, 
  Wheat, 
  TrendingUp, 
  ClipboardList, 
  Pencil, 
  Trash2, 
  Search, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X,
  RotateCcw
} from 'lucide-react';

interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  estado: string | null;
}

interface ProduccionLeche {
  id: string;
  bovino_id: string;
  fecha: string;
  litros: number;
  jornada: 'Mañana' | 'Tarde';
  concentrado_kg: number;
  observaciones?: string | null;
  created_at: string;
  bovinos?: {
    arete: string;
    nombre: string | null;
  } | null;
}

const PAGE_SIZE = 10;

export default function DashboardProduccionLeche() {
  const supabase = createClient();

  // Estados de datos y paginación
  const [registros, setRegistros] = useState<ProduccionLeche[]>([]);
  const [bovinosLista, setBovinosLista] = useState<Bovino[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Estados de Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [bovinoFiltroId, setBovinoFiltroId] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Métricas
  const [litrosTotales, setLitrosTotales] = useState<number>(0);
  const [concentradoTotal, setConcentradoTotal] = useState<number>(0);
  const [promedioOrdeno, setPromedioOrdeno] = useState<string>('0');

  // Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroBovinoModal, setFiltroBovinoModal] = useState<string>('');
  const [formData, setFormData] = useState({
    bovino_id: '',
    fecha: new Date().toISOString().split('T')[0],
    litros: '',
    jornada: 'Mañana' as 'Mañana' | 'Tarde',
    concentrado_kg: '0',
    observaciones: '',
  });

  // 1. Cargar lista completa de bovinos para selectores
  const fetchBovinosLista = useCallback(async () => {
    const { data, error } = await supabase
      .from('bovinos')
      .select('id, arete, nombre, raza, estado')
      .order('arete', { ascending: true });

    if (!error && data) {
      setBovinosLista(data);
    }
  }, [supabase]);

  // 2. Cargar tabla con paginación de 10 y filtros aplicados
  const fetchTablaDatos = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('produccion_leche')
      .select('*, bovinos!inner(arete, nombre)', { count: 'exact' })
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filtro por texto (arete o nombre)
    if (busqueda.trim() !== '') {
      const term = busqueda.trim();
      query = query.or(`arete.ilike.%${term}%,nombre.ilike.%${term}%`, { foreignTable: 'bovinos' });
    }

    // Filtro por animal específico
    if (bovinoFiltroId) {
      query = query.eq('bovino_id', bovinoFiltroId);
    }

    // Filtro por rango de fechas
    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha', fechaFin);
    }

    const { data, count, error } = await query;

    if (!error) {
      setRegistros((data as unknown as ProduccionLeche[]) || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, busqueda, bovinoFiltroId, fechaInicio, fechaFin, supabase]);

  // 3. Recalcular métricas generales respetando los filtros activos
  const fetchMetricas = useCallback(async () => {
    let query = supabase
      .from('produccion_leche')
      .select('litros, concentrado_kg, bovinos!inner(arete, nombre)');

    if (busqueda.trim() !== '') {
      const term = busqueda.trim();
      query = query.or(`arete.ilike.%${term}%,nombre.ilike.%${term}%`, { foreignTable: 'bovinos' });
    }

    if (bovinoFiltroId) {
      query = query.eq('bovino_id', bovinoFiltroId);
    }

    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha', fechaFin);
    }

    const { data, error } = await query;

    if (!error && data) {
      const totalLitros = data.reduce((acc, curr) => acc + (Number(curr.litros) || 0), 0);
      const totalConcentrado = data.reduce((acc, curr) => acc + (Number(curr.concentrado_kg) || 0), 0);
      const promedio = data.length > 0 ? (totalLitros / data.length).toFixed(1) : '0';

      setLitrosTotales(totalLitros);
      setConcentradoTotal(totalConcentrado);
      setPromedioOrdeno(promedio);
    }
  }, [busqueda, bovinoFiltroId, fechaInicio, fechaFin, supabase]);

  useEffect(() => {
    fetchBovinosLista();
  }, [fetchBovinosLista]);

  useEffect(() => {
    fetchTablaDatos();
    fetchMetricas();
  }, [fetchTablaDatos, fetchMetricas]);

  const resetFiltros = () => {
    setBusqueda('');
    setBovinoFiltroId('');
    setFechaInicio('');
    setFechaFin('');
    setPage(1);
  };

  // Filtrado de bovinos dentro del modal
  const bovinosFiltradosModal = useMemo(() => {
    if (!filtroBovinoModal.trim()) return bovinosLista;
    const term = filtroBovinoModal.toLowerCase();
    return bovinosLista.filter(
      (b) =>
        b.arete.toLowerCase().includes(term) ||
        (b.nombre && b.nombre.toLowerCase().includes(term))
    );
  }, [bovinosLista, filtroBovinoModal]);

  const bovinoSeleccionado = useMemo(() => {
    return bovinosLista.find((b) => b.id === formData.bovino_id);
  }, [bovinosLista, formData.bovino_id]);

  // Guardar o Editar registro
  const handleSaveRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bovino_id) {
      alert('Por favor selecciona un animal.');
      return;
    }

    let queryDuplicado = supabase
      .from('produccion_leche')
      .select('id')
      .eq('bovino_id', formData.bovino_id)
      .eq('fecha', formData.fecha)
      .eq('jornada', formData.jornada);

    if (editingId) {
      queryDuplicado = queryDuplicado.neq('id', editingId);
    }

    const { data: duplicados, error: errCheck } = await queryDuplicado;

    if (errCheck) {
      alert('Error al verificar duplicados: ' + errCheck.message);
      return;
    }

    if (duplicados && duplicados.length > 0) {
      const nombreAnimal = bovinoSeleccionado
        ? `[${bovinoSeleccionado.arete}] ${bovinoSeleccionado.nombre || ''}`
        : 'este animal';
      alert(
        `⚠️ El animal ${nombreAnimal} ya tiene un registro para la fecha ${formData.fecha} en la jornada ${formData.jornada}.`
      );
      return;
    }

    const payload = {
      bovino_id: formData.bovino_id,
      fecha: formData.fecha,
      litros: parseFloat(formData.litros) || 0,
      jornada: formData.jornada,
      concentrado_kg: parseFloat(formData.concentrado_kg) || 0,
      observaciones: formData.observaciones || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from('produccion_leche')
        .update(payload)
        .eq('id', editingId);

      if (error) alert('Error al actualizar: ' + error.message);
    } else {
      const { error } = await supabase
        .from('produccion_leche')
        .insert([payload]);

      if (error) alert('Error al registrar: ' + error.message);
    }

    closeModal();
    fetchTablaDatos();
    fetchMetricas();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Deseas eliminar este registro de ordeño?')) {
      const { error } = await supabase
        .from('produccion_leche')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchTablaDatos();
        fetchMetricas();
      } else {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const handleOpenEdit = (item: ProduccionLeche) => {
    setEditingId(item.id);
    setFormData({
      bovino_id: item.bovino_id,
      fecha: item.fecha,
      litros: item.litros.toString(),
      jornada: item.jornada,
      concentrado_kg: (item.concentrado_kg || 0).toString(),
      observaciones: item.observaciones || '',
    });
    setFiltroBovinoModal('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFiltroBovinoModal('');
    setFormData({
      bovino_id: bovinosLista[0]?.id || '',
      fecha: new Date().toISOString().split('T')[0],
      litros: '',
      jornada: 'Mañana',
      concentrado_kg: '0',
      observaciones: '',
    });
  };

  const totalPaginas = Math.ceil(totalCount / PAGE_SIZE) || 1;

  return (
    <main className="w-full min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 font-sans text-slate-800 overflow-x-hidden">
      
      {/* ENCABEZADO PRINCIPAL */}
      <header className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Milk className="w-6 h-6 text-emerald-600" /> Producción de Leche
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Control de ordeño, concentrado y filtrado por fechas
          </p>
        </div>

        <button
          onClick={() => {
            if (bovinosLista.length > 0 && !formData.bovino_id) {
              setFormData((prev) => ({ ...prev, bovino_id: bovinosLista[0].id }));
            }
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Registrar Leche
        </button>
      </header>

      {/* SECCIÓN DE FILTROS AVANZADOS */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-600" /> Filtros de Consulta
          </span>
          {(busqueda || bovinoFiltroId || fechaInicio || fechaFin) && (
            <button
              onClick={resetFiltros}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscar por texto */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Buscar por arete o nombre..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {busqueda && (
              <button
                onClick={() => { setBusqueda(''); setPage(1); }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtrar por Bovino Específico */}
          <div>
            <select
              value={bovinoFiltroId}
              onChange={(e) => {
                setBovinoFiltroId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
            >
              <option value="">-- Todos los Animales --</option>
              {bovinosLista.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.arete}] {b.nombre || 'Sin nombre'}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Desde:</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700"
            />
          </div>

          {/* Fecha Fin */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Hasta:</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700"
            />
          </div>
        </div>
      </section>

      {/* TARJETAS DE MÉTRICAS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-400 truncate">
              Litros Totales
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 truncate">{litrosTotales}</span>
              <span className="text-xs font-semibold text-slate-500">L</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Milk className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-400 truncate">
              Concentrado
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 truncate">{concentradoTotal}</span>
              <span className="text-xs font-semibold text-slate-500">Kg</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wheat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-400 truncate">
              Promedio / Ordeño
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 truncate">{promedioOrdeno}</span>
              <span className="text-xs font-semibold text-slate-500">L</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-400 truncate">
              Registros
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 truncate">{totalCount}</span>
            </div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* TABLA PRINCIPAL DE HISTORIAL DE REGISTROS */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Historial de Ordeños
            </h2>
            <p className="text-[11px] text-slate-400">
              Mostrando hasta 10 registros por página
            </p>
          </div>
          {loading && <span className="text-xs text-emerald-600 animate-pulse font-semibold">Cargando...</span>}
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Arete</th>
                <th className="py-2.5 px-3">Nombre</th>
                <th className="py-2.5 px-3">Jornada</th>
                <th className="py-2.5 px-3 text-right">Concentrado</th>
                <th className="py-2.5 px-3 text-right">Litros</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {loading ? 'Consultando registros...' : 'No se encontraron resultados para los filtros seleccionados.'}
                  </td>
                </tr>
              ) : (
                registros.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {item.fecha}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {item.bovinos?.arete || 'S/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium whitespace-nowrap">
                      {item.bovinos?.nombre || 'Sin nombre'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.jornada === 'Mañana' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.jornada}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {item.concentrado_kg ?? 0} Kg
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                      {item.litros} L
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Editar registro"
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar registro"
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN CON BOTONES ANTERIOR Y SIGUIENTE */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Página <span className="font-extrabold text-slate-800">{page}</span> de{' '}
            <span className="font-extrabold text-slate-800">{totalPaginas}</span>{' '}
            ({totalCount} registros encontrados)
          </p>

          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={page >= totalPaginas || loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </section>

      {/* MODAL REGISTRO / EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Editar Registro' : 'Nuevo Registro de Ordeño'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegistro} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">
                  Buscar y Seleccionar Bovino
                </label>
                
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar por arete o nombre..."
                    value={filtroBovinoModal}
                    onChange={(e) => setFiltroBovinoModal(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  required
                  value={formData.bovino_id}
                  onChange={(e) => setFormData({ ...formData, bovino_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  <option value="" disabled>
                    -- Selecciona un animal ({bovinosFiltradosModal.length} disponibles) --
                  </option>
                  {bovinosFiltradosModal.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.arete}]{b.nombre ? ` ${b.nombre}` : ''}
                    </option>
                  ))}
                </select>

                {bovinoSeleccionado && (
                  <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    ✓ Seleccionado: <span className="font-bold">Arete {bovinoSeleccionado.arete}</span> ({bovinoSeleccionado.nombre || 'Sin nombre'})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Jornada</label>
                  <select
                    value={formData.jornada}
                    onChange={(e) => setFormData({ ...formData, jornada: e.target.value as 'Mañana' | 'Tarde' })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                  >
                    <option value="Mañana">☀️ Mañana</option>
                    <option value="Tarde">🌙 Tarde</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Litros de Leche</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.litros}
                    onChange={(e) => setFormData({ ...formData, litros: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Concentrado (Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.concentrado_kg}
                    onChange={(e) => setFormData({ ...formData, concentrado_kg: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Sanidad, condición del ordeño..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}