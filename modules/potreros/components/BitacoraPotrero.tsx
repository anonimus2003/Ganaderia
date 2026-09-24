'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface EventoBitacora {
  id: string;
  potrero_id: string | number;
  potrero_nombre?: string;
  tipo: 'ingreso' | 'salida' | 'abono';
  titulo: string;
  detalle: string;
  fecha: string; 
  anim_fecha_salida?: string;
  animales?: string[];
  responsable?: string;
}

interface BitacoraPotreroProps {
  eventos: EventoBitacora[];
  potreroActivoNombre?: string;
  pastoPotrero?: string;          
  areaPotrero?: string | number; 
  aforoEst?: string | number;
  progresoPasto?: string | number;
  onEditarSeleccionado?: (evento: EventoBitacora) => void;
  onEliminarEvento: (eventoId: string) => void;
}

const parsearFecha = (fechaStr: string): Date | null => {
  if (!fechaStr) return null;
  try {
    const soloFecha = fechaStr.split(',')[0].trim();
    if (soloFecha.includes('/')) {
      const partes = soloFecha.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const anio = parseInt(partes[2], 10);
        const d = new Date(anio, mes, dia, 12, 0, 0); // Hora mediodía para evitar desfases de zona horaria
        if (!isNaN(d.getTime())) return d;
      }
    }
    const fechaLimpia = soloFecha.includes('T') ? soloFecha.split('T')[0] : soloFecha;
    const [year, month, day] = fechaLimpia.split('-').map(num => parseInt(num, 10));
    if (year && month && day) {
      return new Date(year, month - 1, day, 12, 0, 0);
    }
    const dIso = new Date(fechaLimpia);
    return !isNaN(dIso.getTime()) ? dIso : null;
  } catch {
    return null;
  }
};

const calcularDiasDiferencia = (fechaInicioStr: string, fechaFinStr: string) => {
  const inicio = parsearFecha(fechaInicioStr);
  const fin = parsearFecha(fechaFinStr);
  if (!inicio || !fin) return null;
  const diferenciaMs = fin.getTime() - inicio.getTime();
  const dias = Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
  return dias >= 0 ? dias : 0;
};

const ELEMENTOS_POR_PAGINA = 3;

interface CicloOcupacion {
  idPrincipal: string;
  eventoOriginal: EventoBitacora;
  eventoSalida?: EventoBitacora;
  fechaIngreso: string;
  fechaSalida: string;
  diasOcupacion: number;
  activo: boolean;
  animales: string[];
}

type ElementoHistorial = 
  | { tipoElemento: 'ciclo'; fechaOrden: Date | null; data: CicloOcupacion }
  | { tipoElemento: 'abono'; fechaOrden: Date | null; data: EventoBitacora };

