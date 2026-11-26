"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/server"
import { getPermisosModulo, type ModuloSistema } from "@/lib/permisos"
import type {
  CajaFilterState,
  CajaPayload,
} from "@/modulos/finanzas/ingresos/components/ingresos-drawer"

const CAJA_PATH = "/dashboard/finanzas/ingresos"
const REPORTES_PATH = "/dashboard/finanzas/reportes"
const CAJA_MODULE: ModuloSistema = "finanzas"

export interface CajaRegistro {
  id: string
  tipo: "ingreso" | "egreso" | string
  categoria: string
  monto: number | string
  cantidad: number
  valor_unitario?: number | null
  fecha: string
  metodo_pago?: string | null
  descripcion?: string | null
  registrado_por?: string | null
  created_at?: string
  registrado_por_nombre?: string | null
}

export interface CajaPageResult {
  items: CajaRegistro[]
  totalCount: number
  error: string | null
}

const payloadSchema = z.object({
  tipo: z.enum(["ingreso", "egreso"], {
    message: "El tipo debe ser ingreso o egreso",
  }),
  categoria: z.string().trim().min(1, "La categoría es obligatoria"),
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),
  valor_unitario: z.coerce
    .number()
    .finite()
    .positive("El valor unitario debe ser mayor a 0")
    .max(9999999999.99, "Valor unitario fuera de rango"),
  monto: z.coerce
    .number()
    .finite()
    .positive("El monto debe ser mayor a 0")
    .max(9999999999.99, "Monto fuera de rango"),
  fecha: z.string().trim().min(1, "La fecha es obligatoria"),
  metodo_pago: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : "Efectivo")),
  descripcion: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
})

function calcularTotalCaja(cantidad: number, valorUnitario: number): number {
  const safeCant = Math.max(1, Math.trunc(cantidad))
  const safeUnit = Math.max(0, Number(valorUnitario) || 0)
  return Math.round(safeCant * safeUnit * 100) / 100
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase, user: null }
  }

  return { supabase, user }
}

async function ensureUserInPerfilesAndUsuarios(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown>
  }
) {
  const meta = user.user_metadata ?? {}
  const nombre =
    (typeof meta.nombre === "string" && meta.nombre.trim()) ||
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    user.email?.split("@")[0] ||
    "Usuario"
  const apellidos =
    typeof meta.apellidos === "string" ? meta.apellidos.trim() : ""
  const telefono =
    typeof meta.telefono === "string" ? meta.telefono.trim() : ""

  await supabase.from("perfiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      nombre,
      apellidos: apellidos || null,
      telefono: telefono || null,
    },
    { onConflict: "id", ignoreDuplicates: true }
  )

  await supabase.from("usuarios").upsert(
    {
      id: user.id,
      email: user.email ?? null,
    },
    { onConflict: "id", ignoreDuplicates: true }
  )
}

async function enrichCajaRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: CajaRegistro[]
): Promise<CajaRegistro[]> {
  if (!items.length) return []

  const userIds = Array.from(
    new Set(
      items
        .map((item) => item.registrado_por)
        .filter((id): id is string => Boolean(id && id.trim()))
    )
  )

  const perfilMap = new Map<string, string>()
  if (userIds.length > 0) {
    const { data: perfiles } = await supabase
      .from("perfiles")
      .select("id, nombre, apellidos, email")
      .in("id", userIds)

    for (const p of perfiles ?? []) {
      const fullName = [p.nombre, p.apellidos]
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter(Boolean)
        .join(" ")
      perfilMap.set(p.id, fullName || p.email || p.id)
    }
  }

  return items.map((item) => {
    const cant = Math.max(1, Number(item.cantidad) || 1)
    const montoNum = Number(item.monto) || 0
    const valorUnitario =
      typeof item.valor_unitario === "number" && Number.isFinite(item.valor_unitario)
        ? item.valor_unitario
        : montoNum > 0
          ? Math.round((montoNum / cant) * 100) / 100
          : 0

    return {
      ...item,
      valor_unitario: valorUnitario,
      registrado_por_nombre: item.registrado_por
        ? perfilMap.get(item.registrado_por) ?? null
        : null,
    }
  })
}

