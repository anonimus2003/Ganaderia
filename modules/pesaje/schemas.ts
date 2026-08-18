import { z } from "zod";

export const bovinoSchema = z.object({
  id: z.string().uuid().optional(),
  arete: z.string(),
  nombre: z.string().optional().nullable(),
});

export type Bovino = z.infer<typeof bovinoSchema>;

// Esquema de pesaje actualizado con user_id y la relación de bovinos
export const pesajeSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string({ required_error: "Debe seleccionar un bovino" }).uuid("Seleccione un bovino válido"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  peso_kgs: z.coerce.number().positive("El peso debe ser mayor a 0"),
  condicion_corporal: z.coerce.number().min(1, "Mínimo 1").max(5, "Máximo 5").optional().nullable(),
  estado_fisiologico: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  user_id: z.string().optional().nullable(), // <--- Añadido para que coincida con tu base de datos
  // Opcional para la relación (JOIN) con la tabla bovinos
  bovinos: z.object({
    arete: z.string(),
    nombre: z.string().nullable().optional(),
  }).optional(),
});

export type Pesaje = z.infer<typeof pesajeSchema>;