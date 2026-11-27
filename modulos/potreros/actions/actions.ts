"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/server"
import { getPermisosModulo, type ModuloSistema } from "@/lib/permisos"
import type {
  BovinoOption,
  OcupacionPotreroFilterState,
  OcupacionPotreroPayload,
  PotreroOption,
  SalidaPotreroLotePayload,
} from "@/modulos/potreros/components/potreros-ocupacion-drawer"
import type { HistorialOcupacionPotrero } from "@/modulos/potreros/components/data-table"

const POTREROS_PATH = "/dashboard/potreros"
const POTREROS_MODULE: ModuloSistema = "potreros"

export interface OcupacionPageResult {
  items: HistorialOcupacionPotrero[]
  totalCount: number
  error: string | null
}

const payloadSchema = z.object({
  potrero_id: z.coerce.number().int().positive("Selecciona un potrero válido"),
  bovino_id: z.string().trim().min(1, "Selecciona un bovino"),
  bovino_ids: z.array(z.string().trim().min(1)).optional(),
  fecha_entrada: z.string().trim().min(1, "La fecha de entrada es obligatoria"),
  fecha_salida: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  aforo: z
    .union([z.coerce.number().finite().min(0), z.null()])
    .optional()
    .transform((val) => (val === undefined ? null : val)),
})

const salidaLoteSchema = z.object({
  potrero_id: z.coerce.number().int().positive("Selecciona un potrero válido"),
  ocupacion_ids: z.array(z.coerce.number().int().positive()).optional(),
  bovino_ids: z.array(z.string().trim().min(1)).optional(),
  fecha_salida: z.string().trim().min(1, "La fecha de salida es obligatoria"),
})

function toBogotaTimestampWithoutTz(value: string): string {
  const trimmed = value.trim()
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
  )
  if (match) {
    const [, y, m, d, hh, mm, ss = "00"] = match
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  }

  const parsed = new Date(trimmed)
  const baseDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(baseDate)

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00"

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`
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

async function syncPotreroEstadoFromHistorial(
  supabase: Awaited<ReturnType<typeof createClient>>,
  potreroId: number
): Promise<void> {
  if (!Number.isInteger(potreroId) || potreroId <= 0) return

  const { count, error } = await supabase
    .from("historial_ocupacion_potreros")
    .select("id", { count: "exact", head: true })
    .eq("potrero_id", potreroId)
    .is("fecha_salida", null)

  if (error) {
    console.error("[syncPotreroEstadoFromHistorial]", error.message)
    return
  }

  const nuevoEstado = (count ?? 0) > 0 ? "Ocupado" : "En Descanso"

  const { error: updateError } = await supabase
    .from("potreros")
    .update({ estado: nuevoEstado })
    .eq("id", potreroId)

  if (updateError) {
    console.error("[syncPotreroEstadoFromHistorial:update]", updateError.message)
  }
}

async function enrichOcupacionRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: Record<string, unknown>[]
): Promise<HistorialOcupacionPotrero[]> {
  if (!rows.length) return []

  const potreroIds = Array.from(
    new Set(
      rows
        .map((r) => Number(r.potrero_id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  )

  const bovinoIds = Array.from(
    new Set(
      rows
        .map((r) => (typeof r.bovino_id === "string" ? r.bovino_id.trim() : ""))
        .filter(Boolean)
    )
  )

  const userIds = Array.from(
    new Set(
      rows
        .map((r) =>
          typeof r.registrado_por === "string" ? r.registrado_por.trim() : ""
        )
        .filter(Boolean)
    )
  )

  const potreroMap = new Map<number, string>()
  if (potreroIds.length > 0) {
    const { data: potrerosData } = await supabase
      .from("potreros")
      .select("id, nombre")
      .in("id", potreroIds)

    for (const p of potrerosData ?? []) {
      potreroMap.set(Number(p.id), String(p.nombre ?? `Potrero #${p.id}`))
    }
  }

  const bovinoMap = new Map<string, string>()
  if (bovinoIds.length > 0) {
    const { data: bovinosData } = await supabase
      .from("bovinos")
      .select("id, arete, nombre")
      .in("id", bovinoIds)

    for (const b of bovinosData ?? []) {
      const arete = typeof b.arete === "string" ? b.arete.trim() : ""
      const nombre = typeof b.nombre === "string" ? b.nombre.trim() : ""
      bovinoMap.set(
        String(b.id),
        arete && nombre
          ? `${arete} — ${nombre}`
          : arete || nombre || String(b.id)
      )
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

  return rows.map((r) => {
    const potreroId = Number(r.potrero_id)
    const bovinoId = String(r.bovino_id ?? "")
    const registradoPor =
      typeof r.registrado_por === "string" && r.registrado_por.trim()
        ? r.registrado_por.trim()
        : null

    return {
      id: Number(r.id),
      potrero_id: potreroId,
      bovino_id: bovinoId,
      fecha_entrada: String(r.fecha_entrada ?? ""),
      fecha_salida:
        typeof r.fecha_salida === "string" && r.fecha_salida.trim()
          ? r.fecha_salida
          : null,
      registrado_por: registradoPor,
      aforo:
        r.aforo === null || r.aforo === undefined || r.aforo === ""
          ? null
          : Number(r.aforo),
      created_at: typeof r.created_at === "string" ? r.created_at : null,
      potrero_nombre: potreroMap.get(potreroId) ?? null,
      bovino_label: bovinoMap.get(bovinoId) ?? null,
      registrado_por_nombre: registradoPor
        ? perfilMap.get(registradoPor) ?? null
        : null,
    }
  })
}

export async function fetchCatalogosOcupacionPotreroAction(): Promise<{
  potreros: PotreroOption[]
  bovinos: BovinoOption[]
  error: string | null
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      potreros: [],
      bovinos: [],
      error: "Debes iniciar sesión para consultar potreros y bovinos.",
    }
  }

  const [potrerosRes, bovinosRes] = await Promise.all([
    supabase
      .from("potreros")
      .select("id, nombre, estado, tipo_pasto, area_m2")
      .order("nombre", { ascending: true }),
    supabase
      .from("bovinos")
      .select("id, arete, nombre, categoria, condicion")
      .order("arete", { ascending: true }),
  ])

  if (potrerosRes.error) {
    return { potreros: [], bovinos: [], error: potrerosRes.error.message }
  }
  if (bovinosRes.error) {
    return { potreros: [], bovinos: [], error: bovinosRes.error.message }
  }

  return {
    potreros: (potrerosRes.data ?? []).map((p) => ({
      id: Number(p.id),
      nombre: String(p.nombre ?? `Potrero #${p.id}`),
      estado: typeof p.estado === "string" ? p.estado : null,
      tipo_pasto: typeof p.tipo_pasto === "string" ? p.tipo_pasto : null,
      area_m2:
        p.area_m2 === null || p.area_m2 === undefined ? null : Number(p.area_m2),
    })),
    bovinos: (bovinosRes.data ?? []).map((b) => ({
      id: String(b.id),
      arete: String(b.arete ?? ""),
      nombre: typeof b.nombre === "string" ? b.nombre : null,
      categoria: typeof b.categoria === "string" ? b.categoria : null,
      condicion: typeof b.condicion === "string" ? b.condicion : null,
    })),
    error: null,
  }
}

