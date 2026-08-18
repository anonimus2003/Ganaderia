export interface Bovino {
  id: string;
  arete: string;
  nombre?: string | null;
  raza: string;
  genero: 'Macho' | 'Hembra' | string;
  peso_inicial: number;
  fecha_nacimiento?: string | null;
  observaciones?: string | null;
  creado_por?: string | null;
  created_at: string;
  estado: string; // Etapa productiva
  
  // --- NUEVOS CAMPOS ---
  condicion: 'Activo' | 'Inactivo';
  motivo_baja?: 'Muerte' | 'Venta' | 'Otros' | null;
  observacion_baja?: string | null;
}