import { z } from "zod";
import { string } from "zod/v4";

export const inseminacionSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string({ required_error: "Debe seleccionar un bovino" }).uuid("Seleccione un bovino válido"),
  toro_pajilla: z.string().min(1, "El toro o número de pajilla es obligatorio"),
  raza_toro: z.string().optional().nullable(),
  numero_servicios: z.coerce.number().int().positive().default(1),
  tipo: z.string().optional().nullable(),
  fecha_inseminacion: z.string().min(1, "La fecha es obligatoria"),
  fecha_chequeo: z.string().optional().nullable(),
  fecha_probable_parto: z.string().optional().nullable(),
  fecha_parto: z.string().optional().nullable(),
  tecnico: z.string().min(1, "El técnico es obligatorio"),
  estado: z.string().optional().nullable(),
  bovinos: z.object({
    arete: z.string().optional(),
    nombre: z.string().optional(),
  }).optional(),
});

export type Inseminacion = z.infer<typeof inseminacionSchema>;