import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import { DataTable } from "@/modulos/inventario/components/data-table"
import type { Bovino } from "@/modulos/inventario/components/animal-drawer"

async function InventarioContent() {
  const permisos = await getPermisosModulo("inventario")

  if (!permisos.canView) {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  const { data: bovinos, count, error } = await supabase
    .from("bovinos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, 9)

  if (error) {
    return (
      <div className="px-4 text-sm text-destructive lg:px-6">
        Error al cargar los bovinos: {error.message}
      </div>
    )
  }

  return (
    <DataTable
      data={(bovinos ?? []) as Bovino[]}
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
            Cargando inventario...
          </div>
        }
      >
        <InventarioContent />
      </Suspense>
    </div>
  )
}