export async function fetchCajaPageAction(params: {
  pageIndex: number
  pageSize: number
  filters?: CajaFilterState
}): Promise<CajaPageResult> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      items: [],
      totalCount: 0,
      error: "Debes iniciar sesión para consultar los movimientos de caja.",
    }
  }

  const permisos = await getPermisosModulo(CAJA_MODULE)
  if (!permisos.canView) {
    return {
      items: [],
      totalCount: 0,
      error: "No tienes permiso para ver el módulo de Caja.",
    }
  }

  const pageIndex = Math.max(
    0,
    Number.isFinite(params.pageIndex) ? params.pageIndex : 0
  )
  const pageSize = Math.min(
    100,
    Math.max(1, Number.isFinite(params.pageSize) ? params.pageSize : 10)
  )
  const from = pageIndex * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("caja")
    .select("*", { count: "exact" })
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })

  const f = params.filters
  if (f?.search?.trim()) {
    const q = f.search.trim().replace(/%/g, "\\%").replace(/,/g, "")
    query = query.or(`categoria.ilike.%${q}%,descripcion.ilike.%${q}%`)
  }
  if (f?.tipo && f.tipo !== "ALL") {
    query = query.eq("tipo", f.tipo)
  }
  if (f?.metodo_pago && f.metodo_pago !== "ALL") {
    query = query.eq("metodo_pago", f.metodo_pago)
  }
  if (f?.fechaDesde?.trim()) {
    query = query.gte("fecha", f.fechaDesde.trim())
  }
  if (f?.fechaHasta?.trim()) {
    query = query.lte("fecha", f.fechaHasta.trim())
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return { items: [], totalCount: 0, error: error.message }
  }

  const enrichedItems = await enrichCajaRows(
    supabase,
    (data ?? []) as CajaRegistro[]
  )

  return {
    items: enrichedItems,
    totalCount: count ?? 0,
    error: null,
  }
}

export async function createCajaAction(
  values: CajaPayload
): Promise<{ data: CajaRegistro | null; error: string | null }> {
  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de caja inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(CAJA_MODULE)
  if (!permisos.canCreate) {
    return {
      data: null,
      error: "No tienes permiso para crear registros en Caja.",
    }
  }

  const montoCalculado = calcularTotalCaja(
    parsed.data.cantidad,
    parsed.data.valor_unitario
  )

  if (montoCalculado <= 0 || montoCalculado > 9999999999.99) {
    return {
      data: null,
      error: "El total calculado está fuera de rango o es inválido.",
    }
  }

  await ensureUserInPerfilesAndUsuarios(supabase, user)

  const { data, error } = await supabase
    .from("caja")
    .insert({
      tipo: parsed.data.tipo,
      categoria: parsed.data.categoria,
      monto: montoCalculado,
      cantidad: parsed.data.cantidad,
      fecha: parsed.data.fecha,
      metodo_pago: parsed.data.metodo_pago,
      descripcion: parsed.data.descripcion,
      registrado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichCajaRows(supabase, [
    {
      ...(data as CajaRegistro),
      valor_unitario: parsed.data.valor_unitario,
    },
  ])

  revalidatePath(CAJA_PATH)
  revalidatePath(REPORTES_PATH)
  return { data: enriched, error: null }
}

export async function updateCajaAction(
  id: string,
  values: CajaPayload
): Promise<{ data: CajaRegistro | null; error: string | null }> {
  if (!id?.trim()) {
    return { data: null, error: "ID de movimiento de caja no válido." }
  }

  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de caja inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(CAJA_MODULE)
  if (!permisos.canEdit) {
    return {
      data: null,
      error: "No tienes permiso para editar registros en Caja.",
    }
  }

  const montoCalculado = calcularTotalCaja(
    parsed.data.cantidad,
    parsed.data.valor_unitario
  )

  if (montoCalculado <= 0 || montoCalculado > 9999999999.99) {
    return {
      data: null,
      error: "El total calculado está fuera de rango o es inválido.",
    }
  }

  const { data, error } = await supabase
    .from("caja")
    .update({
      tipo: parsed.data.tipo,
      categoria: parsed.data.categoria,
      monto: montoCalculado,
      cantidad: parsed.data.cantidad,
      fecha: parsed.data.fecha,
      metodo_pago: parsed.data.metodo_pago,
      descripcion: parsed.data.descripcion,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichCajaRows(supabase, [
    {
      ...(data as CajaRegistro),
      valor_unitario: parsed.data.valor_unitario,
    },
  ])

  revalidatePath(CAJA_PATH)
  revalidatePath(REPORTES_PATH)
  return { data: enriched, error: null }
}

export async function deleteCajaAction(
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  if (!id?.trim()) {
    return { ok: false, error: "ID de movimiento de caja no válido." }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      ok: false,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(CAJA_MODULE)
  if (!permisos.canDelete) {
    return {
      ok: false,
      error: "No tienes permiso para eliminar registros en Caja.",
    }
  }

  const { error } = await supabase.from("caja").delete().eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath(CAJA_PATH)
  revalidatePath(REPORTES_PATH)
  return { ok: true, error: null }
}