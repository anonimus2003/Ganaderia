export interface HistorialOcupacionPotrero {
  id: number;
  potrero_id: number;
  bovino_id: string; // uuid
  fecha_entrada: string; // timestamp with time zone
  fecha_salida: string | null; // timestamp with time zone
  registrado_por: string | null; // uuid
  aforo: number | null; // numeric
  created_at: string | null; // timestamp with time zone
}


export interface HistorialAbono {
  id: string; // uuid
  potrero_id: number; // bigint
  tipo_abono: string;
  fecha_aplicacion: string; // date
  cantidad: number; // numeric
  responsable: string | null;
  creado_at: string;
  unidad_medida: string;
  observaciones: string | null;
  created_at: string | null;
  registrado_por: string | null; // uuid
}