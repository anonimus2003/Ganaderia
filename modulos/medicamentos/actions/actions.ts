"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import {
  VIAS_APLICACION,
  type MedicamentoFilterState,
  type MedicamentoPayload,
  type ViaAplicacion,
} from "@/modulos/medicamentos/components/medicamento-drawer"

const MEDICAMENTOS_PATH = "/dashboard/medicamentos"
const MEDICAMENTOS_MODULE = "medicamentos"

export interface BovinoOpcionMedicamento {
  id: string
  arete: string
  nombre?: string | null
  raza?: string | null
  genero?: string | null
  condicion?: string | null
}

export interface MedicamentoRegistro {
  id: string
  bovino_id: string
  medicamento: string
  dosis: string
  via: ViaAplicacion | string
  fecha_aplicacion: string
  veterinario: string
  motivo?: string | null
  registrado_por?: string | null
  created_at?: string
  retiro_leche?: number | null
  retiro_carne?: number | null
  bovino_label?: string | null
  registrado_por_nombre?: string | null
}

export interface MedicamentosPageResult {
  items: MedicamentoRegistro[]
  totalCount: number
  error: string | null
}

const payloadSchema = z.object({
  bovino_id: z.string().trim().min(1, "Debes seleccionar un bovino"),
  medicamento: z.string().trim().min(1, "El medicamento es obligatorio"),
  dosis: z.string().trim().min(1, "La dosis es obligatoria"),
  via: z.enum(VIAS_APLICACION, {
    message: "Selecciona una vía de aplicación válida",
  }),
  fecha_aplicacion: z
    .string()
    .trim()
    .min(1, "La fecha de aplicación es obligatoria"),
  veterinario: z.string().trim().min(1, "El veterinario es obligatorio"),
  motivo: z.string().trim().nullable().optional(),
  retiro_leche: z.coerce
    .number()
    .int("Los días de retiro de leche deben ser un número entero")
    .min(0, "El retiro de leche no puede ser negativo")
    .nullable()
    .optional(),
  retiro_carne: z.coerce
    .number()
    .int("Los días de retiro de carne deben ser un número entero")
    .min(0, "El retiro de carne no puede ser negativo")
    .nullable()
    .optional(),
})

function formatBovinoLabel(bovino: {
  id: string
  arete?: string | null
  nombre?: string | null
}): string {
  const arete = bovino.arete?.trim() || bovino.id
  const nombre = bovino.nombre?.trim()
  return nombre ? `${arete} — ${nombre}` : arete
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

async function enrichMedicamentosRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: MedicamentoRegistro[]
): Promise<MedicamentoRegistro[]> {
  if (!items.length) return []

  const bovinoIds = Array.from(
    new Set(
      items
        .map((item) => item.bovino_id)
        .filter((id): id is string => Boolean(id && id.trim()))
    )
  )

  const userIds = Array.from(
    new Set(
      items
        .map((item) => item.registrado_por)
        .filter((id): id is string => Boolean(id && id.trim()))
    )
  )

  const bovinoMap = new Map<string, string>()
  if (bovinoIds.length > 0) {
    const { data: bovinos } = await supabase
      .from("bovinos")
      .select("id, arete, nombre")
      .in("id", bovinoIds)

    for (const b of bovinos ?? []) {
      bovinoMap.set(b.id, formatBovinoLabel(b))
    }
  }

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

  return items.map((item) => ({
    ...item,
    bovino_label: item.bovino_id
      ? bovinoMap.get(item.bovino_id) ?? item.bovino_id
      : null,
    registrado_por_nombre: item.registrado_por
      ? perfilMap.get(item.registrado_por) ?? null
      : null,
  }))
}

