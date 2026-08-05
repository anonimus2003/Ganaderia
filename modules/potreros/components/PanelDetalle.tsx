import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  Scale,
  Clock,
  History,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Potrero, HistorialItem } from '../schemas';

interface PanelDetalleProps {
  potrero: Potrero;
  historial: HistorialItem[];
  onEditar: () => void;
  onEliminar: (id: number) => void;
  onMoverPin: (dir: 'arriba' | 'abajo' | 'izquierda' | 'derecha') => void;
}

export default function PanelDetalle({
  potrero,
  historial,
  onEditar,
  onEliminar,
  onMoverPin,
}: PanelDetalleProps) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarControlesMover, setMostrarControlesMover] = useState(false);
  const [paginaHistorial, setPaginaHistorial] = useState(1);

  const itemsPorPagina = 3;
  const totalPaginasHistorial = Math.ceil(historial.length / itemsPorPagina);
  const indiceUltimoItem = paginaHistorial * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const historialPaginado = historial.slice(indicePrimerItem, indiceUltimoItem);

  if (!potrero) return null;

  return (
    <div className="w-[400px] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm">{potrero.nombre}</h3>
          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
            potrero.estado?.toLowerCase() === 'ocupado' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}>
            {potrero.estado}
          </span>
        </div>

        <div className="py-3 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Área Total:</span>
            <span className="font-semibold text-slate-800">{potrero.areaM2} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Tipo de Pasto:</span>
            <span className="font-semibold text-slate-800">{potrero.tipoPasto || 'No especificado'}</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
            <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Aforo (kg/m²):
            </span>
            <span className="font-bold text-emerald-900">{potrero.aforo ?? 0} kg/m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Bovinos Actuales:</span>
            <span className="font-semibold text-slate-800">{potrero.bovinosActuales || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Entrada de Ganado:</span>
            <span className="font-semibold text-slate-800">{potrero.fechaEntradaGanado || 'Sin registro'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Salida de Ganado:</span>
            <span className="font-semibold text-slate-800">{potrero.fechaSalidaGanado || 'Sin registro'}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Tiempo en Reposo:
            </span>
            <span className="font-bold text-slate-800">{potrero.diasDescanso || 0} días</span>
          </div>
        </div>

        {/* Historial */}
        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <button
            type="button"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            className="w-full px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-sky-600" /> Historial de Cambios ({historial.length})
            </span>
            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
              {mostrarHistorial ? 'Ocultar' : 'Ver'}
            </span>
          </button>

          {mostrarHistorial && (
            <div className="p-2.5 bg-white border-t border-slate-200 space-y-2">
              {historial.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-2">No hay registros de historial aún.</p>
              ) : (
                <>
                  {historialPaginado.map((item) => (
                    <div key={item.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1">
                      <div className="flex justify-between items-center font-semibold">
                        <span className={item.estado_nuevo === 'Ocupado' ? 'text-rose-600' : 'text-emerald-600'}>
                          {item.estado_anterior} ➔ {item.estado_nuevo}
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(item.fecha_cambio).toLocaleString()}</span>
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
                        type="button"
                        onClick={() => setPaginaHistorial((prev) => Math.max(prev - 1, 1))}
                        disabled={paginaHistorial === 1}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded flex items-center gap-1 transition font-medium"
                      >
                        <ChevronLeft className="w-3 h-3" /> Atrás
                      </button>
                      <span>Pág. {paginaHistorial} de {totalPaginasHistorial}</span>
                      <button
                        type="button"
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

        {/* Controles para mover pin */}
        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <button
            type="button"
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
              <button type="button" onClick={() => onMoverPin('arriba')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition">
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="flex gap-4">
                <button type="button" onClick={() => onMoverPin('izquierda')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => onMoverPin('derecha')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button type="button" onClick={() => onMoverPin('abajo')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 p-1.5 rounded-md shadow-sm text-slate-700 transition">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 mt-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEditar}
            className="bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => onEliminar(potrero.id)}
            className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}