export type EstadoPotrero = 'Disponible' | 'Ocupado' | 'En Descanso';

export interface Potrero {
  id: number;
  nombre: string;
  estado: string;
  crecimiento: number | null;
  tipo_pasto: string | null;
  ultimo_abono: string | null;
  fecha_abono: string | null;
  dias_descanso: number | null;
  bovinos_actuales: number | null;
  mensaje_crecimiento: string | null;
  created_at: string;
  area_m2: number | null;
  fecha_salida_ganado: string | null;
  fecha_entrada_ganado: string | null;
  x: number | null;
  y: number | null;
  aforo: number;
  progreso_pasto?: number;
}

// Interfaz que coincide con tu tabla 'historial_potreros'
export interface HistorialItem {
  id: number; // bigint
  potrero_id?: number | null; // bigint
  potrero_nombre?: string | null;
  estado_anterior?: string | null;
  estado_nuevo?: string | null;
  bovinos_actuales?: number | null;
  fecha_entrada?: string | null; // date
  fecha_salida?: string | null; // date
  fecha_cambio?: string | null; // timestamp
  bovinos_ids?: string[] | null; // uuid[]
  nombres_bovinos?: string | null;
}