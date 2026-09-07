// modules/ordeno/schemas.ts
export interface Bovino {
  id: string; // <--- Cambiado de "string | null" a "string" obligatorio
  arete: string;
  nombre?: string | null;
  genero?: string;
}

export interface Ordeño {
  id: string;
  bovino_id: string | null; // <--- Cambiado a "string | null" para evitar el error con Partial
  fecha: string;
  litros: number;
  jornada: "Mañana" | "Tarde";
  observaciones: string | null;
  registrado_por: string | null;
  created_at?: string;
  concentrado_kg: number | null;
  bovinos?: {
    id: string;
    arete?: string;
    nombre?: string | null;
  } | null;
}

export interface FiltrosOrdeno {
  busqueda?: string;
  jornada?: string;
  fechaInicio?: string;
  fechaFin?: string;
  bovino?: string;
}