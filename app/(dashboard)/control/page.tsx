'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from "@/lib/supabase/client";
import { 
  TrendingUp, 
  FileText, 
  ChevronDown, 
  Award, 
  Syringe, 
  Activity,
  Calendar,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// --- CONFIGURACIÓN DE SUPABASE ---
// Reemplaza con tus variables de entorno (.env.local)
const supabase = createClient();

// --- TIPOS DE DATOS DE TU BASE DE DATOS ---
interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  genero: string;
  peso_inicial: number;
  fecha_nacimiento: string | null;
  estado: string | null;
  observaciones: string | null;
}

interface ProduccionLeche {
  id: string;
  bovino_id: string;
  fecha: string;
  litros: number;
  jornada: 'Mañana' | 'Tarde';
  concentrado_kg: number | null;
}

interface Tratamiento {
  id: string;
  bovino_id: string;
  medicamento: string;
  dosis: string;
  via: string;
  fecha_aplicacion: string;
  tiempo_retiro: number;
  veterinario: string;
  motivo: string | null;
}

// Tooltip flotante con estilo oscuro / neón tipo Google Finanzas
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 border border-emerald-500/50 p-3 rounded-lg shadow-2xl backdrop-blur-md font-sans">
        <p className="text-xs text-zinc-400 font-mono mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-base">🥛</span>
          <span className="text-lg font-extrabold text-emerald-400">
            {Number(payload[0].value).toFixed(1)} <span className="text-xs font-normal text-zinc-300">Lts</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnimalDashboardPage() {
  // Estados de datos
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [selectedBovinoId, setSelectedBovinoId] = useState<string>('');
  const [produccion, setProduccion] = useState<ProduccionLeche[]>([]);
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de UI
  const [timeframe, setTimeframe] = useState<'days' | 'month' | 'year'>('days');
  const [activeTab, setActiveTab] = useState<'metrics' | 'resume'>('metrics');

  // 1. Cargar lista de bovinos al montar la página
  useEffect(() => {
    async function fetchBovinos() {
      setLoading(true);
      const { data, error } = await supabase.from('bovinos').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setBovinos(data);
        setSelectedBovinoId(data[0].id); // Seleccionar el primero por defecto
      }
      setLoading(false);
    }
    fetchBovinos();
  }, []);

  // 2. Cargar producción de leche y tratamientos cuando cambia el bovino seleccionado
  useEffect(() => {
    if (!selectedBovinoId) return;

    async function fetchAnimalDetails() {
      setLoading(true);
      
      // Consultar ordeños
      const { data: prodData } = await supabase
        .from('produccion_leche')
        .select('*')
        .eq('bovino_id', selectedBovinoId)
        .order('fecha', { ascending: true });

      // Consultar medicamentos / tratamientos
      const { data: tratData } = await supabase
        .from('tratamientos')
        .select('*')
        .eq('bovino_id', selectedBovinoId)
        .order('fecha_aplicacion', { ascending: false });

      if (prodData) setProduccion(prodData);
      if (tratData) setTratamientos(tratData);
      setLoading(false);
    }

    fetchAnimalDetails();
  }, [selectedBovinoId]);

  // Bovino actualmente seleccionado
  const selectedBovino = bovinos.find((b) => b.id === selectedBovinoId);

  // --- AGRUPACIÓN DINÁMICA DE DATOS (Días / Meses / Años) ---
  const chartData = useMemo(() => {
    if (!produccion || produccion.length === 0) return [];

    const groupedMap = new Map<string, number>();

    produccion.forEach((item) => {
      const dateObj = new Date(item.fecha);
      let key = '';

      if (timeframe === 'days') {
        // Formato: 25/07
        key = item.fecha; 
      } else if (timeframe === 'month') {
        // Formato: 2026-07 (Año-Mes)
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        key = `${monthNames[dateObj.getUTCMonth()]} ${dateObj.getUTCFullYear()}`;
      } else if (timeframe === 'year') {
        // Formato: 2026
        key = `${dateObj.getUTCFullYear()}`;
      }

      const currentLiters = groupedMap.get(key) || 0;
      groupedMap.set(key, currentLiters + Number(item.litros));
    });

    // Convertir Map a Array para Recharts
    return Array.from(groupedMap.entries()).map(([fecha, litros]) => ({
      fecha,
      litros: Number(litros.toFixed(2)),
    }));
  }, [produccion, timeframe]);

  // --- CÁLCULOS DE KPI Y METRICAS ---
  const totalProducido = useMemo(() => {
    return produccion.reduce((acc, curr) => acc + Number(curr.litros), 0);
  }, [produccion]);

  // Fechas únicas con ordeño
  const diasConOrdeno = useMemo(() => {
    const uniqueDates = new Set(produccion.map((p) => p.fecha));
    return uniqueDates.size;
  }, [produccion]);

  const promedioDiario = useMemo(() => {
    return diasConOrdeno > 0 ? (totalProducido / diasConOrdeno).toFixed(1) : '0.0';
  }, [totalProducido, diasConOrdeno]);

  // Días en Lactancia (DEL) = Días transcurridos desde el 1er ordeño
  const diasEnLactancia = useMemo(() => {
    if (produccion.length === 0) return { del: 0, fechaPrimerOrdeno: 'N/A' };
    
    // Como está ordenado por fecha ascendente:
    const primerOrdeno = new Date(produccion[0].fecha);
    const hoy = new Date();
    
    const diffTime = Math.abs(hoy.getTime() - primerOrdeno.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      del: diffDays,
      fechaPrimerOrdeno: produccion[0].fecha,
    };
  }, [produccion]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header con Selección de Animal y Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-emerald-400">🐄</span> Control de Producción y Ganado
            </h1>
            <p className="text-sm text-zinc-400">Análisis dinámico de ordeño e historial de salud</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Animal de la BD */}
            <div className="relative">
              <select
                value={selectedBovinoId}
                onChange={(e) => setSelectedBovinoId(e.target.value)}
                disabled={loading && bovinos.length === 0}
                className="appearance-none bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer disabled:opacity-50"
              >
                {bovinos.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.arete} - {b.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Selector de agrupamiento: Días, Mes, Año */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              {(['days', 'month', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    timeframe === t
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t === 'days' ? 'Días' : t === 'month' ? 'Meses' : 'Años'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-4 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'metrics'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Producción y Gráfica
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'resume'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Hoja de Vida y Sanidad
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-emerald-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-medium text-zinc-400">Cargando datos del animal...</span>
          </div>
        ) : (
          <>
            {/* --- SECCIÓN 1: METRICAS Y GRAFICA DE MONTAÑAS/PICOS --- */}
            {activeTab === 'metrics' && (
              <div className="space-y-6">
                
                {/* Las 4 Tarjetas de KPIs reales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Tarjeta 1 */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-zinc-400">Total Producido</span>
                    <div className="my-2">
                      <span className="text-2xl font-extrabold text-white">{totalProducido.toFixed(1)} Lts</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 border-t border-zinc-800/60 pt-2">
                      <span>🥛</span>
                      <span>Litros acumulados cargados</span>
                    </div>
                  </div>

                  {/* Tarjeta 2 */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-zinc-400">Promedio Diario</span>
                    <div className="my-2">
                      <span className="text-2xl font-extrabold text-white">{promedioDiario} <span className="text-sm font-normal text-zinc-400">Lts/día</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 border-t border-zinc-800/60 pt-2">
                      <span>📊</span>
                      <span>Promedio en días con ordeño</span>
                    </div>
                  </div>

                  {/* Tarjeta 3 */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-zinc-400">Días en Lactancia (DEL)</span>
                    <div className="my-2">
                      <span className="text-2xl font-extrabold text-white">{diasEnLactancia.del} Días</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 border-t border-zinc-800/60 pt-2">
                      <span>📅</span>
                      <span>Est. desde 1er ordeño: {diasEnLactancia.fechaPrimerOrdeno}</span>
                    </div>
                  </div>

                  {/* Tarjeta 4 */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-zinc-400">Estado Productivo</span>
                    <div className="my-2">
                      <span className="text-lg font-bold text-emerald-400">
                        {selectedBovino?.estado || 'Sin estado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 border-t border-zinc-800/60 pt-2 truncate">
                      <span>🐄</span>
                      <span className="truncate">Raza: {selectedBovino?.raza}</span>
                    </div>
                  </div>
                </div>

                {/* GRÁFICA DE LECHE (Con efecto Picos / Curva de Montaña) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Curva de Producción de Leche</h3>
                      <p className="text-xs text-zinc-400">
                        Visualización por {timeframe === 'days' ? 'Días' : timeframe === 'month' ? 'Meses' : 'Años'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400">Registros</span>
                      <p className="text-sm font-bold text-emerald-400">{chartData.length} Puntos</p>
                    </div>
                  </div>

                  {/* Canvas de la Gráfica */}
                  <div className="h-80 w-full">
                    {chartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                        No hay registros de ordeño para este animal.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            {/* Gradiente estilo Neón / Montaña */}
                            <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>

                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

                          <XAxis 
                            dataKey="fecha" 
                            stroke="#71717a" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis 
                            stroke="#71717a" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                          />

                          {/* Línea vertical punteada al pasar el cursor (Estilo Google) */}
                          <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4 4' }} 
                          />

                          {/* Curva Suave (type="monotone" genera los picos suaves tipo montaña) */}
                          <Area
                            type="monotone"
                            dataKey="litros"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#neonGradient)"
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* --- SECCIÓN 2: HOJA DE VIDA DEL ANIMAL --- */}
            {activeTab === 'resume' && selectedBovino && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tarjeta Datos Generales */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedBovino.nombre || 'Sin Nombre'}</h3>
                      <p className="text-xs text-zinc-400">Arete: {selectedBovino.arete}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-zinc-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Género:</span>
                      <span className="font-medium text-zinc-200">{selectedBovino.genero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Raza:</span>
                      <span className="font-medium text-zinc-200">{selectedBovino.raza}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Fecha Nacimiento:</span>
                      <span className="font-medium text-zinc-200">{selectedBovino.fecha_nacimiento || 'No registrada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Peso Inicial:</span>
                      <span className="font-medium text-zinc-200">{selectedBovino.peso_inicial} Kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Estado Actual:</span>
                      <span className="font-semibold text-emerald-400">{selectedBovino.estado}</span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta Observaciones / Notas */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">Observaciones del Bovino</h3>
                  </div>

                  <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-300">
                    <p className="italic bg-zinc-950 p-3 rounded border border-zinc-800/80">
                      "{selectedBovino.observaciones || 'Sin observaciones registradas para este ejemplar.'}"
                    </p>
                  </div>
                </div>

                {/* Tarjeta Historial de Tratamientos y Sanidad (Desde la tabla 'tratamientos') */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                      <Syringe className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">Tratamientos Medicamentos</h3>
                  </div>

                  <div className="space-y-2 border-t border-zinc-800 pt-3 text-xs max-h-60 overflow-y-auto pr-1">
                    {tratamientos.length === 0 ? (
                      <p className="text-zinc-500 text-xs">No hay tratamientos aplicados.</p>
                    ) : (
                      tratamientos.map((t) => (
                        <div key={t.id} className="p-2.5 bg-zinc-950 rounded border border-zinc-800 space-y-1">
                          <div className="flex justify-between font-semibold text-zinc-200">
                            <span>{t.medicamento}</span>
                            <span className="text-emerald-400">{t.dosis}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Vía: {t.via}</span>
                            <span>{t.fecha_aplicacion}</span>
                          </div>
                          {t.tiempo_retiro > 0 && (
                            <div className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit">
                              Tiempo retiro: {t.tiempo_retiro} días
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}