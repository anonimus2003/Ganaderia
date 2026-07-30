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
  Check,
  Loader2,
  Calendar,
} from "lucide-react";

// Inicialización del cliente de Supabase
const supabase = createClient();

// Interfaces basadas en tu esquema SQL
export interface Pesaje {
  id: string;
  fecha: string;
  numero: string;
  nombre: string;
  categoria: string;
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

// Opciones exactas para categoría / estado fisiológico
const CATEGORIAS_OPCIONES = [
  "Ternera en lactancia",
  "Destete",
  "Ternera en crecimiento",
  "Levante",
  "Novilla en desarrollo",
  "Novilla de vientre",
  "En producción",
  "Seca",
];

export default function PesajesDashboard() {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Control del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPesaje, setEditingPesaje] = useState<Pesaje | null>(null);

  // Formulario vinculado a la tabla `pesajes`
  const [formData, setFormData] = useState({
    bovino_id: "", // Para selección rápida desde la tabla bovinos
    fecha: new Date().toISOString().split("T")[0],
    numero: "",
    nombre: "",
    categoria: "En producción",
    peso_kgs: "",
    condicion_corporal: "3.0",
    estado_fisiologico: "",
    observaciones: "",
  });

  // Cargar datos iniciales desde Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener Pesajes ordenados por fecha descendente
      const { data: dataPesajes, error: errPesajes } = await supabase
        .from("pesajes")
        .select("*")
        .order("fecha", { ascending: false });

      if (errPesajes) throw errPesajes;

      // 2. Obtener Bovinos activos para selector de auto-completado
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

