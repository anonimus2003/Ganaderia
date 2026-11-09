import { z } from "zod";

export const resumenRentabilidadSchema = z.object({
  totalIngresos: z.number().default(0),
  totalEgresos: z.number().default(0),
  balanceNeto: z.number().default(0),
  margenRentabilidad: z.number().default(0), // Porcentaje
});

export type ResumenRentabilidad = z.infer<typeof resumenRentabilidadSchema>;

export interface GastoPorCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
}

export interface FiltrosRentabilidad {
  fechaInicio?: string;
  fechaFin?: string;
}