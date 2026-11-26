"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import type {
  ReproduccionFilterState,
  ReproduccionPayload,
} from "@/modulos/reproduccion/components/reproduccion-drawer"

const REPRODUCCIONES_PATH = "/dashboard/reproduccion"
const REPRODUCCIONES_MODULE = "reproduccion" as const

export interface BovinoOpcionReproduccion {
  id: string
  arete: string
  nombre?: string | null
  raza?: string | null
  genero?: string | null
  condicion?: string | null
}

export interface ReproduccionRegistro {
  id: string
  bovino_id: string
  toro_pajilla: string
  raza_toro?: string | null
  numero_servicios?: number | null
  tipo?: string | null
  fecha_inseminacion: string
  fecha_chequeo?: string | null
  fecha_probable_parto?: string | null
  tecnico: string
  estado?: string | null
  created_at?: string
  fecha_parto?: string | null
  registrado_por?: string | null
  fecha_secado?: string | null
  observaciones?: string | null
  bovino_label?: string | null
  registrado_por_nombre?: string | null
}

export interface ReproduccionesPageResult {
  items: ReproduccionRegistro[]
  totalCount: number
  error: string | null
}

const optionalDateSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : null))

const optionalTextSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : null))

const payloadSchema = z.object({
  bovino_id: z.string().trim().min(1, "Debes seleccionar un bovino"),
  toro_pajilla: z
    .string()
    .trim()
    .min(1, "El toro o pajilla es obligatorio")
    .max(100, "Máximo 100 caracteres en toro/pajilla"),
  raza_toro: z
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres en raza del toro")
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  numero_servicios: z.coerce
    .number()
    .int("El número de servicios debe ser un entero")
    .min(1, "Debe ser al menos 1 servicio")
    .nullable()
    .optional()
    .transform((val) => (val && val >= 1 ? val : 1)),
  tipo: optionalTextSchema.transform((val) => val ?? "I.Artificial"),
  fecha_inseminacion: z
    .string()
    .trim()
    .min(1, "La fecha de inseminación / servicio es obligatoria"),
  fecha_chequeo: optionalDateSchema,
  fecha_probable_parto: optionalDateSchema,
  fecha_secado: optionalDateSchema,
  fecha_parto: optionalDateSchema,
  tecnico: z
    .string()
    .trim()
    .min(1, "El técnico es obligatorio")
    .max(100, "Máximo 100 caracteres en técnico"),
  estado: optionalTextSchema.transform((val) => val ?? "Pendiente"),
  observaciones: optionalTextSchema,
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

async function enrichReproduccionesRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: ReproduccionRegistro[]
): Promise<ReproduccionRegistro[]> {
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

export async function fetchReproduccionesPageAction(params: {
  pageIndex: number
  pageSize: number
  filters?: ReproduccionFilterState
}): Promise<ReproduccionesPageResult> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      items: [],
      totalCount: 0,
      error:
        "Debes iniciar sesión para consultar los registros de reproducción.",
    }
  }

  const permisos = await getPermisosModulo(REPRODUCCIONES_MODULE)
  if (!permisos.canView) {
    return {
      items: [],
      totalCount: 0,
      error: "No tienes permiso para ver el módulo de Reproducciones.",
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
  let matchingBovinoIds: string[] = []

  if (f?.search?.trim()) {
    const q = f.search.trim().replace(/%/g, "\\%").replace(/,/g, "")
    const { data: matchedBovinos } = await supabase
      .from("bovinos")
      .select("id")
      .or(`arete.ilike.%${q}%,nombre.ilike.%${q}%`)

    matchingBovinoIds = (matchedBovinos ?? []).map((b) => b.id)
  }

  let query = supabase
    .from("reproducciones")
    .select("*", { count: "exact" })
    .order("fecha_inseminacion", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })

  if (f?.search?.trim()) {
    const q = f.search.trim().replace(/%/g, "\\%").replace(/,/g, "")
    if (matchingBovinoIds.length > 0) {
      query = query.or(
        `toro_pajilla.ilike.%${q}%,raza_toro.ilike.%${q}%,bovino_id.in.(${matchingBovinoIds.join(",")})`
      )
    } else {
      query = query.or(
        `toro_pajilla.ilike.%${q}%,raza_toro.ilike.%${q}%`
      )
    }
  }

  if (f?.tipo && f.tipo !== "ALL") {
    query = query.eq("tipo", f.tipo)
  }
  if (f?.estado && f.estado !== "ALL") {
    query = query.eq("estado", f.estado)
  }
  if (f?.tecnico?.trim()) {
    query = query.ilike("tecnico", `%${f.tecnico.trim()}%`)
  }
  if (f?.fechaDesde?.trim()) {
    query = query.gte("fecha_inseminacion", f.fechaDesde.trim())
  }
  if (f?.fechaHasta?.trim()) {
    query = query.lte("fecha_inseminacion", f.fechaHasta.trim())
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return { items: [], totalCount: 0, error: error.message }
  }

  const enrichedItems = await enrichReproduccionesRows(
    supabase,
    (data ?? []) as ReproduccionRegistro[]
  )

  return {
    items: enrichedItems,
    totalCount: count ?? 0,
    error: null,
  }
}

