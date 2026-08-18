import { z } from "zod";

export const userFormSchema = z.object({
  nombre: z.string().min(2, "Obligatorio"),
  apellidos: z.string().min(2, "Obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z.string().min(7, "Teléfono inválido"),
  rol: z.enum(['Administrador', 'Veterinario', 'Ordeñador', 'Obrero', 'Potreros', 'Trabajador']),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userFormSchema>;