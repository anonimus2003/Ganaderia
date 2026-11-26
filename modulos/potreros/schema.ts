import { z } from "zod"

export const bovinoSchema = z.object({
  id: z.number(),
  arete: z.string().min(1, "El número de arete es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  raza: z.string(),
  categoria: z.string(),
  sexo: z.string(),
  peso: z.string(),
  estadoSalud: z.string(),
  lote: z.string(),
})

export type Bovino = z.infer<typeof bovinoSchema>