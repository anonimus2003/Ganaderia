// modules/dashboard/actions/actions.dashboard.ts
"use server"

import { createClient } from "@/lib/supabase/server"

export async function obtenerTotalAnimalesActivos(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("bovinos")
    .select("*", { count: "exact", head: true })
    .eq("condicion", "Activo")

  if (error) {
    console.error("Error al contar bovinos:", error.message)
    return 0
  }

  return count ?? 0
}

export async function obtenerVacasEnOrdenoHoy(): Promise<number> {
  const supabase = await createClient()

  const hoy = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("ordeño")
    .select("bovino_id")
    .eq("fecha", hoy)

  if (error) {
    console.error("Error al obtener vacas en ordeño hoy:", error.message)
    return 0
  }

  if (!data || data.length === 0) {
    return 0
  }

  const vacasUnicasHoy = new Set(data.map((item) => item.bovino_id))

  return vacasUnicasHoy.size
}

export async function obtenerDiasLactancia(vacaSeleccionada?: string): Promise<number> {
  const supabase = await createClient()

  let query = supabase
    .from("reproducciones")
    .select("bovino_id, fecha_parto")
    .not("fecha_parto", "is", null)
    .order("fecha_parto", { ascending: false })

  if (vacaSeleccionada && vacaSeleccionada !== "general") {
    query = query.eq("bovino_id", vacaSeleccionada)
  }

  const { data, error } = await query

  if (error || !data || data.length === 0) {
    console.error("Error al obtener días de lactancia:", error?.message)
    return 0
  }

  const hoy = new Date().getTime()
  
  if (vacaSeleccionada && vacaSeleccionada !== "general") {
    const ultimoParto = new Date(data[0].fecha_parto).getTime()
    const diferenciaMs = hoy - ultimoParto
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))
    return dias >= 0 ? dias : 0
  }

  const vacasProcesadas = new Set<string>()
  let totalDias = 0
  let contador = 0

  for (const item of data) {
    if (!vacasProcesadas.has(item.bovino_id)) {
      vacasProcesadas.add(item.bovino_id)
      const fechaParto = new Date(item.fecha_parto).getTime()
      const diferenciaMs = hoy - fechaParto
      const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))
      
      if (dias >= 0) {
        totalDias += dias
        contador++
      }
    }
  }

  if (contador === 0) return 0
  return Math.round(totalDias / contador)
}

export async function obtenerProduccionTotalHoy(vacaSeleccionada?: string): Promise<number> {
  const supabase = await createClient()

  const hoy = new Date().toISOString().split("T")[0]

  let query = supabase
    .from("ordeño")
    .select("litros")
    .eq("fecha", hoy)

  if (vacaSeleccionada && vacaSeleccionada !== "general") {
    query = query.eq("bovino_id", vacaSeleccionada)
  }

  const { data, error } = await query

  if (error || !data || data.length === 0) {
    if (error) console.error("Error al obtener producción de hoy:", error.message)
    return 0
  }

  const totalLitros = data.reduce((acc, item) => acc + Number(item.litros || 0), 0)

  return Number(totalLitros.toFixed(2))
}

export interface BovinoOption {
  id: string
  arete: string
  nombre: string
}

export async function obtenerListaBovinos(): Promise<BovinoOption[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
  
    .from("bovinos")
    .select("id, arete, nombre") // 👈 Asegúrate de incluir 'id' aquí
    // .eq("condicion", "Activo")

  if (error || !data) {
    console.error("Error al obtener la lista de bovinos:", error?.message)
    return []
  }

  return data.map((bovino) => ({
    id: bovino.id, // 👈 Y retornarlo para que el Select use el UUID
    arete: bovino.arete || "S/N",
    nombre: bovino.nombre || "Sin nombre",
  }))
}

// modules/dashboard/actions/actions.dashboard.ts

export interface PuntoProduccion {
  fecha: string
  litros: number
}

