export interface Potrero {
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

export interface HistorialItem {
  id: number;
  potrero_id?: number;
  potrero_nombre?: string;
  estado_anterior: string;
  estado_nuevo: string;
  bovinos_actuales: number;
  fecha_entrada: string | null;
  fecha_salida: string | null;
  fecha_cambio: string;
}