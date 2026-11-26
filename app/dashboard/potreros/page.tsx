import { Suspense } from "react"
import { connection } from "next/server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { getPermisosModulo } from "@/lib/permisos"
import { PotrerosMapClient } from "@/modulos/potreros/components/PotrerosMap"
import { PotrerosOcupacionView } from "@/modulos/potreros/components/potreros-ocupacion-drawer"
import type { HistorialOcupacionPotrero } from "@/modulos/potreros/components/data-table"
import type {
  BovinoOption,
  PotreroOption,
} from "@/modulos/potreros/components/potreros-ocupacion-drawer"

async function PotrerosContent() {
  await connection()

  const permisos = await getPermisosModulo("potreros")

  if (!permisos.canView) {
    redirect("/dashboard")
  }

  const supabase = await createClient()

  const [
    { data: historialData, count, error },
    { data: potrerosRows },
    { data: bovinosRows },
  ] = await Promise.all([
    supabase
      .from("historial_ocupacion_potreros")
      .select("*", { count: "exact" })
      .order("fecha_entrada", { ascending: false })
      .order("id", { ascending: false })
      .range(0, 9),
    supabase
      .from("potreros")
      .select("id, nombre, capacidad")
      .order("nombre", { ascending: true }),
    supabase
      .from("bovinos")
      .select("id, arete, nombre, categoria, condicion")
      .order("arete", { ascending: true }),
  ])

  const rows = (historialData ?? []) as HistorialOcupacionPotrero[]

  const potreros: PotreroOption[] = (potrerosRows ?? []).map((p) => ({
    id: Number(p.id),
    nombre: String(p.nombre || `Potrero #${p.id}`),
    capacidad:
      p.capacidad === null || p.capacidad === undefined
        ? null
        : Number(p.capacidad),
  }))

  const potreroMap = new Map<number, string>(
    potreros.map((p) => [p.id, p.nombre])
  )

  const bovinoMap = new Map<
    string,
    { arete: string; nombre: string | null; label: string }
  >()
  const bovinos: BovinoOption[] = []

  for (const b of bovinosRows ?? []) {
    const rec = b as Record<string, unknown>
    const id = String(rec.id ?? "")
    if (!id) continue

    const arete =
      (typeof rec.arete === "string" && rec.arete.trim()) ||
      (typeof rec.codigo === "string" && rec.codigo.trim()) ||
      (typeof rec.chapeta === "string" && rec.chapeta.trim()) ||
      id.slice(0, 8)

    const nombre =
      (typeof rec.nombre === "string" && rec.nombre.trim()) ||
      (typeof rec.identificacion === "string" && rec.identificacion.trim()) ||
      null

    const categoria =
      typeof rec.categoria === "string" && rec.categoria.trim()
        ? rec.categoria.trim()
        : null

    const condicion =
      typeof rec.condicion === "string" && rec.condicion.trim()
        ? rec.condicion.trim()
        : null

    const label = nombre ? `${arete} — ${nombre}` : arete

    bovinoMap.set(id, { arete, nombre, label })
    bovinos.push({
      id,
      arete,
      nombre,
      categoria,
      condicion,
    })
  }

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

  const enrichedItems: HistorialOcupacionPotrero[] = rows.map((item) => {
    const bovinoInfo = bovinoMap.get(item.bovino_id)
    return {
      ...item,
      potrero_nombre: potreroMap.get(item.potrero_id) ?? null,
      bovino_label: bovinoInfo?.label ?? null,
      registrado_por_nombre: item.registrado_por
        ? perfilMap.get(item.registrado_por) ?? null
        : null,
    }
  })

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Error al cargar el historial de ocupación: {error.message}
      </div>
    )
  }

  return (
    <PotrerosOcupacionView
      initialData={enrichedItems}
      initialTotalCount={count ?? 0}
      permissions={permisos}
      potreros={potreros}
      bovinos={bovinos}
      mapSlot={<PotrerosMapClient />}
    />
  )
}

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 px-4 md:gap-6 md:px-6">
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">
            Cargando potreros...
          </div>
        }
      >
        <PotrerosContent />
      </Suspense>
    </div>
  )
}