export function BitacoraPotrero({ 
  eventos, 
  potreroActivoNombre, 
  pastoPotrero,
  areaPotrero,
  aforoEst,
  progresoPasto,
  onEliminarEvento 
}: BitacoraPotreroProps) {
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbiertoId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Procesamiento de ciclos de pastoreo (Ingresos / Salidas)
  const ciclosUnificados = useMemo(() => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const ordenados = [...eventos].sort((a, b) => {
      return (parsearFecha(b.fecha)?.getTime() || 0) - (parsearFecha(a.fecha)?.getTime() || 0);
    });

    const ciclos: CicloOcupacion[] = [];
    const ingresosSalidas = ordenados.filter(e => e.tipo !== 'abono');

    const porPotrero = new Map<string | number, EventoBitacora[]>();
    ingresosSalidas.forEach(ev => {
      const lista = porPotrero.get(ev.potrero_id) || [];
      lista.push(ev);
      porPotrero.set(ev.potrero_id, lista);
    });

    porPotrero.forEach((listaPotrero) => {
      const listaAgrupada: EventoBitacora[] = [];

      listaPotrero.forEach((ev) => {
        if (ev.tipo === 'ingreso') {
          const fechaClave = parsearFecha(ev.fecha)?.toISOString().split('T')[0] || ev.fecha;

          const existente = listaAgrupada.find(
            item => item.tipo === 'ingreso' && 
                    (parsearFecha(item.fecha)?.toISOString().split('T')[0] || item.fecha) === fechaClave
          );

          if (existente) {
            const animalesActuales = existente.animales || [];
            const animalesNuevos = ev.animales || [];
            existente.animales = Array.from(new Set([...animalesActuales, ...animalesNuevos]));
          } else {
            listaAgrupada.push({
              ...ev,
              animales: [...(ev.animales || [])]
            });
          }
        } else {
          listaAgrupada.push(ev);
        }
      });

      const sortedByDate = [...listaAgrupada].sort((a, b) => {
        return (parsearFecha(a.fecha)?.getTime() || 0) - (parsearFecha(b.fecha)?.getTime() || 0);
      });

      const salidasUsadas = new Set<string>();

      for (let i = 0; i < sortedByDate.length; i++) {
        const ev = sortedByDate[i];
        if (ev.tipo === 'ingreso') {
          const proximaSalida = sortedByDate
            .slice(i + 1)
            .find(e => e.tipo === 'salida' && !salidasUsadas.has(e.id));

          if (proximaSalida) {
            salidasUsadas.add(proximaSalida.id);
          }

          const fechaFin = proximaSalida ? proximaSalida.fecha : hoyStr;
          const dias = calcularDiasDiferencia(ev.fecha, fechaFin) ?? 0;

          ciclos.push({
            idPrincipal: ev.id,
            eventoOriginal: ev,
            eventoSalida: proximaSalida,
            fechaIngreso: ev.fecha,
            fechaSalida: proximaSalida ? proximaSalida.fecha : 'Actualidad',
            diasOcupacion: dias,
            activo: !proximaSalida,
            animales: ev.animales || []
          });
        }
      }
    });

    return ciclos.sort((a, b) => {
      return (parsearFecha(b.fechaIngreso)?.getTime() || 0) - (parsearFecha(a.fechaIngreso)?.getTime() || 0);
    });
  }, [eventos]);

  const eventosAbono = useMemo(() => {
    return eventos.filter(e => e.tipo === 'abono');
  }, [eventos]);

  const historialCombinado = useMemo<ElementoHistorial[]>(() => {
    const listaCiclos: ElementoHistorial[] = ciclosUnificados.map(c => ({
      tipoElemento: 'ciclo',
      fechaOrden: parsearFecha(c.fechaIngreso),
      data: c
    }));

    const listaAbonos: ElementoHistorial[] = eventosAbono.map(a => ({
      tipoElemento: 'abono',
      fechaOrden: parsearFecha(a.fecha),
      data: a
    }));

    return [...listaCiclos, ...listaAbonos].sort((a, b) => {
      return (b.fechaOrden?.getTime() || 0) - (a.fechaOrden?.getTime() || 0);
    });
  }, [ciclosUnificados, eventosAbono]);

  const totalPaginas = Math.ceil(historialCombinado.length / ELEMENTOS_POR_PAGINA) || 1;

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [totalPaginas, paginaActual]);

  const elementosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ELEMENTOS_POR_PAGINA;
    return historialCombinado.slice(inicio, inicio + ELEMENTOS_POR_PAGINA);
  }, [historialCombinado, paginaActual]);

  const { tipoContadorActual, diasContador, animalesActuales, fechaUltimoRegistro, etiquetaContador } = useMemo(() => {
    const hoyStr = new Date().toISOString().split('T')[0];
    
    if (ciclosUnificados.length === 0) {
      return {
        tipoContadorActual: 'disponible' as const,
        diasContador: 0,
        animalesActuales: [],
        fechaUltimoRegistro: 'Sin Registro',
        etiquetaContador: 'Tiempo de Ocupación'
      };
    }

    const cicloReciente = ciclosUnificados[0];

    if (cicloReciente.activo) {
      return {
        tipoContadorActual: 'ocupado' as const,
        diasContador: cicloReciente.diasOcupacion,
        animalesActuales: cicloReciente.animales,
        fechaUltimoRegistro: cicloReciente.fechaIngreso,
        etiquetaContador: 'Tiempo de Ocupación'
      };
    } else {
      const diasDescanso = calcularDiasDiferencia(cicloReciente.fechaSalida, hoyStr) ?? 0;

      return {
        tipoContadorActual: 'disponible' as const,
        diasContador: diasDescanso,
        animalesActuales: [],
        fechaUltimoRegistro: cicloReciente.fechaSalida,
        etiquetaContador: 'Días en Descanso'
      };
    }
  }, [ciclosUnificados]);

  const totalCabezas = animalesActuales.length;
  const nombrePotreroDisplay = potreroActivoNombre || 'Potrero';

  return (
    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-slate-50/90 border-b border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide uppercase rounded-full ${
            tipoContadorActual === 'ocupado' 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {`${nombrePotreroDisplay} - ${tipoContadorActual === 'ocupado' ? 'Ocupado' : 'Disponible'}`}
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Área Total: <span className="text-slate-800 font-semibold">{areaPotrero !== undefined ? `${areaPotrero} m²` : '0 m²'}</span> | Pastura: <span className="text-slate-800 font-semibold">{pastoPotrero !== undefined ? pastoPotrero : 'N/A'}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700">Carga Animal Actual</div>
            <span className="text-sm font-extrabold text-slate-900">{totalCabezas} {totalCabezas === 1 ? 'Cabeza' : 'Cabezas'}</span>
          </div>

          {tipoContadorActual === 'ocupado' && animalesActuales.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Animales Presentes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {animalesActuales.map((animal, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white border border-slate-200 text-slate-700 font-medium text-[11px] px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    🐮 {animal}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-500">
            <span>Aforo Estimado: <strong className="text-slate-800">{aforoEst !== undefined ? `${aforoEst} kg/m²` : '0 kg/m²'}</strong></span>
            <span>Recuperación Pasto: <strong className="text-slate-800">{progresoPasto !== undefined ? `${progresoPasto}%` : '0%'}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500">{etiquetaContador}</div>
            <div className="mt-2">
              <span className={`text-lg font-extrabold ${
                tipoContadorActual === 'ocupado' ? 'text-red-700' : 'text-emerald-700'
              }`}>
                {diasContador}
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">{diasContador === 1 ? 'Día' : 'Días'}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500">Último Movimiento</div>
            <div className="mt-2 text-xs font-bold text-slate-900 truncate">{fechaUltimoRegistro}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Historial y Eventos</span>
          <span className="text-[11px] text-slate-400 font-medium">{historialCombinado.length} registros</span>
        </div>
        
        {historialCombinado.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No hay registros en la bitácora para este potrero.</p>
        ) : (
          <>
            {elementosPaginados.map((item) => {
              if (item.tipoElemento === 'abono') {
                const abono = item.data;
                const menuId = `abono-${abono.id}`;

                return (
                  <div key={abono.id} className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 text-xs space-y-2.5 relative shadow-2xs transition-all hover:bg-emerald-50/80">
                    <div className="flex justify-between items-center border-b border-emerald-200/50 pb-2">
                      <span className="font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300/80 px-2.5 py-1 rounded-md text-[10px] inline-flex items-center gap-1">
                        🌱 Abono / Fertilizante
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600 bg-white border border-emerald-200 px-2 py-1 rounded-md">
                          📅 Fecha: {abono.fecha}
                        </span>

                        <div className="relative" ref={menuAbiertoId === menuId ? menuRef : null}>
                          <button
                            type="button"
                            onClick={() => setMenuAbiertoId(menuAbiertoId === menuId ? null : menuId)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>

                          {menuAbiertoId === menuId && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                              <button
                                type="button"
                                onClick={() => { 
                                  setMenuAbiertoId(null); 
                                  onEliminarEvento(abono.id); 
                                }}
                                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-extrabold text-slate-900 text-sm">{abono.titulo}</p>
                      
                      {abono.responsable && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <span className="text-slate-400">👤 Responsable:</span>
                          <span className="font-semibold text-slate-800">{abono.responsable}</span>
                        </div>
                      )}

                      {abono.detalle && (
                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-200/60 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Detalles / Observaciones:
                          </span>
                          <p className="text-slate-700 text-xs font-normal leading-relaxed whitespace-pre-wrap">
                            {abono.detalle}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              const ciclo = item.data;
              const cantidadAnimales = ciclo.animales.length;

              return (
                <div key={ciclo.idPrincipal} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs space-y-2.5 relative shadow-2xs transition-all hover:bg-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 bg-slate-200/80 border border-slate-300/80 px-2 py-0.5 rounded-md text-[10px]">
                       {ciclo.eventoOriginal.potrero_nombre ? `Potrero: ${ciclo.eventoOriginal.potrero_nombre}` : `Potrero #${ciclo.eventoOriginal.potrero_id}`}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full tracking-wider ${
                        ciclo.activo ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-slate-200 text-slate-700 border border-slate-300'
                      }`}>
                        {ciclo.activo ? 'Ocupado' : 'Finalizado'}
                      </span>

                      <div className="relative" ref={menuAbiertoId === ciclo.idPrincipal ? menuRef : null}>
                        <button
                          type="button"
                          onClick={() => setMenuAbiertoId(menuAbiertoId === ciclo.idPrincipal ? null : ciclo.idPrincipal)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>

                        {menuAbiertoId === ciclo.idPrincipal && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                            <button
                              type="button"
                              onClick={() => { 
                                setMenuAbiertoId(null); 
                                onEliminarEvento(ciclo.eventoOriginal.id); 

                                if (ciclo.eventoSalida) {
                                  onEliminarEvento(ciclo.eventoSalida.id);
                                }
                              }}
                              className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-800 text-sm">{ciclo.eventoOriginal.titulo}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {cantidadAnimales > 0 && (
                      <span className="bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                        <strong>{cantidadAnimales}</strong> {cantidadAnimales === 1 ? 'cabeza en lote' : 'cabezas en lote'}
                      </span>
                    )}
                    <span className="bg-red-50 border border-red-200 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                      Duración Ocupación: <strong>{ciclo.diasOcupacion} {ciclo.diasOcupacion === 1 ? 'día' : 'días'}</strong>
                    </span>
                  </div>

                  {ciclo.animales.length > 0 && (
                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Lista de Animales ({ciclo.animales.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ciclo.animales.map((animal, aIdx) => (
                          <span 
                            key={aIdx} 
                            className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200/60"
                          >
                            {animal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-slate-200/60 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] bg-slate-100/70 border border-slate-200/60 px-2.5 py-1.5 rounded-lg text-slate-700 font-medium">
                      <span className="text-slate-500">Período de Ciclo:</span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span className="text-emerald-700">{ciclo.fechaIngreso}</span>
                        <span className="text-slate-400 font-normal">➔</span>
                        <span className={ciclo.fechaSalida === 'Actualidad' ? 'text-amber-700' : 'text-slate-700'}>
                          {ciclo.fechaSalida}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  ← Atrás
                </button>
                <span className="text-[11px] font-medium text-slate-500">
                  Página <strong className="text-slate-800">{paginaActual}</strong> de <strong className="text-slate-800">{totalPaginas}</strong>
                </span>
                <button
                  type="button"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}