// modules/pesaje/schemas.ts
import { Bovino } from "@/modules/ordeno/schemas"; // O la ruta correcta donde tengas la interfaz Bovino

export interface Pesaje {
  id: string;
  fecha: string;
  peso_kgs: number;
  condicion_corporal: number | null;
  estado_fisiologico: string | null;
  metodo_pesaje?: string | null;
  ganancia_diaria_kg?: number | null;
  responsable?: string | null;
  observaciones: string | null;
  bovino_id: string | null;
  
  // Agrega esta línea para que TypeScript reconozca el objeto que viene del JOIN
  bovinos?: Bovino | null; 
}