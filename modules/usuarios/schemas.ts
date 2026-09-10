import { z } from "zod";

export const usuarioSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  apellidos: z.string().min(2, "El apellido es obligatorio"),
  email: z.string().email("Correo electrónico inválido").optional().nullable(),
  telefono: z.string().min(7, "Teléfono inválido").optional().nullable(),
  rol: z.enum([
    "Administrador",
    "Veterinario",
    "Ordeñador",
    "Obrero",
    "Potreros",
    "Trabajador",
  ]),
  permisos: z.object({
    puede_ver: z.boolean(),
    puede_crear: z.boolean(),
    puede_editar: z.boolean(),
    puede_eliminar: z.boolean(),
  }).optional(),
});

export type Usuario = z.infer<typeof usuarioSchema>;