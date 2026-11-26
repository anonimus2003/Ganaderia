"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"
import { createClient } from "@/lib/client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface MedicamentoRow {
  id: string
  bovino_id: string
  medicamento: string
  dosis: string
  via: string
  fecha_aplicacion: string
  veterinario: string
  motivo: string | null
  retiro_leche: number | null
  retiro_carne: number | null
}

interface BovinoInfoRow {
  id: string
  arete: string
  nombre: string | null
  genero: string
  condicion: string
}

interface FilaRetiroAnimal {
  id: string
  bovinoId: string
  arete: string
  nombre: string
  genero: string
  medicamento: string
  fechaAplicacion: string
  diasFaltanLeche: number
  diasFaltanCarne: number
  maxDiasFaltan: number
  estadoRetiro: "Leche y Carne" | "Solo Leche" | "Solo Carne"
}

function hoyBogotaISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()) // YYYY-MM-DD
}

function sumarDiasISO(fechaIso: string, dias: number): string {
  const [y, m, d] = fechaIso.slice(0, 10).split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + dias))
  return dt.toISOString().slice(0, 10)
}

function diasRestantesDesde(fechaAplicacionIso: string, diasRetiro: number, hoyIso: string): number {
  if (!fechaAplicacionIso || !Number.isFinite(diasRetiro) || diasRetiro <= 0) {
    return 0
  }
  const fechaFinStr = sumarDiasISO(fechaAplicacionIso, Math.round(diasRetiro))
  const finMs = new Date(`${fechaFinStr}T00:00:00Z`).getTime()
  const hoyMs = new Date(`${hoyIso}T00:00:00Z`).getTime()
  if (Number.isNaN(finMs) || Number.isNaN(hoyMs)) return 0
  return Math.max(0, Math.ceil((finMs - hoyMs) / (1000 * 60 * 60 * 24)))
}

async function fetchAllMedicamentos(
  supabase: ReturnType<typeof createClient>
): Promise<{ rows: MedicamentoRow[]; errorMsg: string | null }> {
  const pageSize = 1000
  let from = 0
  const all: MedicamentoRow[] = []

  while (true) {
    const { data, error } = await supabase
      .from("medicamentos")
      .select(
        "id, bovino_id, medicamento, dosis, via, fecha_aplicacion, veterinario, motivo, retiro_leche, retiro_carne"
      )
      .order("fecha_aplicacion", { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) {
      return { rows: all, errorMsg: error.message }
    }

    const batch = (data ?? []) as MedicamentoRow[]
    all.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return { rows: all, errorMsg: null }
}

export function DataTableRetiros() {
  const supabase = React.useMemo(() => createClient(), [])
  const [filasRetiro, setFilasRetiro] = React.useState<FilaRetiroAnimal[]>([])
  const [cargando, setCargando] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let activo = true

    async function cargarRetirosActivos() {
      setCargando(true)
      const hoyIso = hoyBogotaISO()

      const [resMed, resBovinos] = await Promise.all([
        fetchAllMedicamentos(supabase),
        supabase.from("bovinos").select("id, arete, nombre, genero, condicion"),
      ])

      if (!activo) return

      const err = resMed.errorMsg ?? resBovinos.error?.message ?? null
      if (err) {
        setErrorMsg(err)
        setFilasRetiro([])
        setCargando(false)
        return
      }

      const mapaBovinos = new Map<string, BovinoInfoRow>()
      for (const b of (resBovinos.data ?? []) as BovinoInfoRow[]) {
        mapaBovinos.set(b.id, b)
      }

      const activas: FilaRetiroAnimal[] = []

      for (const med of resMed.rows) {
        const retiroLeche = Number(med.retiro_leche ?? 0)
        const retiroCarne = Number(med.retiro_carne ?? 0)

        const diasFaltanLeche = diasRestantesDesde(
          med.fecha_aplicacion,
          retiroLeche,
          hoyIso
        )
        const diasFaltanCarne = diasRestantesDesde(
          med.fecha_aplicacion,
          retiroCarne,
          hoyIso
        )

        if (diasFaltanLeche <= 0 && diasFaltanCarne <= 0) {
          continue
        }

        const bovino = mapaBovinos.get(med.bovino_id)
        const estadoRetiro: FilaRetiroAnimal["estadoRetiro"] =
          diasFaltanLeche > 0 && diasFaltanCarne > 0
            ? "Leche y Carne"
            : diasFaltanLeche > 0
              ? "Solo Leche"
              : "Solo Carne"

        activas.push({
          id: med.id,
          bovinoId: med.bovino_id,
          arete: bovino?.arete ?? "Sin arete",
          nombre: bovino?.nombre?.trim() || "Sin nombre",
          genero: bovino?.genero ?? "-",
          medicamento: med.medicamento,
          fechaAplicacion: med.fecha_aplicacion?.slice(0, 10) ?? "",
          diasFaltanLeche,
          diasFaltanCarne,
          maxDiasFaltan: Math.max(diasFaltanLeche, diasFaltanCarne),
          estadoRetiro,
        })
      }

      activas.sort((a, b) => b.maxDiasFaltan - a.maxDiasFaltan)

      setFilasRetiro(activas)
      setErrorMsg(null)
      setCargando(false)
    }

    void cargarRetirosActivos()
    return () => {
      activo = false
    }
  }, [supabase])

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-destructive" />
              Retiro de Leche y Carne
            </CardTitle>
            <CardDescription>
              Animales que no pueden ordeñarse ni destinarse a consumo y cuántos días les faltan
            </CardDescription>
          </div>
          <Badge variant="outline" className="tabular-nums">
            {cargando ? "Cargando..." : `${filasRetiro.length} en retiro`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {cargando ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Consultando tratamientos y tiempos de retiro...
          </div>
        ) : errorMsg ? (
          <div className="flex h-[200px] items-center justify-center px-4 text-center text-sm text-destructive">
            {errorMsg}
          </div>
        ) : filasRetiro.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <span>No hay animales con retiro de leche o carne activo hoy.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Aplicación</TableHead>
                  <TableHead>Restricción</TableHead>
                  <TableHead className="text-right">Faltan Leche</TableHead>
                  <TableHead className="text-right">Faltan Carne</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filasRetiro.map((fila) => (
                  <TableRow key={fila.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>
                          {fila.arete} · {fila.nombre}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {fila.genero}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{fila.medicamento}</TableCell>
                    <TableCell className="tabular-nums">
                      {fila.fechaAplicacion}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          fila.estadoRetiro === "Leche y Carne"
                            ? "destructive"
                            : "secondary"
                        }
                        className="gap-1"
                      >
                        <AlertTriangle className="size-3" />
                        {fila.estadoRetiro}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {fila.diasFaltanLeche > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {fila.diasFaltanLeche}{" "}
                          {fila.diasFaltanLeche === 1 ? "día" : "días"}
                        </span>
                      ) : (
                        <span className="text-xs font-normal text-muted-foreground">
                          Libre
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {fila.diasFaltanCarne > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          {fila.diasFaltanCarne}{" "}
                          {fila.diasFaltanCarne === 1 ? "día" : "días"}
                        </span>
                      ) : (
                        <span className="text-xs font-normal text-muted-foreground">
                          Libre
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DataTableRetiros