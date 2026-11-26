import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import { DataTable } from "@/modulos/medicamentos/components/data-table"
import type { MedicamentoRegistro } from "@/modulos/medicamentos/actions/actions"

function formatBovinoLabel(bovino: {
  id: string
  arete?: string | null
  nombre?: string | null
}): string {
  const arete = bovino.arete?.trim() || bovino.id
  const nombre = bovino.nombre?.trim()
  return nombre ? `${arete} — ${nombre}` : arete
}

async function MedicamentosContent() {
  const permisos = await getPermisosModulo("medicamentos")

  if (!permisos.canView) {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  const { data: medicamentos, count, error } = await supabase
    .from("medicamentos")
    .select("*", { count: "exact" })
    .order("fecha_aplicacion", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, 9)

  const rows = (medicamentos ?? []) as MedicamentoRegistro[]

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

  const enrichedMedicamentos: MedicamentoRegistro[] = rows.map((item) => ({
    ...item,
    bovino_label: item.bovino_id
      ? bovinoMap.get(item.bovino_id) ?? item.bovino_id
      : null,
    registrado_por_nombre: item.registrado_por
      ? perfilMap.get(item.registrado_por) ?? null
      : null,
  }))

  if (error) {
    return (
      <div className="px-4 text-sm text-destructive lg:px-6">
        Error al cargar los registros de medicamentos: {error.message}
      </div>
    )
  }

  return (
    <DataTable
      data={enrichedMedicamentos}
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
            Cargando medicamentos...
          </div>
        }
      >
        <MedicamentosContent />
      </Suspense>
    </div>
  )
}