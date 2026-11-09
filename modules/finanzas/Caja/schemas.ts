import { z } from "zod";

// Esquema de validación con Zod para Transacciones de Caja
export const transaccionCajaSchema = z.object({
  id: z.string().uuid().optional(),
  tipo: z.enum(["ingreso", "egreso"], {
    required_error: "El tipo de movimiento es obligatorio",
  }),
  categoria: z.string().min(1, "La categoría es obligatoria"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  cantidad: z.coerce.number().int().positive().default(1),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  metodo_pago: z.string().optional().default("Efectivo"),
  descripcion: z.string().optional().nullable(),
  registrado_por: z.string().optional().nullable(),
  registrado_por_nombre: z.string().optional().nullable(), // Campo virtual para la tabla
  created_at: z.string().optional(),
});

// Tipo TypeScript inferido directamente del esquema Zod
export type TransaccionCaja = z.infer<typeof transaccionCajaSchema>;

// Tipo auxiliar para filtros si lo necesitas en tus hooks
export interface FiltrosCaja {
  search?: string;
  tipoSeleccionado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}