export async function obtenerDatosGraficaLeche(
  vacaSeleccionada?: string, 
  escala: "dia" | "mes" | "anio" = "dia"
): Promise<PuntoProduccion[]> {
  const supabase = await createClient()

  let query = supabase
    .from("ordeño")
    .select("fecha, litros")

  if (vacaSeleccionada && vacaSeleccionada !== "general") {
    query = query.eq("bovino_id", vacaSeleccionada)
  }

  // 1. Si es por día, ordenamos DESCENDENTE para obtener los más cercanos a la fecha actual primero, y limitamos a 30
  if (escala === "dia") {
    query = query.order("fecha", { ascending: false }).limit(30)
  } else {
    // Si es por mes o año, traemos todo el historial ordenado ascendente para agruparlo completo
    query = query.order("fecha", { ascending: true })
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  const agrupadoPorFecha: { [key: string]: number } = {}
  
  data.forEach((item) => {
    let claveFecha = item.fecha

    if (escala === "mes") {
      claveFecha = item.fecha.substring(0, 7)
    } else if (escala === "anio") {
      claveFecha = item.fecha.substring(0, 4)
    }

    const litros = Number(item.litros || 0)
    agrupadoPorFecha[claveFecha] = (agrupadoPorFecha[claveFecha] || 0) + litros
  })

  let resultado = Object.keys(agrupadoPorFecha).map((fecha) => ({
    fecha,
    litros: Number(agrupadoPorFecha[fecha].toFixed(2)),
  }))

  // 2. Si pedimos por día, los trajimos al revés (del más nuevo al más viejo) para aplicar el .limit(30). 
  // Ahora los volvemos a ordenar de forma cronológica ascendente para que la gráfica avance correctamente hacia la derecha.
  if (escala === "dia") {
    resultado.sort((a, b) => a.fecha.localeCompare(b.fecha))
  }

  return resultado
}


export interface PuntoPesaje {
  periodo: string
  peso: number
}

export async function obtenerDatosGraficaPesaje(
  vacaSeleccionada?: string,
  escala: "dias" | "meses" | "anios" = "meses"
): Promise<PuntoPesaje[]> {
  const supabase = await createClient()

  let query = supabase
    .from("pesajes")
    .select("fecha, peso_kgs")

  if (vacaSeleccionada && vacaSeleccionada !== "general") {
    query = query.eq("bovino_id", vacaSeleccionada)
  }

  // Si es por días, traemos los más recientes primero limitando a 7 u 8 registros, 
  // de lo contrario traemos todo el historial cronológico para agrupar por mes/año.
  if (escala === "dias") {
    query = query.order("fecha", { ascending: false }).limit(7)
  } else {
    query = query.order("fecha", { ascending: true })
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  // Diccionarios o acumuladores para promediar o sacar el último peso registrado por período
  const acumulador: { [key: string]: { suma: number; count: number } } = {}

  data.forEach((item) => {
    let clavePeriodo = item.fecha // Por defecto 'YYYY-MM-DD'

    if (escala === "meses") {
      // Extraemos año y mes 'YYYY-MM'
      clavePeriodo = item.fecha.substring(0, 7)
    } else if (escala === "anios") {
      // Extraemos solo el año 'YYYY'
      clavePeriodo = item.fecha.substring(0, 4)
    } else if (escala === "dias") {
      // Para días, formateamos el nombre corto del día o dejamos la fecha formateada
      // Aquí puedes mapear la fecha a un formato amigable si deseas, ej: "Lun", "Mar" o dejar la fecha
      const fechaObj = new Date(item.fecha + "T00:00:00")
      clavePeriodo = !isNaN(fechaObj.getTime())
        ? fechaObj.toLocaleDateString("es-CO", { weekday: "short" })
        : item.fecha
    }

    const peso = Number(item.peso_kgs || 0)

    if (!acumulador[clavePeriodo]) {
      acumulador[clavePeriodo] = { suma: 0, count: 0 }
    }
    acumulador[clavePeriodo].suma += peso
    acumulador[clavePeriodo].count += 1
  })

  // Transformamos el acumulador en el array final calculando el promedio de peso por período
  let resultado = Object.entries(acumulador).map(([periodo, val]) => ({
    periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1), // Capitaliza ej: "lun" -> "Lun"
    peso: Number((val.suma / val.count).toFixed(1)),
  }))

  // Ordenamos cronológicamente
  if (escala === "dias") {
    resultado.reverse() // Como trajimos descendente para el limit, lo invertimos
  } else {
    resultado.sort((a, b) => a.periodo.localeCompare(b.periodo))
  }

  return resultado
}




export interface RetiroAnimal {
  id: string
  codigoAnimal: string
  medicamento: string
  diasRestantes: number
  tipo: "Leche" | "Carne" | "Ambos"
}

export async function obtenerAlertasRetiros(): Promise<RetiroAnimal[]> {
  const supabase = await createClient()

  // Consultamos trayendo todos los campos de bovinos (*) para evitar errores de columnas anidadas
  const { data, error } = await supabase
    .from("medicamentos")
    .select(`
      id,
      medicamento,
      retiro_leche,
      retiro_carne,
      fecha_aplicacion,
      bovinos (*)
    `)

  if (error) {
    console.error("❌ ERROR SUPABASE:", error.message, error.details)
    return []
  }

  if (!data || data.length === 0) {
    console.log("⚠️ La tabla medicamentos devolvió 0 registros.")
    return []
  }

  // Fecha actual en hora de Colombia (12 de septiembre de 2026)
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  
  const fechaHoyColombiaStr = formatter.format(new Date())
  const [anioH, mesH, diaH] = fechaHoyColombiaStr.split("-").map(Number)
  const hoy = new Date(anioH, mesH - 1, diaH)
  hoy.setHours(0, 0, 0, 0)

  const retirosCalculados: RetiroAnimal[] = []

  data.forEach((item) => {
    if (!item.fecha_aplicacion) return

    const soloFecha = item.fecha_aplicacion.split("T")[0]
    const [anioApp, mesApp, diaApp] = soloFecha.split("-").map(Number)
    const fechaAplicacion = new Date(anioApp, mesApp - 1, diaApp)

    const retiroLeche = Number(item.retiro_leche) || 0
    const retiroCarne = Number(item.retiro_carne) || 0

    const calcularDiasRestantes = (diasRetiro: number) => {
      if (diasRetiro <= 0) return 0
      
      const fechaFinRetiro = new Date(fechaAplicacion)
      fechaFinRetiro.setDate(fechaFinRetiro.getDate() + diasRetiro)
      
      const diferenciaMs = fechaFinRetiro.getTime() - hoy.getTime()
      const dias = Math.round(diferenciaMs / (1000 * 60 * 60 * 24))
      
      return dias >= 0 ? dias : 0
    }

    const diasRestantesLeche = calcularDiasRestantes(retiroLeche)
    const diasRestantesCarne = calcularDiasRestantes(retiroCarne)

    const activoLeche = diasRestantesLeche > 0
    const activoCarne = diasRestantesCarne > 0

    if (activoLeche || activoCarne) {
      // Como trajimos bovinos (*), manejamos si viene como objeto o array y leemos sus propiedades con seguridad
      const bovinoInfo = Array.isArray(item.bovinos) ? item.bovinos[0] : item.bovinos
      const codigo = bovinoInfo?.codigo || bovinoInfo?.numero || "S/N"
      const nombre = bovinoInfo?.nombre ? ` (${bovinoInfo.nombre})` : ""
      const codigoAnimal = `${codigo}${nombre}`

      let tipo: "Leche" | "Carne" | "Ambos" = "Leche"
      let diasRestantes = 0

      if (activoLeche && activoCarne) {
        tipo = "Ambos"
        diasRestantes = Math.max(diasRestantesLeche, diasRestantesCarne)
      } else if (activoCarne) {
        tipo = "Carne"
        diasRestantes = diasRestantesCarne
      } else {
        tipo = "Leche"
        diasRestantes = diasRestantesLeche
      }

      retirosCalculados.push({
        id: item.id,
        codigoAnimal,
        medicamento: item.medicamento,
        diasRestantes,
        tipo,
      })
    }
  })

  retirosCalculados.sort((a, b) => a.diasRestantes - b.diasRestantes)
  return retirosCalculados
}



export async function obtenerDistribucionHato() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bovinos")
    .select("categoria, estados_productivos")
    .eq("condicion", "Activo")

  if (error) {
    console.error("❌ Error al obtener distribución del hato:", error.message)
    return []
  }

  if (!data || data.length === 0) return []

  const conteo: Record<string, number> = {}

  data.forEach((item) => {
    const categoria = item.categoria || item.estados_productivos || "Sin Categoría"
    conteo[categoria] = (conteo[categoria] || 0) + 1
  })

  // Mapa de colores predefinidos y profesionales para cada tipo de categoría ganadera
  const coloresMap: Record<string, string> = {
    "En producción": "#16a34a",      // Verde esmeralda vivo
    "Seca": "#eab308",             // Amarillo / Ámbar
    "Gestantes": "#0284c7",        // Azul claro
    "Novilla de vientre": "#9333ea", // Morado
    "Novilla en desarrollo": "#db2777", // Rosa / Fucsia
    "Levante": "#f97316",          // Naranja
    "Destete": "#0d9488",          // Verde azulado (Teal)
    "Ternera en lactancia": "#6366f1", // Índigo
    "Macho": "#475569",            // Gris pizarra oscuro
    "Sin Categoría": "#94a3b8"     // Gris neutro
  }

  // Paleta de respaldo por si aparece una categoría nueva no mapeada arriba
  const coloresRespaldo = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"]

  const resultado = Object.keys(conteo).map((cat, index) => ({
    categoria: cat,
    cantidad: conteo[cat],
    fill: coloresMap[cat] || coloresRespaldo[index % coloresRespaldo.length],
  }))

  return resultado
}