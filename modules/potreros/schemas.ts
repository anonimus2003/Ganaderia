export interface Potrero {
  id: string | number;
  nombre?: string;
  numero?: number;
  area_m2?: number;
  tipo_pasto?: string;
  aforo?: number;
  progreso_pasto?: number;
  estado: string;
  puntos?: any;
}

export interface HistorialAbono {
  id: string | number;
  potrero_id: string | number;
  insumo: string;
  cantidad: string;
  fecha_aplicacion: string;
  responsable?: string;
}