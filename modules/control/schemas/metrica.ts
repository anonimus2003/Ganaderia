export interface Metrica {
  titulo: string;
  valor: string;
  unidad?: string;
  porcentaje: string;
  descripcion: string;
  color: string;
  tipo: "leche" | "promedio" | "lactancia" | "estado";
}