export interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  genero: 'Macho' | 'Hembra';
  peso_inicial: number;
  estado: string | null;
}

export interface ProduccionLeche {
  id: string;
  bovino_id: string;
  fecha: string;
  litros: number;
  jornada: 'Mañana' | 'Tarde';
  observaciones?: string | null;
  concentrado_kg?: number;
}

export interface Tratamiento {
  id: string;
  bovino_id: string;
  medicamento: string;
  dosis: string;
  fecha_aplicacion: string;
  motivo?: string | null;
}

export interface RegistroActividad {
  id: string;
  created_at: string;
  usuario_nombre: string;
  modulo: string;
  detalle: string;
}