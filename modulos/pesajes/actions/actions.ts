"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import type {
  PesajeFilterState,
  PesajePayload,
} from "@/modulos/pesajes/components/pesajes-drawer"

export interface BovinoOpcionPesaje {
  id: string
  arete: string | null
  nombre: string | null
}

export interface PesajeRegistro {
  id: string
  fecha: string
  peso_kgs: number
  condicion_corporal: number | null
  estado_fisiologico: string | null
  observaciones: string | null
  registrado_por: string | null
  created_at: string
  bovino_id: string | null
  metodo_pesaje: string | null
  ganancia_diaria_kg: number | null
  responsable: string | null
  // Campos enriquecidos desde relaciones
  bovino_label?: string | null
  registrado_por_nombre?: string | null
}

function formatBovinoLabel(bovino: {
  id: string
  arete?: string | null
  nombre?: string | null
}): string {
  const arete = bovino.arete?.trim() || bovino.id
  const nombre = bovino.nombre?.trim()
  return nombre ? `${arete} — ${nombre}` : arete
}

async function enrichPesajes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: PesajeRegistro[]
): Promise<PesajeRegistro[]> {
  const bovinoIds = Array.from(
    new Set(
      rows
        .map((r) => r.bovino_id)
        .filter((id): id is string => Boolean(id && id.trim()))
    )
  )

  const userIds = Array.from(
    new Set(
      rows
        .map((r) => r.registrado_por)
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

  return rows.map((item) => ({
    ...item,
    peso_kgs: Number(item.peso_kgs),
    condicion_corporal:
      item.condicion_corporal !== null && item.condicion_corporal !== undefined
        ? Number(item.condicion_corporal)
        : null,
    ganancia_diaria_kg:
      item.ganancia_diaria_kg !== null && item.ganancia_diaria_kg !== undefined
        ? Number(item.ganancia_diaria_kg)
        : null,
    bovino_label: item.bovino_id
      ? bovinoMap.get(item.bovino_id) ?? item.bovino_id
      : null,
    registrado_por_nombre: item.registrado_por
      ? perfilMap.get(item.registrado_por) ?? null
      : null,
  }))
}

export async function fetchPesajesPageAction({
  pageIndex = 0,
  pageSize = 10,
  filters,
}: {
  pageIndex?: number
  pageSize?: number
  filters?: PesajeFilterState
}): Promise<{
  items: PesajeRegistro[]
  totalCount: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const from = pageIndex * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from("pesajes")
      .select("*", { count: "exact" })
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })

    if (filters?.bovinoId && filters.bovinoId !== "ALL") {
      query = query.eq("bovino_id", filters.bovinoId)
    }

    if (filters?.metodoPesaje && filters.metodoPesaje !== "ALL") {
      query = query.eq("metodo_pesaje", filters.metodoPesaje)
    }

    if (filters?.estadoFisiologico && filters.estadoFisiologico !== "ALL") {
      query = query.eq("estado_fisiologico", filters.estadoFisiologico)
    }

    if (filters?.fechaDesde?.trim()) {
      query = query.gte("fecha", filters.fechaDesde.trim())
    }

    if (filters?.fechaHasta?.trim()) {
      query = query.lte("fecha", filters.fechaHasta.trim())
    }

    if (filters?.search?.trim()) {
      const term = filters.search.trim()
      const { data: bovinosMatch } = await supabase
        .from("bovinos")
        .select("id")
        .or(`arete.ilike.%${term}%,nombre.ilike.%${term}%`)
        .limit(50)

      const matchingIds = (bovinosMatch ?? []).map((b) => b.id)

      if (matchingIds.length > 0) {
        query = query.or(
          `bovino_id.in.(${matchingIds.join(",")}),responsable.ilike.%${term}%,observaciones.ilike.%${term}%,metodo_pesaje.ilike.%${term}%,estado_fisiologico.ilike.%${term}%`
        )
      } else {
        query = query.or(
          `responsable.ilike.%${term}%,observaciones.ilike.%${term}%,metodo_pesaje.ilike.%${term}%,estado_fisiologico.ilike.%${term}%`
        )
      }
    }

    const { data, count, error } = await query.range(from, to)

    if (error) {
      return {
        items: [],
        totalCount: 0,
        error: `Error al cargar pesajes: ${error.message}`,
      }
    }

    const items = await enrichPesajes(
      supabase,
      (data ?? []) as PesajeRegistro[]
    )

    return {
      items,
      totalCount: count ?? 0,
    }
  } catch (err) {
    return {
      items: [],
      totalCount: 0,
      error:
        err instanceof Error
          ? err.message
          : "Error inesperado al consultar los pesajes",
    }
  }
}

