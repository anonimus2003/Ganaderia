export interface AlertaRetiro {
  id: string
  codigoAnimal: string
  nombreAnimal?: string // Nombre opcional de la vaca
  medicamento: string
  tipo: "Leche" | "Carne" | "Mixto"
  diasRestantes: number
}

export interface MetricasDashboard {
  produccionHoy: number
  diasLactancia: number
  totalAnimales: number
  vacasOrdeno: number
}

// Para la vista diaria de los últimos 7 días
export interface ItemGraficaLeche {
  fecha: string
  litros: number
}

// Para la vista consolidada de meses
export interface ItemGraficaLecheMes {
  mesKey: string
  fecha: string
  litros: number
}

export interface ItemGraficaPesaje {
  fecha: string
  peso: number
}

export interface ItemGraficaEstado {
  estado: string
  cantidad: number
}

export interface BovinoOption {
  id: string
  nombre: string
  arete: string
}

export interface PotreroRendimiento {
  potrero: string
  litros: number
}

// Interfaz principal consumida por el Contexto
export interface DashboardData {
  metricas: MetricasDashboard
  // 🟢 Estructura actualizada para soportar filtrado por días y meses
  graficaLeche: {
    dias: ItemGraficaLeche[]
    meses: ItemGraficaLecheMes[]
  }
  graficaPesaje: ItemGraficaPesaje[]
  graficaEstado: ItemGraficaEstado[]
  alertasRetiro: AlertaRetiro[]
  graficaPotreros?: PotreroRendimiento[]
  bovinos: BovinoOption[]
}