'use client';

import React, { useState, useMemo } from 'react';
import { EventoBitacora } from '@/modules/potreros/types/potrero.types';
import { unificarCiclosBitacora } from '@/modules/potreros/services/calculos-potrero';

interface BitacoraPotrerosProps {
  eventos: EventoBitacora[];
  loading?: boolean;
}

export const BitacoraPotreros: React.FC<BitacoraPotrerosProps> = ({
  eventos,
  loading = false,
}) => {
  const [vista, setVista] = useState<'ciclos' | 'otros'>('ciclos');
  const [filtroNombre, setFiltroNombre] = useState('');

  // Procesa y unifica eventos usando el servicio de cálculos
  const { ciclosUnificados, eventosOtros } = useMemo(
    () => unificarCiclosBitacora(eventos),
    [eventos]
  );

  // Filtrado por nombre de potrero
  const ciclosFiltrados = useMemo(() => {
    if (!filtroNombre.trim()) return ciclosUnificados;
    return ciclosUnificados.filter((c) =>
      c.potreroNombre.toLowerCase().includes(filtroNombre.toLowerCase())
    );
  }, [ciclosUnificados, filtroNombre]);

  const otrosFiltrados = useMemo(() => {
    if (!filtroNombre.trim()) return eventosOtros;
    return eventosOtros.filter((e) =>
      (e.potrero_nombre || '').toLowerCase().includes(filtroNombre.toLowerCase())
    );
  }, [eventosOtros, filtroNombre]);

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Cabecera y Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            📋 Bitácora & Historial de Ocupación
          </h3>
          <p className="text-xs text-slate-500">
            Seguimiento de pastoreo, rotación y fertilizaciones
          </p>
        </div>

        {/* Filtro y Selector de Vista */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Filtrar por potrero..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 bg-white text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />

          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold border border-slate-200/60">
            <button
              onClick={() => setVista('ciclos')}
              className={`px-3 py-1 rounded-md transition-all ${
                vista === 'ciclos'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🔄 Ciclos Pastoreo ({ciclosUnificados.length})
            </button>
            <button
              onClick={() => setVista('otros')}
              className={`px-3 py-1 rounded-md transition-all ${
                vista === 'otros'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🌱 Abonos / Registro ({eventosOtros.length})
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de la Tabla */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Cargando registros de la bitácora...
        </div>
      ) : vista === 'ciclos' ? (
        /* VISTA: CICLOS DE OCUPACIÓN */
        <div className="overflow-x-auto">
          {ciclosFiltrados.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No hay ciclos de ocupación registrados.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Potrero</th>
                  <th className="py-2.5 px-3">Estado Ciclo</th>
                  <th className="py-2.5 px-3">Fecha Ingreso</th>
                  <th className="py-2.5 px-3">Fecha Salida</th>
                  <th className="py-2.5 px-3 text-center">Días Ocupación</th>
                  <th className="py-2.5 px-3">Aforo Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ciclosFiltrados.map((ciclo) => (
                  <tr
                    key={ciclo.idPrincipal}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {ciclo.potreroNombre}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ciclo.activo
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ciclo.activo ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                        ></span>
                        {ciclo.activo ? 'En Curso' : 'Finalizado'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {new Date(ciclo.fechaIngreso).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {ciclo.activo
                        ? '—'
                        : new Date(ciclo.fechaSalida).toLocaleString('es-CO', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {ciclo.diasOcupacion} {ciclo.diasOcupacion === 1 ? 'día' : 'días'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {ciclo.aforo ? `${ciclo.aforo} kg/m²` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* VISTA: OTROS EVENTOS (ABONOS / TRATAMIENTOS) */
        <div className="overflow-x-auto">
          {otrosFiltrados.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No hay eventos de abono u otros mantenimientos registrados.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Potrero</th>
                  <th className="py-2.5 px-3">Tipo Evento</th>
                  <th className="py-2.5 px-3">Detalle</th>
                  <th className="py-2.5 px-3">Responsable</th>
                  <th className="py-2.5 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {otrosFiltrados.map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {ev.potrero_nombre || `Potrero #${ev.potrero_id}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                        {ev.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {ev.detalle || ev.titulo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {ev.responsable || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(ev.fecha).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};