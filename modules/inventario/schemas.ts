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
  
  // --- CAMPOS NUEVOS: PROPÓSITO Y GENEALOGÍA (RELACIÓN CON LA MISMA TABLA) ---
  proposito?: string | null;
  madre_id?: string | null; // ID del bovino madre registrado en el hato
  padre_id?: string | null; // ID del bovino padre registrado en el hato

  // --- CONDICIÓN E INACTIVIDAD ---
  condicion: 'Activo' | 'Inactivo';
  motivo_baja?: 'Muerte' | 'Venta' | 'Otros' | null;
  observacion_baja?: string | null;
}