export async function fetchPesajesCatalogoBovinosAction(): Promise<{
  items: BovinoOpcionPesaje[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("bovinos")
      .select("id, arete, nombre")
      .order("arete", { ascending: true })

    if (error) {
      return {
        items: [],
        error: `Error al cargar catálogo de bovinos: ${error.message}`,
      }
    }

    return {
      items: (data ?? []) as BovinoOpcionPesaje[],
    }
  } catch (err) {
    return {
      items: [],
      error:
        err instanceof Error
          ? err.message
          : "Error inesperado al cargar los bovinos",
    }
  }
}

export async function createPesajeAction(payload: PesajePayload): Promise<{
  data?: PesajeRegistro
  error?: string
}> {
  try {
    const permisos = await getPermisosModulo("pesajes")
    if (permisos && !permisos.canCreate) {
      return { error: "No tienes permiso para registrar pesajes." }
    }

    if (
      payload.condicion_corporal !== null &&
      payload.condicion_corporal !== undefined &&
      (payload.condicion_corporal < 1 || payload.condicion_corporal > 5)
    ) {
      return { error: "La condición corporal debe estar entre 1.00 y 5.00." }
    }

    const supabase = await createClient()

    const insertData = {
      bovino_id: payload.bovino_id || null,
      fecha: payload.fecha,
      peso_kgs: Number(payload.peso_kgs),
      condicion_corporal:
        payload.condicion_corporal !== null &&
        payload.condicion_corporal !== undefined &&
        !Number.isNaN(Number(payload.condicion_corporal))
          ? Number(payload.condicion_corporal)
          : null,
      estado_fisiologico: payload.estado_fisiologico?.trim() || null,
      metodo_pesaje: payload.metodo_pesaje?.trim() || null,
      responsable: payload.responsable?.trim() || null,
      observaciones: payload.observaciones?.trim() || null,
    }

    const { data, error } = await supabase
      .from("pesajes")
      .insert(insertData)
      .select("*")
      .single()

    if (error || !data) {
      return {
        error: error?.message ?? "No se pudo crear el registro de pesaje.",
      }
    }

    const [enriched] = await enrichPesajes(supabase, [data as PesajeRegistro])
    revalidatePath("/pesajes")

    return { data: enriched }
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Error inesperado al registrar el pesaje.",
    }
  }
}

export async function updatePesajeAction(
  id: string,
  payload: PesajePayload
): Promise<{
  data?: PesajeRegistro
  error?: string
}> {
  try {
    const permisos = await getPermisosModulo("pesajes")
    if (permisos && !permisos.canEdit) {
      return { error: "No tienes permiso para editar pesajes." }
    }

    if (
      payload.condicion_corporal !== null &&
      payload.condicion_corporal !== undefined &&
      (payload.condicion_corporal < 1 || payload.condicion_corporal > 5)
    ) {
      return { error: "La condición corporal debe estar entre 1.00 y 5.00." }
    }

    const supabase = await createClient()

    const updateData = {
      bovino_id: payload.bovino_id || null,
      fecha: payload.fecha,
      peso_kgs: Number(payload.peso_kgs),
      condicion_corporal:
        payload.condicion_corporal !== null &&
        payload.condicion_corporal !== undefined &&
        !Number.isNaN(Number(payload.condicion_corporal))
          ? Number(payload.condicion_corporal)
          : null,
      estado_fisiologico: payload.estado_fisiologico?.trim() || null,
      metodo_pesaje: payload.metodo_pesaje?.trim() || null,
      responsable: payload.responsable?.trim() || null,
      observaciones: payload.observaciones?.trim() || null,
    }

    const { data, error } = await supabase
      .from("pesajes")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single()

    if (error || !data) {
      return {
        error: error?.message ?? "No se pudo actualizar el registro de pesaje.",
      }
    }

    const [enriched] = await enrichPesajes(supabase, [data as PesajeRegistro])
    revalidatePath("/pesajes")

    return { data: enriched }
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Error inesperado al actualizar el pesaje.",
    }
  }
}

export async function deletePesajeAction(id: string): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const permisos = await getPermisosModulo("pesajes")
    if (permisos && !permisos.canDelete) {
      return { ok: false, error: "No tienes permiso para eliminar pesajes." }
    }

    const supabase = await createClient()

    const { error } = await supabase.from("pesajes").delete().eq("id", id)

    if (error) {
      return {
        ok: false,
        error: `No se pudo eliminar el pesaje: ${error.message}`,
      }
    }

    revalidatePath("/pesajes")

    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Error inesperado al eliminar el pesaje.",
    }
  }
}