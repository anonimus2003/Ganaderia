import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { createClient } from "@/lib/server"
import {
  PermisosMatrix,
  type PermisoRow,
  type UsuarioOption,
} from "@/modulos/admin/components/PermisosMatrix"

async function PermisosAdminContent() {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Verificar si es admin
  const isAdminMetadata = user.app_metadata?.role === "admin"
  const { data: miPerfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (!isAdminMetadata && miPerfil?.rol !== "admin") {
    redirect("/dashboard")
  }

  // Cargar usuarios y permisos actuales
  const [{ data: perfiles }, { data: permisos }] = await Promise.all([
    supabase.from("perfiles").select("id, nombre, email, rol").order("nombre"),
    supabase
      .from("permisos_usuarios")
      .select("user_id, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar"),
  ])

  const usuarios: UsuarioOption[] = (perfiles ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre ?? "Sin nombre",
    email: p.email ?? "",
    rol: p.rol ?? null,
  }))

  return (
    <PermisosMatrix
      usuarios={usuarios}
      permisosIniciales={(permisos ?? []) as PermisoRow[]}
    />
  )
}

export default function PermisosAdminPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-lg font-semibold">Permisos por módulo</h1>
        <p className="text-sm text-muted-foreground">
          Configura qué puede ver, crear, editar o eliminar cada usuario en AGRONOVA.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">
            Cargando permisos...
          </div>
        }
      >
        <PermisosAdminContent />
      </Suspense>
    </div>
  )
}