export async function fetchMedicamentosPageAction(params: {
  pageIndex: number
  pageSize: number
  filters?: MedicamentoFilterState
}): Promise<MedicamentosPageResult> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      items: [],
      totalCount: 0,
      error: "Debes iniciar sesión para consultar los registros de medicamentos.",
    }
  }

  const permisos = await getPermisosModulo(MEDICAMENTOS_MODULE)
  if (!permisos.canView) {
    return {
      items: [],
      totalCount: 0,
      error: "No tienes permiso para ver el módulo de Medicamentos.",
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

  const f = params.filters
  let matchingBovinoIds: string[] | null = null

  if (f?.search?.trim()) {
    const q = f.search.trim().replace(/%/g, "\\%").replace(/,/g, "")
    const { data: matchedBovinos } = await supabase
      .from("bovinos")
      .select("id")
      .or(`arete.ilike.%${q}%,nombre.ilike.%${q}%`)

    matchingBovinoIds = (matchedBovinos ?? []).map((b) => b.id)
  }

  let query = supabase
    .from("medicamentos")
    .select("*", { count: "exact" })
    .order("fecha_aplicacion", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })

  if (f?.search?.trim()) {
    const q = f.search.trim().replace(/%/g, "\\%").replace(/,/g, "")
    if (matchingBovinoIds && matchingBovinoIds.length > 0) {
      query = query.or(
        `medicamento.ilike.%${q}%,bovino_id.in.(${matchingBovinoIds.join(",")})`
      )
    } else {
      query = query.ilike("medicamento", `%${q}%`)
    }
  }

  if (f?.via && f.via !== "ALL") {
    query = query.eq("via", f.via)
  }
  if (f?.veterinario?.trim()) {
    query = query.ilike("veterinario", `%${f.veterinario.trim()}%`)
  }
  if (f?.fechaDesde?.trim()) {
    query = query.gte("fecha_aplicacion", f.fechaDesde.trim())
  }
  if (f?.fechaHasta?.trim()) {
    query = query.lte("fecha_aplicacion", f.fechaHasta.trim())
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return { items: [], totalCount: 0, error: error.message }
  }

  const enrichedItems = await enrichMedicamentosRows(
    supabase,
    (data ?? []) as MedicamentoRegistro[]
  )

  return {
    items: enrichedItems,
    totalCount: count ?? 0,
    error: null,
  }
}

export async function fetchMedicamentosCatalogoBovinosAction(): Promise<{
  items: BovinoOpcionMedicamento[]
  error: string | null
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return { items: [], error: "Debes iniciar sesión." }
  }

  const permisos = await getPermisosModulo(MEDICAMENTOS_MODULE)
  if (!permisos.canView) {
    return { items: [], error: "No tienes permiso para ver Medicamentos." }
  }

  const { data, error } = await supabase
    .from("bovinos")
    .select("id, arete, nombre, raza, genero, condicion")
    .order("arete", { ascending: true })

  if (error) {
    return { items: [], error: error.message }
  }

  return { items: (data ?? []) as BovinoOpcionMedicamento[], error: null }
}

export async function createMedicamentoAction(
  values: MedicamentoPayload
): Promise<{ data: MedicamentoRegistro | null; error: string | null }> {
  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de medicamento inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(MEDICAMENTOS_MODULE)
  if (!permisos.canCreate) {
    return {
      data: null,
      error: "No tienes permiso para crear registros en Medicamentos.",
    }
  }

  await ensureUserInPerfilesAndUsuarios(supabase, user)

  const { data, error } = await supabase
    .from("medicamentos")
    .insert({
      bovino_id: parsed.data.bovino_id,
      medicamento: parsed.data.medicamento,
      dosis: parsed.data.dosis,
      via: parsed.data.via,
      fecha_aplicacion: parsed.data.fecha_aplicacion,
      veterinario: parsed.data.veterinario,
      motivo: parsed.data.motivo || null,
      retiro_leche: parsed.data.retiro_leche ?? 0,
      retiro_carne: parsed.data.retiro_carne ?? 0,
      registrado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichMedicamentosRows(supabase, [
    data as MedicamentoRegistro,
  ])

  revalidatePath(MEDICAMENTOS_PATH)
  return { data: enriched, error: null }
}

export async function updateMedicamentoAction(
  id: string,
  values: MedicamentoPayload
): Promise<{ data: MedicamentoRegistro | null; error: string | null }> {
  if (!id?.trim()) {
    return { data: null, error: "ID de registro de medicamento no válido." }
  }

  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de medicamento inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(MEDICAMENTOS_MODULE)
  if (!permisos.canEdit) {
    return {
      data: null,
      error: "No tienes permiso para editar registros en Medicamentos.",
    }
  }

  const { data, error } = await supabase
    .from("medicamentos")
    .update({
      bovino_id: parsed.data.bovino_id,
      medicamento: parsed.data.medicamento,
      dosis: parsed.data.dosis,
      via: parsed.data.via,
      fecha_aplicacion: parsed.data.fecha_aplicacion,
      veterinario: parsed.data.veterinario,
      motivo: parsed.data.motivo || null,
      retiro_leche: parsed.data.retiro_leche ?? 0,
      retiro_carne: parsed.data.retiro_carne ?? 0,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichMedicamentosRows(supabase, [
    data as MedicamentoRegistro,
  ])

  revalidatePath(MEDICAMENTOS_PATH)
  return { data: enriched, error: null }
}

export async function deleteMedicamentoAction(
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  if (!id?.trim()) {
    return { ok: false, error: "ID de registro de medicamento no válido." }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      ok: false,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(MEDICAMENTOS_MODULE)
  if (!permisos.canDelete) {
    return {
      ok: false,
      error: "No tienes permiso para eliminar registros en Medicamentos.",
    }
  }

  const { error } = await supabase.from("medicamentos").delete().eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath(MEDICAMENTOS_PATH)
  return { ok: true, error: null }
}