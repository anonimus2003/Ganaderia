'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  SlidersHorizontal,
  Scale,
  Clock,
  History
} from 'lucide-react';

interface Potrero {
  id: number;
  nombre: string;
  estado: string;
  crecimiento?: number;
  tipoPasto?: string;
  ultimoAbono?: string;
  fechaAbono?: string;
  diasDescanso?: number;
  bovinosActuales?: number;
  mensajeCrecimiento?: string;
  areaM2?: number;
  fechaSalidaGanado?: string;
  fechaEntradaGanado?: string;
  aforo?: number;
  x: number;
  y: number;
}

interface HistorialItem {
  id: number;
  estado_anterior: string;
  estado_nuevo: string;
  bovinos_actuales: number;
  fecha_entrada: string;
  fecha_salida: string;
  fecha_cambio: string;
}

export default function GestionPotrerosModule() {
  const supabase = createClient();

  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [historialPotrero, setHistorialPotrero] = useState<HistorialItem[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState<boolean>(false);
  const [paginaHistorial, setPaginaHistorial] = useState<number>(1);
  const [mostrarControlesMover, setMostrarControlesMover] = useState<boolean>(false);

  const [creandoDesdeMapa, setCreandoDesdeMapa] = useState<boolean>(false);
  const [nuevoX, setNuevoX] = useState<number>(50);
  const [nuevoY, setNuevoY] = useState<number>(50);

  // Modal Nuevo Potrero
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevoArea, setNuevoArea] = useState<number>(3500);
  const [nuevoPasto, setNuevoPasto] = useState<string>('Brachiaria');
  const [nuevoAforo, setNuevoAforo] = useState<number>(0.5);

  // Modal Editar Potrero
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editArea, setEditArea] = useState(0);
  const [editBovinos, setEditBovinos] = useState<number>(0);
  const [editPasto, setEditPasto] = useState('');
  const [editAforo, setEditAforo] = useState<number>(0);
  const [editFechaEntrada, setEditFechaEntrada] = useState('');
  const [editFechaSalida, setEditFechaSalida] = useState('');

  useEffect(() => {
    fetchPotreros();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchHistorial(selectedId);
    }
  }, [selectedId, potreros]);

  const fetchPotreros = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('potreros').select('*').order('id', { ascending: true });
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formatted: Potrero[] = data.map(p => {
          let diasDescansoCalculados = p.dias_descanso || 0;
          if (p.fecha_salida_ganado && (!p.fecha_entrada_ganado || new Date(p.fecha_salida_ganado) > new Date(p.fecha_entrada_ganado))) {
            const diffTime = Math.abs(new Date().getTime() - new Date(p.fecha_salida_ganado).getTime());
            diasDescansoCalculados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          }

          return {
            id: p.id,
            nombre: p.nombre,
            estado: p.estado || 'En Descanso',
            crecimiento: p.crecimiento,
            tipoPasto: p.tipo_pasto,
            ultimoAbono: p.ultimo_abono,
            fechaAbono: p.fecha_abono,
            diasDescanso: diasDescansoCalculados,
            bovinosActuales: p.bovinos_actuales ?? 0,
            mensajeCrecimiento: p.mensaje_crecimiento,
            areaM2: p.area_m2,
            fechaSalidaGanado: p.fecha_salida_ganado,
            fechaEntradaGanado: p.fecha_entrada_ganado,
            aforo: p.aforo ?? 0,
            x: p.x ?? 50,
            y: p.y ?? 50
          };
        });
        setPotreros(formatted);
        if (!formatted.some(p => p.id === selectedId)) {
          setSelectedId(formatted[0].id);
        }
      }
    } catch (error: any) {
      console.error('Error al cargar potreros:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async (id: number) => {
    setPaginaHistorial(1);
    const { data, error } = await supabase
      .from('historial_potreros')
      .select('*')
      .eq('potrero_id', id)
      .order('fecha_cambio', { ascending: false });

    if (!error && data) {
      setHistorialPotrero(data);
    } else {
      setHistorialPotrero([]);
    }
  };

  const potreroSeleccionado = potreros.find((p) => p.id === selectedId) || potreros[0];

  // Configuración de Paginación del Historial (3 elementos por página)
  const itemsPorPagina = 3;
  const totalPaginasHistorial = Math.ceil(historialPotrero.length / itemsPorPagina);
  const indiceUltimoItemHistorial = paginaHistorial * itemsPorPagina;
  const indicePrimerItemHistorial = indiceUltimoItemHistorial - itemsPorPagina;
  const historialPaginado = historialPotrero.slice(indicePrimerItemHistorial, indiceUltimoItemHistorial);

  const moverPin = async (direccion: 'arriba' | 'abajo' | 'izquierda' | 'derecha') => {
    if (!potreroSeleccionado) return;
    let nuevoX = potreroSeleccionado.x;
    let nuevoY = potreroSeleccionado.y;
    const paso = 1.5;

    if (direccion === 'arriba') nuevoY = Math.max(0, Number((nuevoY - paso).toFixed(1)));
    if (direccion === 'abajo') nuevoY = Math.min(100, Number((nuevoY + paso).toFixed(1)));
    if (direccion === 'izquierda') nuevoX = Math.max(0, Number((nuevoX - paso).toFixed(1)));
    if (direccion === 'derecha') nuevoX = Math.min(100, Number((nuevoX + paso).toFixed(1)));

    const { error } = await supabase
      .from('potreros')
      .update({ x: nuevoX, y: nuevoY })
      .eq('id', potreroSeleccionado.id);

    if (!error) {
      setPotreros(
        potreros.map((p) => (p.id === potreroSeleccionado.id ? { ...p, x: nuevoX, y: nuevoY } : p))
      );
    }
  };

  const handleManejarClickMapa = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!creandoDesdeMapa) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;
    const xPorcentaje = Math.round((xClick / rect.width) * 100);
    const yPorcentaje = Math.round((yClick / rect.height) * 100);

    setNuevoX(xPorcentaje);
    setNuevoY(yPorcentaje);
    setCreandoDesdeMapa(false);
    setIsModalOpen(true);
  };

  const agregarNuevoPotrero = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoPotreroDb = {
      nombre: nuevoNombre.trim() || 'Nuevo Potrero',
      estado: 'En Descanso',
      area_m2: Number(nuevoArea),
      tipo_pasto: nuevoPasto,
      bovinos_actuales: 0,
      dias_descanso: 0,
      crecimiento: 0,
      aforo: Number(nuevoAforo),
      x: Number(nuevoX),
      y: Number(nuevoY)
    };

    const { data, error } = await supabase.from('potreros').insert([nuevoPotreroDb]).select();

    if (error) {
      alert(`Error al guardar en Supabase: ${error.message}`);
    } else {
      setFiltroEstado('todos');
      await fetchPotreros();
      if (data && data.length > 0) {
        setSelectedId(data[0].id);
      }
      setIsModalOpen(false);
      setNuevoNombre('');
    }
  };

  const abrirModalEdicion = () => {
    if (!potreroSeleccionado) return;
    setEditNombre(potreroSeleccionado.nombre);
    setEditArea(potreroSeleccionado.areaM2 || 0);
    setEditBovinos(potreroSeleccionado.bovinosActuales || 0);
    setEditPasto(potreroSeleccionado.tipoPasto || '');
    setEditAforo(potreroSeleccionado.aforo || 0);
    setEditFechaEntrada(potreroSeleccionado.fechaEntradaGanado || '');
    setEditFechaSalida(potreroSeleccionado.fechaSalidaGanado || '');
    setIsEditModalOpen(true);
  };

  const guardarEdicionPotrero = async (e: React.FormEvent) => {
    e.preventDefault();

    let bovinosFinal = Number(editBovinos);
    let nuevoEstado = bovinosFinal > 0 ? 'Ocupado' : 'En Descanso';
    let estadoAnterior = potreroSeleccionado?.estado || 'En Descanso';

    let diasDescansoCalculados = 0;
    if (nuevoEstado === 'En Descanso' && editFechaSalida) {
      const diffTime = Math.abs(new Date().getTime() - new Date(editFechaSalida).getTime());
      diasDescansoCalculados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    const datosActualizados = {
      nombre: editNombre,
      area_m2: Number(editArea),
      estado: nuevoEstado,
      bovinos_actuales: bovinosFinal,
      tipo_pasto: editPasto,
      aforo: Number(editAforo),
      fecha_entrada_ganado: editFechaEntrada || null,
      fecha_salida_ganado: editFechaSalida || null,
      dias_descanso: diasDescansoCalculados
    };

    const { error } = await supabase
      .from('potreros')
      .update(datosActualizados)
      .eq('id', selectedId);

    if (!error) {
      await supabase.from('historial_potreros').insert([{
        potrero_id: selectedId,
        potrero_nombre: editNombre,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        bovinos_actuales: bovinosFinal,
        fecha_entrada: editFechaEntrada || null,
        fecha_salida: editFechaSalida || null
      }]);

      await fetchPotreros();
      await fetchHistorial(selectedId);
      setIsEditModalOpen(false);
    } else {
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const eliminarPotrero = async (id: number) => {
    if (potreros.length <= 1) {
      alert('Debe conservar al menos un potrero en el sistema.');
      return;
    }
    if (confirm(`¿Está seguro de eliminar este potrero?`)) {
      const { error } = await supabase.from('potreros').delete().eq('id', id);
      if (!error) {
        fetchPotreros();
      } else {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  const potrerosFiltrados = potreros.filter((p) => {
    const coincideFiltro = filtroEstado === 'todos' || p.estado.toLowerCase() === filtroEstado.toLowerCase();
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.id.toString().includes(busqueda);
    return coincideFiltro && coincideBusqueda;
  });

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando potreros desde Supabase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-100 font-sans text-slate-800 flex flex-col overflow-hidden p-4 gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              filtroEstado === 'todos' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({potreros.length})
          </button>
          <button
            onClick={() => setFiltroEstado('Ocupado')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              filtroEstado === 'Ocupado' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ocupados
          </button>
          <button
            onClick={() => setFiltroEstado('En Descanso')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              filtroEstado === 'En Descanso' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En Descanso
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar Potrero..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56 transition"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Potrero</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-4 min-h-0">
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center overflow-auto relative">
          <div 
            onClick={handleManejarClickMapa}
            className={`relative inline-block max-h-[70vh] ${creandoDesdeMapa ? 'cursor-crosshair' : 'cursor-default'}`}
          >
            <img
              src="https://erkepwaugzippkgzzrzf.supabase.co/storage/v1/object/sign/imagenes/potreros.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mN2JlOWRmYy0yNzUyLTRkYzgtODZiMy00MTVmOWQxMzg3MzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5lcy9wb3RyZXJvcy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1NTMyMzUxLCJleHAiOjE4NDg2MDQzNTF9.DUdPhx3BKxDxN3ZCsLpgkGBkyhOazizei97UU_vn8nM"
              alt="Plano Parcelaria"
              className="max-h-[70vh] w-auto object-contain rounded-lg shadow-inner select-none block pointer-events-none"
            />

            {potrerosFiltrados.map((p) => {
              const isSelected = p.id === selectedId;
              const isOcupado = p.estado?.toLowerCase() === 'ocupado';
              return (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(p.id);
                  }}
                  style={{ top: `${p.y}%`, left: `${p.x}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all transform shadow-md border ${
                    isOcupado
                      ? 'bg-rose-600/90 border-rose-200 text-white hover:bg-rose-700'
                      : 'bg-emerald-600/90 border-emerald-200 text-white hover:bg-emerald-700'
                  } ${isSelected ? 'ring-4 ring-amber-400 scale-125 z-30' : 'hover:scale-110 z-20'}`}
                  title={`${p.nombre} - ${p.estado}`}
                >
                  {p.id}
                </button>
              );
            })}
          </div>

          <span className="absolute bottom-2 left-4 text-[11px] text-slate-500 bg-white/90 px-3 py-1 rounded-lg border border-slate-200 shadow-sm backdrop-blur">
            {creandoDesdeMapa ? '⚡ Haz clic en el mapa para ubicar el nuevo potrero' : 'Haz clic en cualquier marcador para gestionarlo'}
          </span>

        </div>

        <div className="w-[400px] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">
                {potreroSeleccionado?.nombre}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                potreroSeleccionado?.estado?.toLowerCase() === 'ocupado' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}>
                {potreroSeleccionado?.estado}
              </span>
            </div>

            <div className="py-3 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Área Total:</span>
                <span className="font-semibold text-slate-800">{potreroSeleccionado?.areaM2} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tipo de Pasto:</span>
                <span className="font-semibold text-slate-800">{potreroSeleccionado?.tipoPasto || 'No especificado'}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Aforo (kg/m²):
                </span>
                <span className="font-bold text-emerald-900">{potreroSeleccionado?.aforo ?? 0} kg/m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Bovinos Actuales:</span>
                <span className="font-semibold text-slate-800">{potreroSeleccionado?.bovinosActuales || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Entrada de Ganado:</span>
                <span className="font-semibold text-slate-800">{potreroSeleccionado?.fechaEntradaGanado || 'Sin registro'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Salida de Ganado:</span>
                <span className="font-semibold text-slate-800">{potreroSeleccionado?.fechaSalidaGanado || 'Sin registro'}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Tiempo en Reposo:
                </span>
                <span className="font-bold text-slate-800">{potreroSeleccionado?.diasDescanso || 0} días</span>
              </div>
            </div>

            {/* SECCIÓN DEL HISTORIAL DE CAMBIOS CON PAGINACIÓN (3 ITEMS) */}
            <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-sky-600" /> Historial de Cambios ({historialPotrero.length})
                </span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                  {mostrarHistorial ? 'Ocultar' : 'Ver'}
                </span>
              </button>

              {mostrarHistorial && (
                <div className="p-2.5 bg-white border-t border-slate-200 space-y-2">
                  {historialPotrero.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">No hay registros de historial aún.</p>
                  ) : (
                    <>
                      {historialPaginado.map((item) => (
                        <div key={item.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1">
                          <div className="flex justify-between items-center font-semibold">
                            <span className={item.estado_nuevo === 'Ocupado' ? 'text-rose-600' : 'text-emerald-600'}>
                              {item.estado_anterior} ➔ {item.estado_nuevo}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.fecha_cambio).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-slate-600 flex justify-between">
                            <span>Bovinos: <b>{item.bovinos_actuales}</b></span>
                            <span>Entrada: {item.fecha_entrada || 'N/A'}</span>
                          </div>
                        </div>
                      ))}

                      {totalPaginasHistorial > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          <button
                            onClick={() => setPaginaHistorial((prev) => Math.max(prev - 1, 1))}
                            disabled={paginaHistorial === 1}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded flex items-center gap-1 transition font-medium"
                          >
                            <ChevronLeft className="w-3 h-3" /> Atrás
                          </button>
                          <span>Pág. {paginaHistorial} de {totalPaginasHistorial}</span>
                          <button
                            onClick={() => setPaginaHistorial((prev) => Math.min(prev + 1, totalPaginasHistorial))}
                            disabled={paginaHistorial === totalPaginasHistorial}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded flex items-center gap-1 transition font-medium"
                          >
                            Adelante <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                onClick={() => setMostrarControlesMover(!mostrarControlesMover)}
                className="w-full px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" /> Reposicionar Pin en Mapa
                </span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                  {mostrarControlesMover ? 'Ocultar' : 'Ajustar'}
                </span>
              </button>

              {mostrarControlesMover && (
                <div className="p-3 bg-white border-t border-slate-200 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 mb-1">Mover coordenadas del marcador</span>
                  <button
                    onClick={() => moverPin('arriba')}
                    className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => moverPin('izquierda')}
                      className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moverPin('derecha')}
                      className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => moverPin('abajo')}
                    className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={abrirModalEdicion}
                className="bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => eliminarPotrero(potreroSeleccionado.id)}
                className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Nuevo Potrero</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={agregarNuevoPotrero} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre:</label>
                <input
                  type="text"
                  placeholder="Ej. Potrero Norte"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Área (m²):</label>
                <input
                  type="number"
                  value={nuevoArea}
                  onChange={(e) => setNuevoArea(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Pasto:</label>
                <input
                  type="text"
                  value={nuevoPasto}
                  onChange={(e) => setNuevoPasto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Aforo (kg/m²):</label>
                <input
                  type="number"
                  step="0.1"
                  value={nuevoAforo}
                  onChange={(e) => setNuevoAforo(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setCreandoDesdeMapa(true);
                }}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 py-2 rounded-xl font-semibold transition flex items-center justify-center space-x-2"
              >
                <MousePointerClick className="w-4 h-4" />
                <span>Elegir ubicación exacta en el mapa</span>
              </button>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl font-semibold shadow-sm transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Gestionar Fechas y Datos: {editNombre}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarEdicionPotrero} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre:</label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Área (m²):</label>
                  <input
                    type="number"
                    value={editArea}
                    onChange={(e) => setEditArea(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aforo (kg/m²):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editAforo}
                    onChange={(e) => setEditAforo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Entrada:</label>
                  <input
                    type="date"
                    value={editFechaEntrada}
                    onChange={(e) => setEditFechaEntrada(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Salida:</label>
                  <input
                    type="date"
                    value={editFechaSalida}
                    onChange={(e) => setEditFechaSalida(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bovinos Actuales:</label>
                <input
                  type="number"
                  value={editBovinos}
                  onChange={(e) => setEditBovinos(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Pasto:</label>
                <input
                  type="text"
                  value={editPasto}
                  onChange={(e) => setEditPasto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl font-semibold shadow-sm transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}