  // Autocompletar datos del animal cuando se selecciona en el Modal
  const handleSelectBovino = (bovinoId: string) => {
    const selected = bovinos.find((b) => b.id === bovinoId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        bovino_id: bovinoId,
        numero: selected.arete,
        nombre: selected.nombre || selected.arete,
        categoria: selected.estado || prev.categoria,
      }));
    } else {
      setFormData((prev) => ({ ...prev, bovino_id: "" }));
    }
  };

  // Abrir Modal para Crear
  const handleOpenCreateModal = () => {
    setEditingPesaje(null);
    setFormData({
      bovino_id: "",
      fecha: new Date().toISOString().split("T")[0],
      numero: "",
      nombre: "",
      categoria: "En producción",
      peso_kgs: "",
      condicion_corporal: "3.0",
      estado_fisiologico: "",
      observaciones: "",
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (pesaje: Pesaje) => {
    setEditingPesaje(pesaje);

    // Intentar vincular con un bovino existente por arete
    const matchedBovino = bovinos.find((b) => b.arete === pesaje.numero);

    setFormData({
      bovino_id: matchedBovino ? matchedBovino.id : "",
      fecha: pesaje.fecha,
      numero: pesaje.numero,
      nombre: pesaje.nombre,
      categoria: pesaje.categoria,
      peso_kgs: pesaje.peso_kgs.toString(),
      condicion_corporal: pesaje.condicion_corporal ? pesaje.condicion_corporal.toString() : "3.0",
      estado_fisiologico: pesaje.estado_fisiologico || "",
      observaciones: pesaje.observaciones || "",
    });
    setIsModalOpen(true);
  };

  // GUARDAR EN SUPABASE (Insertar o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        fecha: formData.fecha,
        numero: formData.numero,
        nombre: formData.nombre,
        categoria: formData.categoria,
        peso_kgs: parseFloat(formData.peso_kgs),
        condicion_corporal: formData.condicion_corporal ? parseFloat(formData.condicion_corporal) : null,
        estado_fisiologico: formData.estado_fisiologico || null,
        observaciones: formData.observaciones || null,
        user_id: user?.id || null,
      };

      if (editingPesaje) {
        // UPDATE
        const { error } = await supabase
          .from("pesajes")
          .update(payload)
          .eq("id", editingPesaje.id);

        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from("pesajes")
          .insert([payload]);

        if (error) throw error;
      }

      await fetchData(); // Recargar datos actualizados
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar el pesaje:", error);
      alert("Ocurrió un error al guardar el registro. Revisa los datos ingresados.");
    } finally {
      setSubmitting(false);
    }
  };

  // ELIMINAR DE SUPABASE
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este pesaje?")) {
      try {
        const { error } = await supabase.from("pesajes").delete().eq("id", id);
        if (error) throw error;
        setPesajes(pesajes.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error al eliminar pesaje:", error);
        alert("No se pudo eliminar el registro.");
      }
    }
  };

  // Métricas calculadas dinámicamente
  const totalPesajes = pesajes.length;
  const promedioPeso =
    totalPesajes > 0
      ? pesajes.reduce((acc, curr) => acc + Number(curr.peso_kgs), 0) / totalPesajes
      : 0;

  const condicionPromedio =
    totalPesajes > 0
      ? pesajes.reduce((acc, curr) => acc + (Number(curr.condicion_corporal) || 3), 0) / totalPesajes
      : 3.0;

  // Filtrado de lista por búsqueda
  const filteredPesajes = pesajes.filter(
    (p) =>
      p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f5f3] p-4 md:p-6 text-gray-800 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ================= HERO SECTION (SIN IMAGEN) ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e3eae1] via-[#dbe4d8] to-[#c8d8c3] p-6 md:p-10 shadow-sm border border-white/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

            {/* Encabezado y Acción Principal */}
            <div className="lg:col-span-8 space-y-6 z-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 uppercase leading-tight">
                  Control de Pesaje <br />
                  <span className="text-lime-700">Ganadero</span>
                </h1>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Registro oficial en base de datos de pesaje y condición corporal.
                </p>
              </div>

              {/* Botón de Agregar Nuevo Pesaje */}
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-semibold shadow-md transition transform active:scale-95 text-sm"
              >
                <Plus className="w-5 h-5 text-lime-400" /> Registrar Nuevo Pesaje
              </button>

              {/* Tarjetas informativas superiores */}
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
                  <p className="text-[10px] text-gray-500 mt-1">Global pesajes</p>
                  <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
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

            {/* Métrica lateral de inventario de bovinos */}
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

        {/* ================= METRICS STATS ================= */}
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
                <p className="text-xs text-gray-400 mt-0.5">Animales Pesados de Peso Alto</p>
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

        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* TABLA PRINCIPAL CRUD DE PESAJES */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
            <div>
              {/* Header de la Tabla */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Histórico de Pesajes</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Registros sincronizados directamente con Supabase.
                  </p>
                </div>

                {/* Buscador */}
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

              {/* Estado de Carga */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-lime-600" />
                  <span className="text-xs">Cargando pesajes desde la base de datos...</span>
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
                        filteredPesajes.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition">
                            <td className="py-3 px-2">
                              <div className="font-bold text-gray-900">{p.numero}</div>
                              <div className="text-[10px] text-gray-400">{p.nombre}</div>
                            </td>
                            <td className="py-3 px-2 text-gray-600 font-medium">
                              <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                {p.categoria}
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
                        ))
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

          {/* COLUMNA DERECHA: DISTRIBUCIÓN Y PANEL DE BOVINOS */}
          <div className="lg:col-span-4 space-y-6">

            {/* Listado de Bovinos en Sistema */}
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
                  <p className="text-xs text-gray-400 py-4 text-center">No hay bovinos registrados en la tabla `bovinos`.</p>
                )}
              </div>
            </div>

            {/* Gráfico de Distribución de Pesajes por Día */}
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

      {/* ================= MODAL REGISTRO / EDICIÓN DE PESAJE ================= */}
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

              {/* Selector Rápido de Bovino */}
              {!editingPesaje && bovinos.length > 0 && (
                <div className="bg-lime-50/70 p-3 rounded-2xl border border-lime-200">
                  <label className="block font-bold text-lime-900 mb-1">
                    Seleccionar Bovino Existente (Opcional)
                  </label>
                  <select
                    value={formData.bovino_id}
                    onChange={(e) => handleSelectBovino(e.target.value)}
                    className="w-full bg-white border border-lime-300 rounded-xl p-2 text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="">-- Seleccionar de la lista de Bovinos --</option>
                    {bovinos.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.arete} - {b.nombre || "Sin nombre"} 
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Arete (numero) y Nombre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Número / Arete <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 105"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Vaca Paloma"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Categoría y Fecha */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Categoría <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  >
                    {CATEGORIAS_OPCIONES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              {/* Peso Kgs y Condición Corporal */}
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              {/* Estado Fisiológico */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Estado Fisiológico</label>
                <input
                  type="text"
                  placeholder="Ej: Gestante 4 meses, Lactancia 2do mes, etc."
                  value={formData.estado_fisiologico}
                  onChange={(e) => setFormData({ ...formData, estado_fisiologico: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Observaciones o notas adicionales..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-lime-500 focus:outline-none resize-none"
                />
              </div>

              {/* Botones del Modal */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white px-5 py-2 rounded-xl font-bold transition shadow-sm disabled:opacity-50 text-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Guardar Pesaje
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}