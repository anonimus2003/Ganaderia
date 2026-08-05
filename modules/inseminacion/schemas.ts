'use client';

export interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
}

export interface Inseminacion {
  id: string;
  bovino_id: string;
  toro_pajilla: string;
  raza_toro: string | null;
  numero_servicios: number;
  tipo: string;
  fecha_inseminacion: string;
  fecha_chequeo: string | null;
  fecha_probable_parto: string | null;
  tecnico: string;
  estado: string;
  created_at?: string;
  bovinos?: Bovino;
}

export interface InseminacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  inseminacionToEdit?: Inseminacion | null;
}