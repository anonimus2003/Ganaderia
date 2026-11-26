"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import type {
  Bovino,
  BovinoFilterState,
  BovinoPayload,
} from "@/modulos/inventario/components/animal-drawer"

const INVENTORY_PATH = "/dashboard/inventario"

export type BovinoEnriquecido = Bovino & {
  registrado_por_nombre?: string | null
  madre_label?: string | null
  padre_label?: string | null
}

const payloadSchema = z.object({
  arete: z.string().trim().min(1, "El arete es obligatorio"),
  nombre: z.string().trim().nullable().optional(),
  raza: z.string().trim().min(1, "La raza es obligatoria"),
  genero: z.string().trim().min(1, "El género es obligatorio"),
  categoria: z.string().trim().nullable().optional(),
  proposito: z.string().trim().nullable().optional(),
  fecha_nacimiento: z.string().trim().nullable().optional(),
  condicion: z.string().trim().min(1, "La condición es obligatoria"),
  origen: z.string().trim().nullable().optional(),
  madre_id: z.string().trim().nullable().optional(),
  padre_id: z.string().trim().nullable().optional(),
  motivo_baja: z.string().trim().nullable().optional(),
  fecha_baja: z.string().trim().nullable().optional(),
  observacion_baja: z.string().trim().nullable().optional(),
  observaciones: z.string().trim().nullable().optional(),
})

export interface BovinosPageResult {
  items: BovinoEnriquecido[]
  totalCount: number
  error: string | null
}

function formatBovinoAreteNombre(animal: {
  id: string
  arete?: string | null
  nombre?: string | null
}): string {
  const arete = animal.arete?.trim() || animal.id
  const nombre = animal.nombre?.trim()
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

async function enrichBovinosRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: Bovino[]
): Promise<BovinoEnriquecido[]> {
  if (!items.length) return []

  const userIds = Array.from(
    new Set(
      items
        .map((item) => item.registrado_por)
        .filter((id): id is string => Boolean(id && id.trim()))
    )
  )

  const parentIds = Array.from(
    new Set(
      items
        .flatMap((item) => [item.madre_id, item.padre_id])
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

  const parentMap = new Map<string, string>()
  if (parentIds.length > 0) {
    const { data: padres } = await supabase
      .from("bovinos")
      .select("id, arete, nombre")
      .in("id", parentIds)

    for (const parent of padres ?? []) {
      parentMap.set(parent.id, formatBovinoAreteNombre(parent))
    }
  }

  return items.map((item) => ({
    ...item,
    registrado_por_nombre: item.registrado_por
      ? perfilMap.get(item.registrado_por) ?? null
      : null,
    madre_label: item.madre_id
      ? parentMap.get(item.madre_id) ?? item.madre_id
      : null,
    padre_label: item.padre_id
      ? parentMap.get(item.padre_id) ?? item.padre_id
      : null,
  }))
}

async function ensureUserInPerfiles(
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
}

export async function fetchBovinosPageAction(params: {
  pageIndex: number
  pageSize: number
  filters?: BovinoFilterState
}): Promise<BovinosPageResult> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      items: [],
      totalCount: 0,
      error: "Debes iniciar sesión para consultar el inventario.",
    }
  }

  const permisos = await getPermisosModulo("inventario")
  if (!permisos.canView) {
    return {
      items: [],
      totalCount: 0,
      error: "No tienes permiso para ver el módulo de Inventario.",
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
    .from("bovinos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })

  const f = params.filters
  if (f?.search?.trim()) {
    const q = f.search.trim().replace(/%/g, "\\%").replace(/,/g, "")
    query = query.or(`arete.ilike.%${q}%,nombre.ilike.%${q}%`)
  }
  if (f?.condicion && f.condicion !== "ALL") {
    query = query.eq("condicion", f.condicion)
  }
  if (f?.genero && f.genero !== "ALL") {
    query = query.eq("genero", f.genero)
  }
  if (f?.raza?.trim()) {
    query = query.ilike("raza", `%${f.raza.trim()}%`)
  }
  if (f?.categoria?.trim()) {
    query = query.ilike("categoria", `%${f.categoria.trim()}%`)
  }
  if (f?.proposito && f.proposito !== "ALL") {
    query = query.eq("proposito", f.proposito)
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return { items: [], totalCount: 0, error: error.message }
  }

  const enrichedItems = await enrichBovinosRows(
    supabase,
    (data ?? []) as Bovino[]
  )

  return {
    items: enrichedItems,
    totalCount: count ?? 0,
    error: null,
  }
}

export async function fetchBovinosCatalogoGenealogiaAction(): Promise<{
  items: Bovino[]
  error: string | null
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return { items: [], error: "Debes iniciar sesión." }
  }

  const permisos = await getPermisosModulo("inventario")
  if (!permisos.canView) {
    return { items: [], error: "No tienes permiso para ver Inventario." }
  }

  const { data, error } = await supabase
    .from("bovinos")
    .select("id, arete, nombre, raza, genero, condicion")
    .order("arete", { ascending: true })

  if (error) {
    return { items: [], error: error.message }
  }

  return { items: (data ?? []) as Bovino[], error: null }
}

export async function createBovinoAction(
  values: BovinoPayload
): Promise<{ data: BovinoEnriquecido | null; error: string | null }> {
  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo("inventario")
  if (!permisos.canCreate) {
    return {
      data: null,
      error: "No tienes permiso para crear registros en Inventario.",
    }
  }

  await ensureUserInPerfiles(supabase, user)

  const { data, error } = await supabase
    .from("bovinos")
    .insert({
      ...parsed.data,
      registrado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichBovinosRows(supabase, [data as Bovino])

  revalidatePath(INVENTORY_PATH)
  return { data: enriched, error: null }
}

export async function updateBovinoAction(
  id: string,
  values: BovinoPayload
): Promise<{ data: BovinoEnriquecido | null; error: string | null }> {
  if (!id?.trim()) {
    return { data: null, error: "ID de bovino no válido." }
  }

  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo("inventario")
  if (!permisos.canEdit) {
    return {
      data: null,
      error: "No tienes permiso para editar registros en Inventario.",
    }
  }

  const { data, error } = await supabase
    .from("bovinos")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichBovinosRows(supabase, [data as Bovino])

  revalidatePath(INVENTORY_PATH)
  return { data: enriched, error: null }
}

export async function deleteBovinoAction(
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  if (!id?.trim()) {
    return { ok: false, error: "ID de bovino no válido." }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      ok: false,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo("inventario")
  if (!permisos.canDelete) {
    return {
      ok: false,
      error: "No tienes permiso para eliminar registros en Inventario.",
    }
  }

  const { error } = await supabase.from("bovinos").delete().eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath(INVENTORY_PATH)
  return { ok: true, error: null }
}