import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import { DataTable } from "@/modulos/finanzas/ingresos/components/data-table"
import type { CajaRegistro } from "@/modulos/finanzas/ingresos/actions/actions"

async function IngresosContent() {
  const permisos = await getPermisosModulo("finanzas")

  if (!permisos.canView) {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  const { data: movimientos, count, error } = await supabase
    .from("caja")
    .select("*", { count: "exact" })
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(0, 9)

  const rows = (movimientos ?? []) as CajaRegistro[]

  const userIds = Array.from(
    new Set(
      rows
        .map((r) => r.registrado_por)
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

  const enrichedMovimientos: CajaRegistro[] = rows.map((item) => ({
    ...item,
    registrado_por_nombre: item.registrado_por
      ? perfilMap.get(item.registrado_por) ?? null
      : null,
  }))

  if (error) {
    return (
      <div className="px-4 text-sm text-destructive lg:px-6">
        Error al cargar los movimientos de caja: {error.message}
      </div>
    )
  }

  return (
    <DataTable
      data={enrichedMovimientos}
      totalCount={count ?? 0}
      permissions={permisos}
    />
  )
}

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <Suspense
        fallback={
          <div className="px-4 text-sm text-muted-foreground lg:px-6">
            Cargando movimientos...
          </div>
        }
      >
        <IngresosContent />
      </Suspense>
    </div>
  )
}