export async function fetchOcupacionesActivasPotreroAction(): Promise<{
  items: HistorialOcupacionPotrero[]
  error: string | null
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      items: [],
      error: "Debes iniciar sesión para consultar animales en potreros.",
    }
  }

  const permisos = await getPermisosModulo(POTREROS_MODULE)
  if (!permisos.canView) {
    return {
      items: [],
      error: "No tienes permiso para ver el módulo de Potreros.",
    }
  }

  const { data, error } = await supabase
    .from("historial_ocupacion_potreros")
    .select("*")
    .is("fecha_salida", null)
    .order("fecha_entrada", { ascending: false })
    .order("id", { ascending: false })

  if (error) {
    console.error("[fetchOcupacionesActivasPotreroAction]", error.message)
    return { items: [], error: error.message }
  }

  const enriched = await enrichOcupacionRows(
    supabase,
    (data ?? []) as Record<string, unknown>[]
  )

  return { items: enriched, error: null }
}

export async function fetchOcupacionPotrerosPageAction(params: {
  pageIndex: number
  pageSize: number
  filters?: OcupacionPotreroFilterState
}): Promise<OcupacionPageResult> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      items: [],
      totalCount: 0,
      error: "Debes iniciar sesión para consultar la ocupación de potreros.",
    }
  }

  const permisos = await getPermisosModulo(POTREROS_MODULE)
  if (!permisos.canView) {
    return {
      items: [],
      totalCount: 0,
      error: "No tienes permiso para ver el módulo de Potreros.",
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
    .from("historial_ocupacion_potreros")
    .select("*", { count: "exact" })
    .order("fecha_entrada", { ascending: false })
    .order("id", { ascending: false })

  const f = params.filters
  if (f?.potrero_id && f.potrero_id !== "ALL") {
    const pid = Number(f.potrero_id)
    if (Number.isInteger(pid) && pid > 0) {
      query = query.eq("potrero_id", pid)
    }
  }

  if (f?.estado === "ACTIVA") {
    query = query.is("fecha_salida", null)
  } else if (f?.estado === "FINALIZADA") {
    query = query.not("fecha_salida", "is", null)
  }

  if (f?.fechaDesde?.trim()) {
    query = query.gte(
      "fecha_entrada",
      toBogotaTimestampWithoutTz(`${f.fechaDesde.trim()}T00:00:00`)
    )
  }

  if (f?.fechaHasta?.trim()) {
    query = query.lte(
      "fecha_entrada",
      toBogotaTimestampWithoutTz(`${f.fechaHasta.trim()}T23:59:59`)
    )
  }

  if (f?.search?.trim()) {
    const term = f.search.trim().toLowerCase()
    const [bovinosMatch, potrerosMatch] = await Promise.all([
      supabase
        .from("bovinos")
        .select("id")
        .or(`arete.ilike.%${term}%,nombre.ilike.%${term}%`),
      supabase.from("potreros").select("id").ilike("nombre", `%${term}%`),
    ])

    const matchedBovinoIds = (bovinosMatch.data ?? []).map((b) => String(b.id))
    const matchedPotreroIds = (potrerosMatch.data ?? []).map((p) => Number(p.id))

    const orParts: string[] = []
    if (matchedBovinoIds.length > 0) {
      orParts.push(`bovino_id.in.(${matchedBovinoIds.join(",")})`)
    }
    if (matchedPotreroIds.length > 0) {
      orParts.push(`potrero_id.in.(${matchedPotreroIds.join(",")})`)
    }
    const numericId = Number(term)
    if (Number.isInteger(numericId) && numericId > 0) {
      orParts.push(`id.eq.${numericId}`)
    }

    if (orParts.length === 0) {
      return { items: [], totalCount: 0, error: null }
    }

    query = query.or(orParts.join(","))
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return { items: [], totalCount: 0, error: error.message }
  }

  const enrichedItems = await enrichOcupacionRows(
    supabase,
    (data ?? []) as Record<string, unknown>[]
  )

  return {
    items: enrichedItems,
    totalCount: count ?? 0,
    error: null,
  }
}

export async function createOcupacionPotreroAction(
  values: OcupacionPotreroPayload
): Promise<{
  data: HistorialOcupacionPotrero | null
  createdCount?: number
  error: string | null
}> {
  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de ocupación inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(POTREROS_MODULE)
  if (!permisos.canCreate) {
    return {
      data: null,
      error: "No tienes permiso para registrar ocupación de potreros.",
    }
  }

  await ensureUserInPerfiles(supabase, user)

  const uniqueBovinoIds = Array.from(
    new Set(
      (parsed.data.bovino_ids && parsed.data.bovino_ids.length > 0
        ? parsed.data.bovino_ids
        : [parsed.data.bovino_id]
      )
        .map((id) => id.trim())
        .filter(Boolean)
    )
  )

  if (uniqueBovinoIds.length === 0) {
    return {
      data: null,
      error: "Selecciona al menos un bovino.",
    }
  }

  const entradaTs = toBogotaTimestampWithoutTz(parsed.data.fecha_entrada)
  const salidaTs = parsed.data.fecha_salida
    ? toBogotaTimestampWithoutTz(parsed.data.fecha_salida)
    : null

  const rowsToInsert = uniqueBovinoIds.map((bovinoId) => ({
    potrero_id: parsed.data.potrero_id,
    bovino_id: bovinoId,
    fecha_entrada: entradaTs,
    fecha_salida: salidaTs,
    aforo: parsed.data.aforo,
    registrado_por: user.id,
  }))

  const { data, error } = await supabase
    .from("historial_ocupacion_potreros")
    .insert(rowsToInsert)
    .select()

  if (error) {
    return { data: null, error: error.message }
  }

  await syncPotreroEstadoFromHistorial(supabase, parsed.data.potrero_id)

  const insertedRows = (data ?? []) as Record<string, unknown>[]
  const enriched = await enrichOcupacionRows(supabase, insertedRows)

  revalidatePath(POTREROS_PATH)
  return {
    data: enriched[0] ?? null,
    createdCount: enriched.length,
    error: null,
  }
}

export async function sacarTodosPotreroAction(
  values: SalidaPotreroLotePayload
): Promise<{
  ok: boolean
  updatedCount: number
  error: string | null
}> {
  const parsed = salidaLoteSchema.safeParse(values)
  if (!parsed.success) {
    return {
      ok: false,
      updatedCount: 0,
      error: parsed.error.issues[0]?.message ?? "Datos de salida inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      ok: false,
      updatedCount: 0,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(POTREROS_MODULE)
  if (!permisos.canEdit) {
    return {
      ok: false,
      updatedCount: 0,
      error: "No tienes permiso para registrar salida de potreros.",
    }
  }

  const salidaTs = toBogotaTimestampWithoutTz(parsed.data.fecha_salida)

  let query = supabase
    .from("historial_ocupacion_potreros")
    .update({ fecha_salida: salidaTs })
    .eq("potrero_id", parsed.data.potrero_id)
    .is("fecha_salida", null)

  if (parsed.data.ocupacion_ids && parsed.data.ocupacion_ids.length > 0) {
    query = query.in("id", parsed.data.ocupacion_ids)
  } else if (parsed.data.bovino_ids && parsed.data.bovino_ids.length > 0) {
    query = query.in("bovino_id", parsed.data.bovino_ids)
  }

  const { data, error } = await query.select("id")

  if (error) {
    console.error("[sacarTodosPotreroAction]", error.message)
    return { ok: false, updatedCount: 0, error: error.message }
  }

  await syncPotreroEstadoFromHistorial(supabase, parsed.data.potrero_id)

  revalidatePath(POTREROS_PATH)
  return {
    ok: true,
    updatedCount: data?.length ?? 0,
    error: null,
  }
}

export async function updateOcupacionPotreroAction(
  id: number,
  values: OcupacionPotreroPayload
): Promise<{ data: HistorialOcupacionPotrero | null; error: string | null }> {
  if (!Number.isInteger(id) || id <= 0) {
    return { data: null, error: "ID de ocupación no válido." }
  }

  const parsed = payloadSchema.safeParse(values)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos de ocupación inválidos",
    }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      data: null,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(POTREROS_MODULE)
  if (!permisos.canEdit) {
    return {
      data: null,
      error: "No tienes permiso para editar registros de ocupación.",
    }
  }

  const { data: prevRow } = await supabase
    .from("historial_ocupacion_potreros")
    .select("potrero_id")
    .eq("id", id)
    .maybeSingle()

  const entradaTs = toBogotaTimestampWithoutTz(parsed.data.fecha_entrada)
  const salidaTs = parsed.data.fecha_salida
    ? toBogotaTimestampWithoutTz(parsed.data.fecha_salida)
    : null

  const { data, error } = await supabase
    .from("historial_ocupacion_potreros")
    .update({
      potrero_id: parsed.data.potrero_id,
      bovino_id: parsed.data.bovino_id,
      fecha_entrada: entradaTs,
      fecha_salida: salidaTs,
      aforo: parsed.data.aforo,
    })
    .eq("id", id)
    .select()
    .single()

  if (error || !data) {
    return {
      data: null,
      error: error?.message ?? "No se pudo actualizar la ocupación.",
    }
  }

  const potreroAnteriorId = Number(prevRow?.potrero_id)
  if (
    Number.isInteger(potreroAnteriorId) &&
    potreroAnteriorId > 0 &&
    potreroAnteriorId !== parsed.data.potrero_id
  ) {
    await syncPotreroEstadoFromHistorial(supabase, potreroAnteriorId)
  }
  await syncPotreroEstadoFromHistorial(supabase, parsed.data.potrero_id)

  const [enriched] = await enrichOcupacionRows(supabase, [
    data as Record<string, unknown>,
  ])

  revalidatePath(POTREROS_PATH)
  return { data: enriched ?? null, error: null }
}

export async function deleteOcupacionPotreroAction(
  id: number
): Promise<{ ok: boolean; error: string | null }> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "ID de ocupación no válido." }
  }

  const { supabase, user } = await getAuthenticatedUser()
  if (!user) {
    return {
      ok: false,
      error: "Debes iniciar sesión para realizar esta acción.",
    }
  }

  const permisos = await getPermisosModulo(POTREROS_MODULE)
  if (!permisos.canDelete) {
    return {
      ok: false,
      error: "No tienes permiso para eliminar registros de ocupación.",
    }
  }

  const { data: existingRow } = await supabase
    .from("historial_ocupacion_potreros")
    .select("potrero_id")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase
    .from("historial_ocupacion_potreros")
    .delete()
    .eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  const potreroId = Number(existingRow?.potrero_id)
  if (Number.isInteger(potreroId) && potreroId > 0) {
    await syncPotreroEstadoFromHistorial(supabase, potreroId)
  }

  revalidatePath(POTREROS_PATH)
  return { ok: true, error: null }
}