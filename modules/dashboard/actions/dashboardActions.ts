"use server"

import { createClient } from "@/lib/supabase/server"
import { DashboardData } from "../types/dashboard"

export async function getDashboardData(vacaId: string = "general"): Promise<DashboardData> {
  const supabase = await createClient()

  // Fecha actual en Bogotá
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" })

  // Fecha de hace 7 días para la gráfica diaria
  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)
  const fechaHace7Dias = hace7Dias.toISOString().split("T")[0]

  // Ejecución simultánea de 10 consultas en PostgreSQL
  const [
    ordeñoHoyRes,
    reproduccionesRes,
    totalBovinosRes,
    vacasOrdenoRes,
    bovinosListRes,
    graficaLecheMesesRes, // 6. Vista SQL Meses
    graficaLecheDiasRes,  // 7. Tabla ordeño últimos 7 días
    graficaPesajeRes,     // 8. Pesajes
    estadoHatoRes,        // 9. Categorías
    medicamentosRes,      // 10. Alertas Retiro
    potrerosRes           // 11. Potreros
  ] = await Promise.all([
    // 1. Litros de ordeño hoy
    vacaId === "general"
      ? supabase.from("ordeño").select("litros").eq("fecha", hoy)
      : supabase.from("ordeño").select("litros").eq("fecha", hoy).eq("bovino_id", vacaId),

    // 2. Días en Lactancia (DEL)
    vacaId === "general"
      ? supabase.from("reproducciones").select("fecha_parto").not("fecha_parto", "is", null).is("fecha_secado", null)
      : supabase.from("reproducciones").select("fecha_parto").eq("bovino_id", vacaId).not("fecha_parto", "is", null).is("fecha_secado", null).order("fecha_parto", { ascending: false }).limit(1),

    // 3. Total de animales activos
    supabase.from("bovinos").select("id", { count: "exact", head: true }).eq("condicion", "Activo"),

    // 4. Vacas únicas en ordeño hoy
    supabase.from("ordeño").select("bovino_id").eq("fecha", hoy),

    // 5. Lista general para el selector de bovinos
    supabase.from("bovinos").select("id, arete, nombre").eq("condicion", "Activo").order("arete", { ascending: true }),

    // 6. HISTÓRICO MENSUAL (Vista SQL)
    vacaId === "general"
      ? supabase.from("v_produccion_mensual_total").select("mes_key, mes_nombre, total_litros")
      : supabase.from("v_produccion_mensual_total").select("mes_key, mes_nombre, total_litros").eq("bovino_id", vacaId),

    // 7. ÚLTIMOS 7 DÍAS DIARIOS
    vacaId === "general"
      ? supabase.from("ordeño").select("fecha, litros").gte("fecha", fechaHace7Dias).order("fecha", { ascending: true })
      : supabase.from("ordeño").select("fecha, litros").eq("bovino_id", vacaId).gte("fecha", fechaHace7Dias).order("fecha", { ascending: true }),

    // 8. Pesajes
    vacaId === "general"
      ? supabase.from("pesajes").select("fecha, peso_kgs").order("fecha", { ascending: false })
      : supabase.from("pesajes").select("fecha, peso_kgs").eq("bovino_id", vacaId).order("fecha", { ascending: false }),

    // 9. Estado Hato
    supabase.from("bovinos").select("categoria").eq("condicion", "Activo"),

    // 10. Alertas Medicamentos / Retiro Farmacológico
    supabase.from("medicamentos").select(`
      id,
      medicamento,
      fecha_aplicacion,
      retiro_leche,
      retiro_carne,
      bovinos ( arete, nombre )
    `),

    // 11. Rendimiento por Potrero
    supabase.from("v_produccion_por_potrero").select("potrero_id, potrero_nombre, total_litros").order("total_litros", { ascending: false })
  ])

  // --- CÁLCULOS Y PROCESAMIENTO ---

  // Metricas
  const produccionHoy = ordeñoHoyRes.data?.reduce((acc, row) => acc + Number(row.litros || 0), 0) || 0

  let diasLactancia = 0
  const ahora = new Date()
  ahora.setHours(0, 0, 0, 0) // Normalizar medianoche para comparaciones exactas

  if (reproduccionesRes.data && reproduccionesRes.data.length > 0) {
    const totalDias = reproduccionesRes.data.reduce((acc, row) => {
      if (!row.fecha_parto) return acc
      const fParto = new Date(row.fecha_parto)
      const diffMs = ahora.getTime() - fParto.getTime()
      return acc + Math.floor(diffMs / (1000 * 60 * 60 * 24))
    }, 0)
    diasLactancia = Math.round(totalDias / reproduccionesRes.data.length)
  }

  const vacasOrdenoUnicas = new Set(vacasOrdenoRes.data?.map((item) => item.bovino_id)).size

  // A) Procesar Vista Mensual
  const litrosPorMes: Record<string, { nombre: string; litros: number }> = {}
  ;(graficaLecheMesesRes.data || []).forEach((row: any) => {
    if (!row.mes_key) return
    if (!litrosPorMes[row.mes_key]) {
      litrosPorMes[row.mes_key] = { nombre: row.mes_nombre, litros: 0 }
    }
    litrosPorMes[row.mes_key].litros += Number(row.total_litros || 0)
  })

  const graficaLecheMeses = Object.keys(litrosPorMes)
    .sort()
    .map((key) => ({
      mesKey: key,
      fecha: litrosPorMes[key].nombre,
      litros: Number(litrosPorMes[key].litros.toFixed(1))
    }))

  // B) Procesar Vista Diaria (Últimos 7 días)
  const litrosPorFecha: Record<string, number> = {}
  ;(graficaLecheDiasRes.data || []).forEach((row: any) => {
    if (!row.fecha) return
    litrosPorFecha[row.fecha] = (litrosPorFecha[row.fecha] || 0) + Number(row.litros || 0)
  })

  const graficaLecheDias = Object.keys(litrosPorFecha)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((fecha) => ({
      fecha,
      litros: Number(litrosPorFecha[fecha].toFixed(1))
    }))

  // C) PROCESAMIENTO DE RETIROS FARMACOLÓGICOS
  const retiros: any[] = []
  medicamentosRes.data?.forEach((m: any) => {
    if (!m.fecha_aplicacion) return
    
    // Parsear fecha de aplicación asegurando medianoche local
    const [year, month, day] = m.fecha_aplicacion.split("T")[0].split("-")
    const fAplicacion = new Date(Number(year), Number(month) - 1, Number(day))

    // Retiro Leche
    if (m.retiro_leche && Number(m.retiro_leche) > 0) {
      const fFinLeche = new Date(fAplicacion)
      fFinLeche.setDate(fFinLeche.getDate() + Number(m.retiro_leche))
      
      const diffMs = fFinLeche.getTime() - ahora.getTime()
      const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

      if (diasRestantes > 0) {
        retiros.push({
          id: `${m.id}-leche`,
          codigoAnimal: m.bovinos?.arete || m.bovinos?.nombre || "S/A",
          medicamento: m.medicamento,
          tipo: "Leche",
          diasRestantes
        })
      }
    }

    // Retiro Carne
    if (m.retiro_carne && Number(m.retiro_carne) > 0) {
      const fFinCarne = new Date(fAplicacion)
      fFinCarne.setDate(fFinCarne.getDate() + Number(m.retiro_carne))

      const diffMs = fFinCarne.getTime() - ahora.getTime()
      const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

      if (diasRestantes > 0) {
        retiros.push({
          id: `${m.id}-carne`,
          codigoAnimal: m.bovinos?.arete || m.bovinos?.nombre || "S/A",
          nombreAnimal: m.bovinos?.nombre || undefined,
          medicamento: m.medicamento,
          tipo: "Carne",
          diasRestantes
        })
      }
    }
  })

  // D) Categorías de Bovinos
  const categoriaConteo: Record<string, number> = {}
  estadoHatoRes.data?.forEach((b: any) => {
    const cat = b.categoria?.trim() || "Sin categoría"
    categoriaConteo[cat] = (categoriaConteo[cat] || 0) + 1
  })

  const graficaEstado = Object.keys(categoriaConteo).map((nombreCategoria) => ({
    estado: nombreCategoria,
    cantidad: categoriaConteo[nombreCategoria]
  }))

  // E) Potreros
  const graficaPotreros = (potrerosRes.data || []).map((row: any) => ({
    potrero: row.potrero_nombre || `Potrero ${row.potrero_id}`,
    litros: Number(row.total_litros || 0),
  }))

  return {
    metricas: {
      produccionHoy: Number(produccionHoy.toFixed(1)),
      diasLactancia,
      totalAnimales: totalBovinosRes.count || 0,
      vacasOrdeno: vacasOrdenoUnicas
    },
    bovinos: bovinosListRes.data || [],
    graficaLeche: {
      dias: graficaLecheDias,
      meses: graficaLecheMeses
    },
    graficaPesaje: (graficaPesajeRes.data || []).map((row: any) => ({ fecha: row.fecha, peso: Number(row.peso_kgs || 0) })),
    graficaEstado,
    graficaPotreros,
    alertasRetiro: retiros
  }
}