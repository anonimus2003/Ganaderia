// modules/reproduccion/schemas.ts

export interface Reproduccion {
  id?: string;
  bovino_id: string;
  toro_pajilla: string;
  raza_toro?: string | null;
  numero_servicios?: number;
  tipo?: string | null;
  fecha_inseminacion: string;
  fecha_chequeo?: string | null;
  fecha_probable_parto?: string | null;
  tecnico: string;
  estado?: string | null;
  fecha_parto?: string | null;
  fecha_secado?: string | null;
  observaciones?: string | null;
  registrado_por?: string | null;
  created_at?: string;
  bovinos?: {
    id: string;
    arete: string;
    nombre?: string | null;
  };
}

export interface FiltrosReproduccion {
  bovino?: string;
  estado?: string;
  tipo?: string;
  fechaInicio?: string;
  fechaFin?: string;
}