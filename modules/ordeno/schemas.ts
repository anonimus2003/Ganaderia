// modules/leche/schemas.ts
export interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  estado: string | null;
}

export interface ProduccionLeche {
  id: string;
  bovino_id: string;
  fecha: string;
  litros: number;
  jornada: 'Mañana' | 'Tarde';
  concentrado_kg: number;
  observaciones?: string | null;
  created_at: string;
  bovinos?: {
    arete: string;
    nombre: string | null;
  } | null;
}

export interface FiltrosLeche {
  busqueda: string;
  bovinoFiltroId: string;
  fechaInicio: string;
  fechaFin: string;
}