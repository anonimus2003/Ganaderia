// modules/inventario/schemas.ts
export interface Bovino {
  id: string;
  arete: string;
  nombre?: string | null;
  raza: string;
  genero: "Hembra" | "Macho";
  fecha_nacimiento?: string | null;
  observaciones?: string | null;
  registrado_por?: string | null;
  created_at?: string;
  categoria?: 
    | "Ternera en lactancia"
    | "Destete"
    | "Ternera en crecimiento"
    | "Levante"
    | "Novilla en desarrollo"
    | "Novilla de vientre"
    | "Toro"
    | "Vaca"
    | null;
  condicion: "Activo" | "Inactivo";
  motivo_baja?: "Muerte" | "Venta" | "Otros" | null;
  observacion_baja?: string | null;
  proposito?: string | null;
  madre_id?: string | null;
  padre_id?: string | null;
  fecha_baja?: string | null;
  origen?: string | null;
  estados_productivos?: "En Producción" | "Seca" | "Sin Estado" | null;
  fecha_ultimo_parto?: string | null; // 👈 Agrégala aquí
}