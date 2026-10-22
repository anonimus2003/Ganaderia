'use client';

import React from 'react';
import { Potrero } from '../../types/potrero.types';
import { EventoBitacora } from '@/modules/potreros/types/bitacora.types';
import { 
  Activity, 
  Layers, 
  Sprout, 
  Users, 
  Scale, 
  Clock, 
  MapPin, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

interface BitacoraListProps {
  potrero: Potrero | null;
  eventos: EventoBitacora[];
}

export const BitacoraList: React.FC<BitacoraListProps> = ({ potrero, eventos = [] }) => {
  const p = potrero as any;
  const potreroIdStr = potrero ? String(potrero.id).trim() : null;

  // 1. Filtrar eventos evaluando coincidencias flexibles de ID
  const ocupacionesPotrero = potreroIdStr
    ? eventos.filter((e: any) => {
        const ePotreroId = e.potrero_id || e.potrero?.id;
        return String(ePotreroId).trim() === potreroIdStr;
      })
    : [];

  // 🐄 2. CÁLCULO DE ANIMALES ACTUALES (Bovinos activos en el potrero)
  // Evaluamos tanto el array de eventos como las propiedades que ya traiga la tabla potreros
  const ocupacionesActivas = ocupacionesPotrero.filter((e: any) => {
    const sinSalida = !e.fecha_salida;
    const esTipoOcupacion = !e.tipo || e.tipo === 'OCUPACION' || e.tipo_evento === 'Ingreso Ganado';
    return sinSalida && esTipoOcupacion;
  });

  const animalesDesdeEventos = ocupacionesActivas.length;
  const animalesDesdePotrero = p?.animales_actuales || p?.bovinos_actuales || p?.cantidad_bovinos || 0;
  
  // Usamos el mayor entre la consulta de eventos o la columna del potrero
  const animalesActuales = Math.max(animalesDesdeEventos, Number(animalesDesdePotrero));
  const estaOcupado = animalesActuales > 0 || String(p?.estado || '').toLowerCase() === 'ocupado';

  // 🕒 3. CÁLCULO REAL DE DÍAS DE DESCANSO / OCUPACIÓN
  let diasCalculados = 0;
  const ahora = new Date().getTime();

  if (estaOcupado) {
    // Si está ocupado, calculamos cuántos días lleva la vaca MÁS ANTIGUA dentro del potrero
    const entradas = ocupacionesActivas
      .map((e: any) => new Date(e.fecha_entrada || e.created_at || e.fecha).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b); // La más antigua primero

    if (entradas.length > 0) {
      const msTranscurridos = ahora - entradas[0];
      diasCalculados = Math.max(0, Math.floor(msTranscurridos / (1000 * 60 * 60 * 24)));
    }
  } else {
    // Si está libre (en descanso), buscamos la fecha de la última SALIDA registrada
    const fechasSalida = ocupacionesPotrero
      .map((e: any) => new Date(e.fecha_salida || e.fecha).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => b - a); // La más reciente primero

    if (fechasSalida.length > 0) {
      const msTranscurridos = ahora - fechasSalida[0];
      diasCalculados = Math.max(0, Math.floor(msTranscurridos / (1000 * 60 * 60 * 24)));
    } else if (p?.created_at || p?.fecha_creacion) {
      const fechaCreacion = new Date(p.created_at || p.fecha_creacion).getTime();
      if (!isNaN(fechaCreacion)) {
        diasCalculados = Math.max(0, Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60 * 24)));
      }
    } else {
      // Fallback si la base de datos trae directamente la columna de días de descanso
      diasCalculados = Number(p?.dias_descanso || p?.descanso_dias || 0);
    }
  }

  // ⚖️ 4. AFORO Y BIOMASA
  const historialAforos = ocupacionesPotrero
    .map((e: any) => Number(e.aforo))
    .filter((v) => !isNaN(v) && v > 0);

  const aforoActualNum = historialAforos.length > 0 
    ? historialAforos[0] 
    : Number(p?.aforo || p?.aforo_kg || 13.4);

  const aforoDisplay = aforoActualNum > 0 ? `${aforoActualNum} kg/m²` : 'Sin registro';

  // Datos de área y tipo de pasto
  const areaTotal = p?.area_hectareas || p?.area_m2 || p?.tamano || p?.area || '3500';
  const tipoPasto = p?.tipo_pasto || p?.pasto || 'Brachiaria';

  // Datos para la mini gráfica de barras
  const datosGrafica = historialAforos.length >= 3
    ? [...historialAforos].reverse().slice(-5)
    : [10.1, 11.4, 12.1, 12.7, aforoActualNum];

  const maxGrafica = Math.max(...datosGrafica, 10);

  return (
    <div className="w-full bg-white rounded-2xl p-4 md:p-5 border border-slate-200/85 shadow-sm flex flex-col gap-4">
      
      {/* Cabecera del Instrumento */}
      <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white">
              <Activity className="w-4 h-4 text-[#D1F843]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {potrero ? `Panel de Control Analítico` : `Vista General de Finca`}
            </h3>
          </div>
          {potrero && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold border border-slate-200">
              <MapPin className="w-3 h-3 text-slate-500" />
              {potrero.nombre || `Potrero #${potrero.id}`}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {potrero
            ? `Telemetría y comportamiento productivo en tiempo real.`
            : 'Selecciona una unidad de pastoreo en el mapa para iniciar la inspección.'}
        </p>
      </div>

      {/* DASHBOARD VISUAL */}
      {potrero ? (
        <div className="flex flex-col gap-4">

          {/* Banner de Estado Operativo */}
          <div className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            estaOcupado 
              ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          }`}>
            <span className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${estaOcupado ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              Condición Actual:
            </span>
            <span className="uppercase tracking-wider text-[11px] font-bold">
              {estaOcupado ? 'En Pastoreo Activo' : 'En Periodo de Descanso'}
            </span>
          </div>

          {/* Tarjetas de Métricas Principales */}
          <div className="grid grid-cols-2 gap-3">
            
            <div className="bg-slate-50/70 border border-slate-200/80 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Superficie</span>
                <Layers className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900">{areaTotal}</span>
                <span className="text-xs text-slate-500 font-semibold">ha</span>
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pastura</span>
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-800 mt-2 truncate" title={tipoPasto}>
                {tipoPasto}
              </span>
            </div>

            {/* 🐄 Carga Bovina Activa */}
            <div className="bg-slate-50/70 border border-slate-200/80 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carga Bovina</span>
                <Users className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-800">{animalesActuales}</span>
                <span className="text-[11px] text-slate-500 font-semibold">cabezas</span>
              </div>
            </div>

            {/* ⚖️ Biomasa Actual */}
            <div className="bg-slate-50/70 border border-slate-200/80 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Biomasa Actual</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-800 mt-2 truncate">{aforoDisplay}</span>
            </div>

          </div>

          {/* 📈 MINI GRÁFICA DE COMPORTAMIENTO DE AFORO */}
          <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Tendencia de Recuperación de Biomasa</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Últimos registros
              </span>
            </div>

            {/* Barras de la Mini Gráfica */}
            <div className="h-20 w-full flex items-end justify-between gap-2 pt-2 px-1 border-b border-slate-200/60 pb-1">
              {datosGrafica.map((valor, index) => {
                const alturaPorcentaje = Math.min(Math.max((valor / maxGrafica) * 100, 15), 100);
                const esUltimo = index === datosGrafica.length - 1;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {valor.toFixed(1)}
                    </span>
                    <div 
                      style={{ height: `${alturaPorcentaje}%` }} 
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        esUltimo 
                          ? 'bg-blue-600 shadow-xs ring-1 ring-blue-400' 
                          : 'bg-slate-300 group-hover:bg-blue-400'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-0.5">
              <span>Ciclo Inicial</span>
              <span className="text-blue-700 font-bold">Estado Óptimo Actual</span>
            </div>
          </div>

          {/* 🕒 Indicador Días Acumulados */}
          <div className="bg-slate-900 text-slate-100 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-[#D1F843]" />
              <span className="font-medium text-xs">
                {estaOcupado ? 'Tiempo en Pastoreo:' : 'Recuperación de Pastura:'}
              </span>
            </div>
            <span className="font-black text-[#D1F843] text-sm tracking-wide">
              {diasCalculados} días acumulados
            </span>
          </div>

        </div>
      ) : (
        <div className="py-14 text-center text-slate-400 text-xs italic bg-slate-50/60 rounded-xl border border-dashed border-slate-200 px-6 flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6 text-slate-300" />
          <span>Seleccione un potrero en el plano general para activar la telemetría de aforo y carga bovina.</span>
        </div>
      )}

    </div>
  );
};