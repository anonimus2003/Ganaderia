export type ViaAplicacion = 'Intramuscular' | 'Subcutánea' | 'Oral' | 'Tópica' | 'Intrauterina' | 'Local' | 'Intravenosa' | 'Rectal' | 'Intramamaria' | 'Intraruminal' | 'Intraperitonial' | 'Ocular' | 'Intradermica';

export interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  estado: string | null;
}

export interface Tratamiento {
  id: string;
  bovino_id: string;
  medicamento: string;
  dosis: string;
  via: ViaAplicacion;
  fecha_aplicacion: string;
  tiempo_retiro: number;
  veterinario: string;
  motivo: string | null;
  created_at?: string;
  bovino?: Bovino;
}

export interface TratamientoFormData {
  bovino_id: string;
  medicamento: string;
  dosis: string;
  via: ViaAplicacion;
  fecha_aplicacion: string;
  tiempo_retiro: number;
  veterinario: string;
  motivo: string;
}