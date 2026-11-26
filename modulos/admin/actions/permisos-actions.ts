"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import type { ModuloSistema } from "@/lib/permisos"

export interface PermisoUpdateInput {
  user_id: string
  modulo: ModuloSistema
  puede_ver: boolean
  puede_crear: boolean
  puede_editar: boolean
  puede_eliminar: boolean
}

export async function guardarPermisoUsuarioAction(
  payload: PermisoUpdateInput
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sesión no válida" }
  }

  // Verificar que quien guarda sea administrador
  const isAdminMetadata = user.app_metadata?.role === "admin"
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (!isAdminMetadata && perfil?.rol !== "admin") {
    return { ok: false, error: "Solo el administrador puede modificar permisos." }
  }

  const { error } = await supabase.from("permisos_usuarios").upsert(
    {
      user_id: payload.user_id,
      modulo: payload.modulo,
      puede_ver: payload.puede_ver,
      puede_crear: payload.puede_crear,
      puede_editar: payload.puede_editar,
      puede_eliminar: payload.puede_eliminar,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,modulo" }
  )

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/dashboard/admin/permisos")
  return { ok: true, error: null }
}