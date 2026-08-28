import { z } from "zod";

export const viasEnum = [
  'Intramuscular',
  'Subcutánea',
  'Oral',
  'Tópica',
  'Intrauterina',
  'Local',
  'Intravenosa',
  'Rectal',
  'Intramamaria',
  'Intraruminal',
  'Intraperitonial',
  'Ocular',
  'Intradermica'
] as const;

export const tratamientoSchema = z.object({
  id: z.string().uuid().optional(),
  bovino_id: z.string().uuid("Seleccione un bovino válido"),
  medicamento: z.string().min(1, "El medicamento es obligatorio"),
  dosis: z.string().min(1, "La dosis es obligatoria"),
  via: z.enum(viasEnum, { errorMap: () => ({ message: "Seleccione una vía válida" }) }),
  fecha_aplicacion: z.string().min(1, "La fecha es obligatoria"),
  retiro_leche: z.coerce.number().min(0).default(0),
  retiro_carne: z.coerce.number().min(0).default(0),
  veterinario: z.string().min(1, "El veterinario o responsable es obligatorio"),
  motivo: z.string().optional().nullable(),
});

export type Tratamiento = z.infer<typeof tratamientoSchema>;