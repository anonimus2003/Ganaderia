"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import type {
  OrdenoFilterState,
  OrdenoPayload,
} from "@/modulos/ordeno/components/ordeno-drawer"

const ORDENO_PATH = "/dashboard/ordeno"
const ORDENO_MODULE = "ordeno"

export interface BovinoOpcionOrdeno {
  id: string
  arete: string
  nombre?: string | null
  raza?: string | null
  genero?: string | null
  condicion?: string | null
}

export interface OrdenoRegistro {
  id: string
  bovino_id: string
  fecha: string
  litros: number | string
  jornada: "Mañana" | "Tarde"
  observaciones?: string | null
  registrado_por?: string | null
  created_at?: string
  concentrado_kg?: number | string | null
  bovino_label?: string | null
  registrado_por_nombre?: string | null
}

export interface OrdenoPageResult {
  items: OrdenoRegistro[]
  totalCount: number
  error: string | null
}

const payloadSchema = z.object({
  bovino_id: z.string().trim().min(1, "Debes seleccionar un bovino"),
  fecha: z.string().trim().min(1, "La fecha es obligatoria"),
  litros: z.coerce
    .number()
    .finite()
    .min(0, "Los litros no pueden ser negativos")
    .max(999.99, "Valor de litros fuera de rango"),
  jornada: z.enum(["Mañana", "Tarde"], {
    message: "La jornada debe ser Mañana o Tarde",
  }),
  concentrado_kg: z.coerce
    .number()
    .finite()
    .min(0, "El concentrado no puede ser negativo")
    .max(999.99, "Valor de concentrado fuera de rango")
    .nullable()
    .optional(),
  observaciones: z.string().trim().nullable().optional(),
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

async function enrichOrdenoRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: OrdenoRegistro[]
): Promise<OrdenoRegistro[]> {
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

export async function fetchOrdenoPageAction(params: {
  pageIndex: number
  pageSize: number
  filters?: OrdenoFilterState
}): Promise<OrdenoPageResult> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      items: [],
      totalCount: 0,
      error: "Debes iniciar sesión para consultar los registros de ordeño.",
    }
  }

  const permisos = await getPermisosModulo(ORDENO_MODULE)
  if (!permisos.canView) {
    return {
      items: [],
      totalCount: 0,
      error: "No tienes permiso para ver el módulo de Ordeño.",
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

  let matchingBovinoIds: string[] | null = null
  const f = params.filters

  if (f?.search?.trim()) {
    const q = f.search.trim().replace(/%/g, "\\%").replace(/,/g, "")
    const { data: matchedBovinos } = await supabase
      .from("bovinos")
      .select("id")
      .or(`arete.ilike.%${q}%,nombre.ilike.%${q}%`)

    matchingBovinoIds = (matchedBovinos ?? []).map((b) => b.id)
    if (matchingBovinoIds.length === 0) {
      return { items: [], totalCount: 0, error: null }
    }
  }

  let query = supabase
    .from("ordeño")
    .select("*", { count: "exact" })
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })

  if (matchingBovinoIds) {
    query = query.in("bovino_id", matchingBovinoIds)
  }
  if (f?.jornada && f.jornada !== "ALL") {
    query = query.eq("jornada", f.jornada)
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

  const enrichedItems = await enrichOrdenoRows(
    supabase,
    (data ?? []) as OrdenoRegistro[]
  )

  return {
    items: enrichedItems,
    totalCount: count ?? 0,
    error: null,
  }
}

export async function fetchOrdenoCatalogoBovinosAction(): Promise<{
  items: BovinoOpcionOrdeno[]
  error: string | null
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return { items: [], error: "Debes iniciar sesión." }
  }

  const permisos = await getPermisosModulo(ORDENO_MODULE)
  if (!permisos.canView) {
    return { items: [], error: "No tienes permiso para ver Ordeño." }
  }

  const { data, error } = await supabase
    .from("bovinos")
    .select("id, arete, nombre, raza, genero, condicion")
    .order("arete", { ascending: true })

  if (error) {
    return { items: [], error: error.message }
  }

  return { items: (data ?? []) as BovinoOpcionOrdeno[], error: null }
}

export async function createOrdenoAction(
  values: OrdenoPayload
): Promise<{ data: OrdenoRegistro | null; error: string | null }> {
  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de ordeño inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(ORDENO_MODULE)
  if (!permisos.canCreate) {
    return {
      data: null,
      error: "No tienes permiso para crear registros en Ordeño.",
    }
  }

  await ensureUserInPerfilesAndUsuarios(supabase, user)

  const { data, error } = await supabase
    .from("ordeño")
    .insert({
      bovino_id: parsed.data.bovino_id,
      fecha: parsed.data.fecha,
      litros: parsed.data.litros,
      jornada: parsed.data.jornada,
      concentrado_kg: parsed.data.concentrado_kg ?? 0,
      observaciones: parsed.data.observaciones || null,
      registrado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichOrdenoRows(supabase, [
    data as OrdenoRegistro,
  ])

  revalidatePath(ORDENO_PATH)
  return { data: enriched, error: null }
}

export async function updateOrdenoAction(
  id: string,
  values: OrdenoPayload
): Promise<{ data: OrdenoRegistro | null; error: string | null }> {
  if (!id?.trim()) {
    return { data: null, error: "ID de registro de ordeño no válido." }
  }

  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de ordeño inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(ORDENO_MODULE)
  if (!permisos.canEdit) {
    return {
      data: null,
      error: "No tienes permiso para editar registros en Ordeño.",
    }
  }

  const { data, error } = await supabase
    .from("ordeño")
    .update({
      bovino_id: parsed.data.bovino_id,
      fecha: parsed.data.fecha,
      litros: parsed.data.litros,
      jornada: parsed.data.jornada,
      concentrado_kg: parsed.data.concentrado_kg ?? 0,
      observaciones: parsed.data.observaciones || null,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichOrdenoRows(supabase, [
    data as OrdenoRegistro,
  ])

  revalidatePath(ORDENO_PATH)
  return { data: enriched, error: null }
}

export async function deleteOrdenoAction(
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  if (!id?.trim()) {
    return { ok: false, error: "ID de registro de ordeño no válido." }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      ok: false,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(ORDENO_MODULE)
  if (!permisos.canDelete) {
    return {
      ok: false,
      error: "No tienes permiso para eliminar registros en Ordeño.",
    }
  }

  const { error } = await supabase.from("ordeño").delete().eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath(ORDENO_PATH)
  return { ok: true, error: null }
}