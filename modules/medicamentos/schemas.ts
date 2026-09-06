export interface Medicamento {
  id: string;
  bovino_id: string;
  medicamento: string;
  dosis: string;
  via: string;
  fecha_aplicacion: string;
  proxima_aplicacion?: string | null;
  veterinario: string;
  motivo?: string | null;
  lote_medicamento?: string | null;
  costo?: number | null;
  observaciones?: string | null;
  registrado_por?: string | null;
  created_at: string;
  retiro_leche: number;
  retiro_carne: number;
  bovinos?: {
    id: string;
    arete: string; // <-- Cambiado de arete?: string a arete: string (obligatorio)
    nombre?: string | null;
  } | null;
}