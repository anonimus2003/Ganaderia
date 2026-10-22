// modules/potreros/types/bitacora.types.ts

export interface EventoBitacora {
  id: string | number;
  potrero_id: string | number;
  tipo: 'OCUPACION' | 'ABONO' | 'AFORO' | 'MANTENIMIENTO' | string;
  fecha: string;
  
  // Propiedades opcionales que vienen de la base de datos
  descripcion?: string;
  observaciones?: string;
  notas?: string;
  cantidad_bovinos?: number;
  bovinos?: number;
  producto?: string;
  tipo_abono?: string;
  estado_registro?: string;
  [key: string]: any; // Permite cualquier otra propiedad adicional
}