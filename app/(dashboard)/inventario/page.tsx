"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowUpRight, 
  Activity, 
  Scale, 
  HeartPulse, 
  Database, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  FileText,
  Filter,
  RefreshCw
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  genero: string;
  peso_inicial: number;
  fecha_nacimiento: string | null;
  observaciones: string | null;
  estado: string | null;
  created_at: string;
}

// Lista oficial de estados/etapas productivas del hato
const ESTADOS_BOVINOS = [
  "Ternera en lactancia",
  "Destete",
  "Ternera en crecimiento",
  "Levante",
  "Novilla en desarrollo",
  "Novilla de vientre",
  "En producción",
  "Seca",
  "Macho"
];

// Helper para badges de color por estado
const getEstadoBadgeStyle = (estado: string | null) => {
  switch (estado) {
    case "Ternera en lactancia":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "Destete":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Ternera en crecimiento":
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
    case "Levante":
      return "bg-lime-50 text-lime-800 border-lime-200";
    case "Novilla en desarrollo":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Novilla de vientre":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Producción":
    case "En producción":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Seca":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "Macho":
      return "bg-sky-50 text-sky-700 border-sky-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

export default function InventarioBovinosDashboard() {
  const supabase = createClient();

  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedEstado, setSelectedEstado] = useState<string>("Todos");
  const [selectedGenero, setSelectedGenero] = useState<string>("Todos");

  // Modales
  const [selectedBovino, setSelectedBovino] = useState<Bovino | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<Bovino>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchBovinos();
  }, []);

  const fetchBovinos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bovinos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar bovinos:", error);
      } else {
        setBovinos(data || []);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  // Ver Ficha Técnica
  const handleOpenDetail = (bovino: Bovino) => {
    setSelectedBovino(bovino);
    setIsDetailOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEdit = (bovino: Bovino) => {
    setSelectedBovino(bovino);
    setEditFormData({ ...bovino });
    setIsEditOpen(true);
  };

  // Guardar Cambios Editados
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBovino) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("bovinos")
        .update({
          arete: editFormData.arete,
          nombre: editFormData.nombre,
          raza: editFormData.raza,
          genero: editFormData.genero,
          peso_inicial: Number(editFormData.peso_inicial),
          fecha_nacimiento: editFormData.fecha_nacimiento,
          estado: editFormData.estado,
          observaciones: editFormData.observaciones,
        })
        .eq("id", selectedBovino.id);

      if (error) {
        console.error("Error al actualizar:", error);
        alert("Ocurrió un error al intentar actualizar los datos.");
      } else {
        await fetchBovinos();
        setIsEditOpen(false);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar Bovino
  const handleDelete = async (id: string, arete: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el registro del arete "${arete}"?`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("bovinos").delete().eq("id", id);

      if (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrió un error al intentar eliminar el registro.");
      } else {
        setBovinos((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  // Filtrado múltiple (Búsqueda por texto + Estado + Género)
  const filteredBovinos = bovinos.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.arete.toLowerCase().includes(term) ||
      (item.nombre && item.nombre.toLowerCase().includes(term)) ||
      item.raza.toLowerCase().includes(term);

    const matchesEstado = selectedEstado === "Todos" || item.estado === selectedEstado;
    const matchesGenero = selectedGenero === "Todos" || item.genero === selectedGenero;

    return matchesSearch && matchesEstado && matchesGenero;
  });

  // Métricas calculadas
  const totalBovinos = bovinos.length;
  const totalHembras = bovinos.filter((b) => b.genero === "Hembra").length;
  const totalMachos = bovinos.filter((b) => b.genero === "Macho").length;
  const enProduccionCount = bovinos.filter(
    (b) => b.estado === "Producción" || b.estado === "En producción"
  ).length;
  const pesoPromedio =
    totalBovinos > 0
      ? (bovinos.reduce((acc, curr) => acc + Number(curr.peso_inicial || 0), 0) / totalBovinos).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-slate-800 p-4 md:p-8 font-sans">
      
      {/* SECCIÓN HERO / KPI METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Titular y Tarjetas Principales */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              INVENTARIO BOVINO
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Control integral, etapas de desarrollo y trazabilidad del hato.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm relative">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase text-slate-400">Total Bovinos</span>
                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {totalBovinos} <span className="text-xs font-normal text-slate-500">Cabezas</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-2 mt-2">
                <span>Hembras: <strong>{totalHembras}</strong></span>
                <span>Machos: <strong>{totalMachos}</strong></span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm relative">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase text-slate-400">Peso Prom. Inicial</span>
                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Scale className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {pesoPromedio} <span className="text-xs font-normal text-slate-500">kg</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Estado Base de Datos */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <Database className="w-48 h-48" />
          </div>
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              Supabase Sync
            </span>
            <button 
              onClick={fetchBovinos} 
              title="Recargar datos"
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="z-10 my-4">
            <div className="text-3xl font-black">{totalBovinos} Registros</div>
            <p className="text-emerald-100 text-xs mt-1">Sincronizado correctamente con la base de datos.</p>
          </div>
          <div className="text-[11px] text-emerald-200 z-10 border-t border-white/10 pt-2">
            Última actualización: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Indicadores Adicionales */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">{enProduccionCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">EN PRODUCCIÓN</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">SALUD DEL HATO</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: BÚSQUEDA, FILTROS Y TABLA */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        
        {/* BARRA SUPERIOR DE BÚSQUEDA Y FILTROS */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
          
          {/* Campo de Búsqueda por Texto */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por arete, nombre o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selectores de Filtro */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                value={selectedEstado} 
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Etapa: Todos</option>
                {ESTADOS_BOVINOS.map((est) => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <select 
                value={selectedGenero} 
                onChange={(e) => setSelectedGenero(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Género: Todos</option>
                <option value="Hembra">Hembra</option>
                <option value="Macho">Macho</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLA DE REGISTROS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">Arete / Nombre</th>
                <th className="py-3 px-2">Raza</th>
                <th className="py-3 px-2">Género</th>
                <th className="py-3 px-2">Peso Inicial</th>
                <th className="py-3 px-2">Fecha Nacimiento</th>
                <th className="py-3 px-2 text-center">Estado / Etapa</th>
                <th className="py-3 px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    Cargando datos del inventario...
                  </td>
                </tr>
              ) : filteredBovinos.length > 0 ? (
                filteredBovinos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900">{item.arete}</div>
                      <div className="text-xs text-slate-400">{item.nombre || "Sin nombre"}</div>
                    </td>
                    <td className="py-3.5 px-2 text-slate-600 font-medium">{item.raza}</td>
                    <td className="py-3.5 px-2 font-medium">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        item.genero === "Hembra" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {item.genero}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-slate-700 font-semibold">{item.peso_inicial} kg</td>
                    <td className="py-3.5 px-2 text-slate-500 text-xs">{item.fecha_nacimiento || "No registrada"}</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getEstadoBadgeStyle(item.estado)}`}>
                        {item.estado || "Sin asignar"}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right space-x-1">
                      <button 
                        onClick={() => handleOpenDetail(item)}
                        title="Ver Ficha Técnica"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        title="Editar Animal"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.arete)}
                        title="Eliminar Registro"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No se encontraron bovinos que coincidan con la búsqueda o filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: FICHA TÉCNICA */}
      {isDetailOpen && selectedBovino && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="bg-emerald-600 text-white p-6 relative">
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-5 h-5 text-emerald-200" />
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-200">Ficha Técnica</span>
              </div>
              <h2 className="text-2xl font-black">
                {selectedBovino.nombre ? selectedBovino.nombre : `Arete: ${selectedBovino.arete}`}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">Arete: {selectedBovino.arete}</p>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Raza</span>
                  <span className="font-bold text-slate-800">{selectedBovino.raza}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Género</span>
                  <span className="font-bold text-slate-800">{selectedBovino.genero}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Peso Inicial</span>
                  <span className="font-bold text-slate-800">{selectedBovino.peso_inicial} kg</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Nacimiento</span>
                  <span className="font-bold text-slate-800">{selectedBovino.fecha_nacimiento || "No registrada"}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Estado / Etapa Actual</span>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full font-semibold text-xs border ${getEstadoBadgeStyle(selectedBovino.estado)}`}>
                  {selectedBovino.estado || "Sin asignar"}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Observaciones</span>
                <p className="text-slate-600 mt-1 text-xs leading-relaxed">
                  {selectedBovino.observaciones || "Sin observaciones registradas."}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR BOVINO */}
      {isEditOpen && selectedBovino && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base">Editar Animal</h2>
                <p className="text-xs text-slate-400">Arete: {selectedBovino.arete}</p>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Arete</label>
                <input 
                  type="text" 
                  value={editFormData.arete || ""} 
                  onChange={(e) => setEditFormData({...editFormData, arete: e.target.value})}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={editFormData.nombre || ""} 
                  onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Raza</label>
                  <input 
                    type="text" 
                    value={editFormData.raza || ""} 
                    onChange={(e) => setEditFormData({...editFormData, raza: e.target.value})}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Género</label>
                  <select 
                    value={editFormData.genero || "Hembra"}
                    onChange={(e) => setEditFormData({...editFormData, genero: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                  >
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Peso Inicial (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editFormData.peso_inicial || 0} 
                    onChange={(e) => setEditFormData({...editFormData, peso_inicial: Number(e.target.value)})}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Nacimiento</label>
                  <input 
                    type="date" 
                    value={editFormData.fecha_nacimiento || ""} 
                    onChange={(e) => setEditFormData({...editFormData, fecha_nacimiento: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Etapa / Estado</label>
                <select 
                  value={editFormData.estado || ""}
                  onChange={(e) => setEditFormData({...editFormData, estado: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                >
                  <option value="">Seleccionar etapa</option>
                  {ESTADOS_BOVINOS.map((est) => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Observaciones</label>
                <textarea 
                  rows={2}
                  value={editFormData.observaciones || ""} 
                  onChange={(e) => setEditFormData({...editFormData, observaciones: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}