import { z } from "zod";

export const produccionLecheSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string().uuid("Debes seleccionar un bovino"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  litros: z.coerce.number().positive("Los litros deben ser mayores a 0"),
  jornada: z.enum(["Mañana", "Tarde"], { message: "Selecciona una jornada válida" }),
  concentrado_kg: z.coerce.number().min(0).optional(),
  observaciones: z.string().optional().nullable(),
  registrado_por: z.string().optional().nullable(), // <--- Agregado aquí
  // Opcional para mostrar el arete/nombre del bovino mediante un JOIN en la consulta
  bovinos: z.object({
    arete: z.string(),
    nombre: z.string().nullable().optional(),
  }).optional(),
});

export type ProduccionLeche = z.infer<typeof produccionLecheSchema>;