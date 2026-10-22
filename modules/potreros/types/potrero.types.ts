export interface Potrero {
  id: string | number;
  nombre: string;
  estado?: 'Disponible' | 'Ocupado' | string;
  area_m2?: number;
  tipo_pasto?: string;
  puntos?: Array<{ x: number; y: number }> | string;
  coordenadas?: Array<{ x: number; y: number }> | string;
}

export interface EventoBitacora {
  id: string;
  potrero_id: string | number;
  potrero_nombre?: string;
  tipo: 'ingreso' | 'salida' | 'abono' | string;
  titulo: string;
  detalle: string;
  fecha: string;
  anim_fecha_salida?: string;
  animales?: string[];
  responsable?: string;
  aforo?: number | string;
}

export interface CicloOcupacion {
  idPrincipal: string;
  potreroNombre: string;
  eventoOriginal: EventoBitacora;
  eventoSalida?: EventoBitacora;
  fechaIngreso: string;
  fechaSalida: string;
  diasOcupacion: number;
  activo: boolean;
  animales: string[];
  aforo?: number | string;
}

export interface BovinoOption {
  id: string;
  nombre: string;
}