export async function fetchReproduccionesCatalogoBovinosAction(): Promise<{
  items: BovinoOpcionReproduccion[]
  error: string | null
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return { items: [], error: "Debes iniciar sesión." }
  }

  const permisos = await getPermisosModulo(REPRODUCCIONES_MODULE)
  if (!permisos.canView) {
    return { items: [], error: "No tienes permiso para ver Reproducciones." }
  }

  const { data, error } = await supabase
    .from("bovinos")
    .select("id, arete, nombre, raza, genero, condicion")
    .order("arete", { ascending: true })

  if (error) {
    return { items: [], error: error.message }
  }

  return { items: (data ?? []) as BovinoOpcionReproduccion[], error: null }
}

export async function createReproduccionAction(
  values: ReproduccionPayload
): Promise<{ data: ReproduccionRegistro | null; error: string | null }> {
  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos reproductivos inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(REPRODUCCIONES_MODULE)
  if (!permisos.canCreate) {
    return {
      data: null,
      error: "No tienes permiso para crear registros en Reproducciones.",
    }
  }

  await ensureUserInPerfilesAndUsuarios(supabase, user)

  const { data, error } = await supabase
    .from("reproducciones")
    .insert({
      bovino_id: parsed.data.bovino_id,
      toro_pajilla: parsed.data.toro_pajilla,
      raza_toro: parsed.data.raza_toro,
      numero_servicios: parsed.data.numero_servicios,
      tipo: parsed.data.tipo,
      fecha_inseminacion: parsed.data.fecha_inseminacion,
      fecha_chequeo: parsed.data.fecha_chequeo,
      fecha_probable_parto: parsed.data.fecha_probable_parto,
      fecha_secado: parsed.data.fecha_secado,
      fecha_parto: parsed.data.fecha_parto,
      tecnico: parsed.data.tecnico,
      estado: parsed.data.estado,
      observaciones: parsed.data.observaciones,
      registrado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichReproduccionesRows(supabase, [
    data as ReproduccionRegistro,
  ])

  revalidatePath(REPRODUCCIONES_PATH)
  return { data: enriched, error: null }
}

export async function updateReproduccionAction(
  id: string,
  values: ReproduccionPayload
): Promise<{ data: ReproduccionRegistro | null; error: string | null }> {
  if (!id?.trim()) {
    return { data: null, error: "ID de registro reproductivo no válido." }
  }

  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos reproductivos inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(REPRODUCCIONES_MODULE)
  if (!permisos.canEdit) {
    return {
      data: null,
      error: "No tienes permiso para editar registros en Reproducciones.",
    }
  }

  const { data, error } = await supabase
    .from("reproducciones")
    .update({
      bovino_id: parsed.data.bovino_id,
      toro_pajilla: parsed.data.toro_pajilla,
      raza_toro: parsed.data.raza_toro,
      numero_servicios: parsed.data.numero_servicios,
      tipo: parsed.data.tipo,
      fecha_inseminacion: parsed.data.fecha_inseminacion,
      fecha_chequeo: parsed.data.fecha_chequeo,
      fecha_probable_parto: parsed.data.fecha_probable_parto,
      fecha_secado: parsed.data.fecha_secado,
      fecha_parto: parsed.data.fecha_parto,
      tecnico: parsed.data.tecnico,
      estado: parsed.data.estado,
      observaciones: parsed.data.observaciones,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const [enriched] = await enrichReproduccionesRows(supabase, [
    data as ReproduccionRegistro,
  ])

  revalidatePath(REPRODUCCIONES_PATH)
  return { data: enriched, error: null }
}

export async function deleteReproduccionAction(
  id: string
): Promise<{ ok: boolean; error: string | null }> {
  if (!id?.trim()) {
    return { ok: false, error: "ID de registro reproductivo no válido." }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      ok: false,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(REPRODUCCIONES_MODULE)
  if (!permisos.canDelete) {
    return {
      ok: false,
      error: "No tienes permiso para eliminar registros en Reproducciones.",
    }
  }

  const { error } = await supabase
    .from("reproducciones")
    .delete()
    .eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath(REPRODUCCIONES_PATH)
  return { ok: true, error: null }
}