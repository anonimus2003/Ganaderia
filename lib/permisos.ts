import { connection } from "next/server"
import { createClient } from "@/lib/server"

export type ModuloSistema =
  | "inventario"
  | "ordeno"
  | "potreros"
  | "medicamentos"
  | "reproduccion"
  | "finanzas"
  | "pesajes"
    

export interface PermisosModulo {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export async function getPermisosModulo(
  modulo: ModuloSistema
): Promise<PermisosModulo> {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { canView: false, canCreate: false, canEdit: false, canDelete: false }
  }

  if (user.app_metadata?.role === "admin") {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true }
  }

  const { data } = await supabase
    .from("permisos_usuarios")
    .select("puede_ver, puede_crear, puede_editar, puede_eliminar")
    .eq("user_id", user.id)
    .eq("modulo", modulo)
    .single()

  return {
    canView: data?.puede_ver ?? false,
    canCreate: data?.puede_crear ?? false,
    canEdit: data?.puede_editar ?? false,
    canDelete: data?.puede_eliminar ?? false,
  }
}