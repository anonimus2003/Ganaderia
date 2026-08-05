export interface Pesaje {
  id: string;
  created_at?: string;
  fecha: string;
  bovino_id: string;
  peso_kgs: number;
  condicion_corporal?: number;
  estado_fisiologico?: string;
  observaciones?: string;
}

export interface Bovino {
  id: string;
  arete: string;
  nombre?: string;
  categoria?: string;
}