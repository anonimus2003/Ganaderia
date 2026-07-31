"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Scale,
  TrendingUp,
  Activity,
  Plus,
  Trash2,
  Edit,
  Search,
  ArrowUpRight,
  MoreHorizontal,
  X,
  Loader2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

// Inicialización del cliente de Supabase
const supabase = createClient();

export interface Pesaje {
  id: string;
  fecha: string;
  bovino_id?: string | null;
  peso_kgs: number;
  condicion_corporal: number | null;
  estado_fisiologico: string | null;
  observaciones: string | null;
  user_id?: string | null;
  created_at?: string;
}

export interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  genero: string;
  peso_inicial: number;
  estado: string | null;
}

export default function PesajesDashboard() {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Control del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPesaje, setEditingPesaje] = useState<Pesaje | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    bovino_id: "",
    fecha: new Date().toISOString().split("T")[0],
    peso_kgs: "",
    condicion_corporal: "3.0",
    estado_fisiologico: "",
    observaciones: "",
  });

  const selectedBovino = bovinos.find((b) => b.id === formData.bovino_id);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener Pesajes
      const { data: dataPesajes, error: errPesajes } = await supabase
        .from("pesajes")
        .select("*")
        .order("fecha", { ascending: false });

      if (errPesajes) throw errPesajes;

      // 2. Obtener Bovinos
      const { data: dataBovinos, error: errBovinos } = await supabase
        .from("bovinos")
        .select("id, arete, nombre, raza, genero, peso_inicial, estado")
        .order("arete", { ascending: true });

      if (errBovinos) throw errBovinos;

      setPesajes(dataPesajes || []);
      setBovinos(dataBovinos || []);
    } catch (error) {
      console.error("Error cargando datos de Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPesaje(null);
    setFormData({
      bovino_id: "",
      fecha: new Date().toISOString().split("T")[0],
      peso_kgs: "",
      condicion_corporal: "3.0",
      estado_fisiologico: "",
      observaciones: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pesaje: Pesaje) => {
    setEditingPesaje(pesaje);

    setFormData({
      bovino_id: pesaje.bovino_id || "",
      fecha: pesaje.fecha,
      peso_kgs: pesaje.peso_kgs.toString(),
      condicion_corporal: pesaje.condicion_corporal ? pesaje.condicion_corporal.toString() : "3.0",
      estado_fisiologico: pesaje.estado_fisiologico || "",
      observaciones: pesaje.observaciones || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bovino_id && !editingPesaje?.bovino_id) {
      alert("Por favor selecciona un bovino de la lista.");
      return;
    }

    setSubmitting(true);

    try {
      // Obtener usuario logueado en Supabase Auth (si aplica)
      const { data: { user } } = await supabase.auth.getUser();

      // Payload ajustado estrictamente a las columnas reales de la tabla "pesajes"
      const payload: Record<string, any> = {
        fecha: formData.fecha,
        peso_kgs: parseFloat(formData.peso_kgs),
        condicion_corporal: formData.condicion_corporal ? parseFloat(formData.condicion_corporal) : null,
        estado_fisiologico: formData.estado_fisiologico || null,
        observaciones: formData.observaciones || null,
        bovino_id: formData.bovino_id || editingPesaje?.bovino_id || null,
      };

      if (user?.id) {
        payload.user_id = user.id;
      }

      let errorSupabase = null;

      if (editingPesaje) {
        const { error } = await supabase
          .from("pesajes")
          .update(payload)
          .eq("id", editingPesaje.id);
        errorSupabase = error;
      } else {
        const { error } = await supabase
          .from("pesajes")
          .insert([payload]);
        errorSupabase = error;
      }

      if (errorSupabase) {
        throw errorSupabase;
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error al guardar en Supabase:", error);
      const detalleError = error?.message || error?.details || "Error desconocido al intentar conectar con Supabase.";
      alert(`Ocurrió un error al guardar el registro:\n\n${detalleError}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este pesaje?")) {
      try {
        const { error } = await supabase.from("pesajes").delete().eq("id", id);
        if (error) throw error;
        setPesajes(pesajes.filter((p) => p.id !== id));
      } catch (error: any) {
        console.error("Error al eliminar pesaje:", error);
        alert(`No se pudo eliminar el registro: ${error?.message || "Error de permisos/red"}`);
      }
    }
  };

  // Función auxiliar para cruzar los datos del bovino en pantalla mediante el bovino_id
  const getBovinoInfo = (pesaje: Pesaje) => {
    const b = bovinos.find((item) => item.id === pesaje.bovino_id);

    return {
      numero: b?.arete || "N/A",
      nombre: b?.nombre || b?.arete || "Sin nombre",
      categoria: b?.estado || "General",
    };
  };

  const totalPesajes = pesajes.length;
  const promedioPeso =
    totalPesajes > 0
      ? pesajes.reduce((acc, curr) => acc + Number(curr.peso_kgs), 0) / totalPesajes
      : 0;

  const condicionPromedio =
    totalPesajes > 0
      ? pesajes.reduce((acc, curr) => acc + (Number(curr.condicion_corporal) || 3), 0) / totalPesajes
      : 3.0;

  // Filtrado de búsqueda dinámico cruzando con la tabla bovinos
  const filteredPesajes = pesajes.filter((p) => {
    const info = getBovinoInfo(p);
    const search = searchTerm.toLowerCase();
    return (
      info.numero.toLowerCase().includes(search) ||
      info.nombre.toLowerCase().includes(search) ||
      info.categoria.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-[#f3f5f3] p-4 md:p-6 text-gray-800 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e3eae1] via-[#dbe4d8] to-[#c8d8c3] p-6 md:p-10 shadow-sm border border-white/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-6 z-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 uppercase leading-tight">
                  Control de Pesaje <br />
                  <span className="text-lime-700">Ganadero</span>
                </h1>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Registro oficial en base de datos vinculado a la tabla de Bovinos.
                </p>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-semibold shadow-md transition transform active:scale-95 text-sm"
              >
                <Plus className="w-5 h-5 text-lime-400" /> Registrar Nuevo Pesaje
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-500">Peso Promedio<br />Registrado</span>
                    <button className="p-1 rounded-full bg-white shadow-sm border border-gray-100">
                      <ArrowUpRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="text-2xl font-bold mt-2 text-gray-900">
                    {promedioPeso.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-lime-500 h-full rounded-full w-[70%]"></div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-500">Condición<br />Corporal Prom.</span>
                    <button className="p-1 rounded-full bg-white shadow-sm border border-gray-100">
                      <TrendingUp className="w-4 h-4 text-lime-600" />
                    </button>
                  </div>
                  <div className="text-2xl font-bold mt-2 text-gray-900">
                    {condicionPromedio.toFixed(1)} <span className="text-sm font-normal text-gray-500">/ 5.0</span>
                  </div>
                  <div className="h-6 mt-1 flex items-end">
                    <svg className="w-full h-5 text-lime-600 stroke-current" viewBox="0 0 100 30" fill="none" strokeWidth="3">
                      <path d="M 0 20 Q 25 5, 50 15 T 100 8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-center items-end space-y-4">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 w-full shadow-sm border border-white/50 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
                  <div className="text-xs font-bold text-gray-500 uppercase">Total Pesajes</div>
                  <div className="text-2xl font-extrabold text-gray-900">{totalPesajes}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-gray-500 uppercase">Bovinos Reg.</div>
                  <span className="bg-lime-200 text-lime-800 text-xs font-bold px-3 py-1 rounded-full">
                    {bovinos.length} Animales
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-lime-100/70 rounded-xl text-lime-800 font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{pesajes.filter(p => p.peso_kgs >= 400).length}</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                    &ge; 400 kg
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Animales de Peso Alto</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100/70 rounded-xl text-amber-800 font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {pesajes.filter(p => p.condicion_corporal && p.condicion_corporal < 2.5).length}
                  </span>
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    C.C. &lt; 2.5
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Baja Condición Corporal</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-100/70 rounded-xl text-sky-800 font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {pesajes.filter(p => p.fecha === new Date().toISOString().split("T")[0]).length}
                  </span>
                  <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">
                    Hoy
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Pesajes Registrados Hoy</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* TABLA PRINCIPAL */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Histórico de Pesajes</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Registros sincronizados desde la base de datos Supabase.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por Arete, Nombre o Categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-lime-600" />
                  <span className="text-xs">Cargando pesajes desde Supabase...</span>
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-3 px-2">Arete / Nombre</th>
                        <th className="py-3 px-2">Categoría</th>
                        <th className="py-3 px-2">Peso (kg)</th>
                        <th className="py-3 px-2">C. Corporal</th>
                        <th className="py-3 px-2">Fecha</th>
                        <th className="py-3 px-2">E. Fisiológico</th>
                        <th className="py-3 px-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {filteredPesajes.length > 0 ? (
                        filteredPesajes.map((p) => {
                          const info = getBovinoInfo(p);
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/80 transition">
                              <td className="py-3 px-2">
                                <div className="font-bold text-gray-900">{info.numero}</div>
                                <div className="text-[10px] text-gray-400">{info.nombre}</div>
                              </td>
                              <td className="py-3 px-2 text-gray-600 font-medium">
                                <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                  {info.categoria}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-extrabold text-gray-900">
                                {p.peso_kgs} <span className="text-[10px] font-normal text-gray-400">kg</span>
                              </td>
                              <td className="py-3 px-2">
                                {p.condicion_corporal ? (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    p.condicion_corporal >= 3.0
                                      ? "bg-lime-100 text-lime-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {p.condicion_corporal} / 5.0
                                  </span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-gray-500 font-medium">
                                {p.fecha}
                              </td>
                              <td className="py-3 px-2 text-gray-500 italic">
                                {p.estado_fisiologico || "-"}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenEditModal(p)}
                                    title="Editar Pesaje"
                                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(p.id)}
                                    title="Eliminar Pesaje"
                                    className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400 text-xs">
                            No se encontraron registros de pesaje.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm text-gray-900">Bovinos Registrados</h4>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                  {bovinos.length}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {bovinos.length > 0 ? (
                  bovinos.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100 hover:bg-gray-100/80 transition"
                    >
                      <div>
                        <div className="font-bold text-xs text-gray-800">{b.arete} - {b.nombre || "Sin nombre"}</div>
                        <div className="text-[10px] text-gray-400">{b.raza} • {b.genero}</div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">
                        {b.estado || "General"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">No hay bovinos registrados en el sistema.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-gray-900">Actividad de Pesajes</h3>
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>

              <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
                {[
                  { day: "Lu", val: "h-12", bg: "bg-lime-400" },
                  { day: "Ma", val: "h-20", bg: "bg-gray-900" },
                  { day: "Mi", val: "h-16", bg: "bg-lime-400" },
                  { day: "Ju", val: "h-24", bg: "bg-gray-900" },
                  { day: "Vi", val: "h-14", bg: "bg-lime-400" },
                  { day: "Sá", val: "h-8", bg: "bg-gray-200" },
                  { day: "Do", val: "h-10", bg: "bg-gray-200" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={`w-full ${item.val} ${item.bg} rounded-md transition-all`}></div>
                    <span className="text-[10px] text-gray-400 font-medium">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL REGISTRO / EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {editingPesaje ? "Editar Pesaje" : "Ingresar Nuevo Pesaje"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Seleccionar Bovino <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.bovino_id}
                  onChange={(e) => setFormData({ ...formData, bovino_id: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none font-medium"
                >
                  <option value="">-- Selecciona un Bovino de la Base de Datos --</option>
                  {bovinos.map((b) => (
                    <option key={b.id} value={b.id}>
                      Arete: {b.arete} - {b.nombre || "Sin nombre"} ({b.raza})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBovino && (
                <div className="bg-lime-50/80 border border-lime-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-lime-800 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4 text-lime-600" />
                    <span>Animal Seleccionado</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-700">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Arete:</span>
                      <strong className="text-gray-900">{selectedBovino.arete}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Nombre:</span>
                      <strong className="text-gray-900">{selectedBovino.nombre || "Sin Nombre"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Categoría:</span>
                      <strong className="text-gray-900">{selectedBovino.estado || "General"}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Fecha de Pesaje <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Peso (Kgs) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej: 450.50"
                    value={formData.peso_kgs}
                    onChange={(e) => setFormData({ ...formData, peso_kgs: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Condición Corporal (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    placeholder="3.0"
                    value={formData.condicion_corporal}
                    onChange={(e) => setFormData({ ...formData, condicion_corporal: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estado Fisiológico</label>
                  <input
                    type="text"
                    placeholder="Ej: Gestante 4 meses, etc."
                    value={formData.estado_fisiologico}
                    onChange={(e) => setFormData({ ...formData, estado_fisiologico: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Observaciones o notas adicionales..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!formData.bovino_id && !editingPesaje)}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin text-lime-400" />}
                  {editingPesaje ? "Guardar Cambios" : "Guardar Pesaje"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}