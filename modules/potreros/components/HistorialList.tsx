import React, { useState } from 'react';

interface HistorialRotacion {
  id: number;
  potrero_id?: number;
  potrero_nombre?: string;
  estado_anterior?: string;
  estado_nuevo: string;
  bovinos_actuales: number;
  nombres_bovinos?: string;
  fecha_entrada?: string;
  fecha_salida?: string | null;
}

interface HistorialAbono {
  id: string;
  insumo: string;
  cantidad: string;
  fecha_aplicacion: string;
  responsable?: string;
}

interface HistorialListProps {
  rotaciones: HistorialRotacion[];
  abonos: HistorialAbono[];
}

export default function HistorialList({ rotaciones, abonos }: HistorialListProps) {
  const [tab, setTab] = useState<'rotacion' | 'abonos'>('rotacion');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4 w-full">
      {/* Cabecera de pestañas */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3">
        <button
          onClick={() => setTab('rotacion')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            tab === 'rotacion'
              ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Historial de Ganado  ({rotaciones.length})
        </button>
        <button
          onClick={() => setTab('abonos')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${
            tab === 'abonos'
              ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Historial de Abonos ({abonos.length})
        </button>
      </div>

      {/* Contenido de la tabla */}
      <div className="p-4 overflow-x-auto max-h-[350px] overflow-y-auto">
        {tab === 'rotacion' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50/50">
                <th className="p-3">Potrero</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Bovinos</th>
                <th className="p-3">Fecha Entrada</th>
                <th className="p-3">Fecha Salida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rotaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                    No hay registros de rotación todavía.
                  </td>
                </tr>
              ) : (
                rotaciones.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 align-top font-semibold text-slate-800 text-xs">
                      {item.potrero_nombre || `Potrero #${item.potrero_id || 'N/A'}`}
                    </td>
                    <td className="p-3 align-top">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.estado_nuevo === 'Ocupado' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.estado_nuevo}
                      </span>
                    </td>
                    <td className="p-3 align-top">
                      <div className="font-semibold text-slate-800 text-xs mb-1">
                        {item.bovinos_actuales || 0} bovinos
                      </div>
                      {item.nombres_bovinos ? (
                        <div className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 inline-block">
                           {item.nombres_bovinos}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin detalle de nombres</span>
                      )}
                    </td>
                    <td className="p-3 align-top text-slate-600 text-xs">{item.fecha_entrada || 'N/A'}</td>
                    <td className="p-3 align-top text-slate-600 text-xs">{item.fecha_salida || 'En curso / Activo'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50/50">
                <th className="p-3">Insumo</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Fecha de Aplicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {abonos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400 text-xs">
                    No hay abonos registrados para este potrero.
                  </td>
                </tr>
              ) : (
                abonos.map((abono) => (
                  <tr key={abono.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-medium text-slate-800 text-xs">{abono.insumo}</td>
                    <td className="p-3 text-slate-600 text-xs">{abono.cantidad}</td>
                    <td className="p-3 text-slate-600 text-xs">{abono.fecha_aplicacion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}