'use client'

import { 
  Milk, Scale, AlertTriangle, Calendar, Search, Bell, User, 
  TrendingUp, CheckCircle2, Stethoscope, FileText
} from 'lucide-react'
import { useDashboardData } from './hooks/useDashboard'

import SelectorAnimal from './componentes/SelectorAnimal'
import GraficaProduccion from './componentes/grafica/GraficaProduccion'
import GraficaPeso from './componentes/grafica/GraficaPeso'
import EncabezadoDashboard from './componentes/EncabezadoDashboard' // Ajusta la ruta según dónde hayas guardado el archivo

export default function DashboardPage() {
  const {
    totalAnimales,
    listaBovinos,
    vacaSeleccionada,
    setVacaSeleccionada,
    registrosOrdeno,
    registrosPeso,
    errorSupabase,
  } = useDashboardData()

  const pesoReciente =
    registrosPeso.length > 0 ? Number(registrosPeso[registrosPeso.length - 1]?.peso_kgs) || 0 : 0

  const diasLactancia = 234

  const animalSeleccionado = listaBovinos.find(
    bovino => bovino.id === vacaSeleccionada
  ) || { nombre: 'LOLA', arete: '#A023', raza: 'Holstein', sexo: 'Hembra', proposito: 'Lechero' }

  return (
    <main className="min-h-screen bg-white text-slate-900 text-xs antialiased selection:bg-slate-900 selection:text-white">
      <div className="mx-auto max-w-[1650px] p-5 md:p-6 space-y-5">

        {/* 1. ENCABEZADO DEL DASHBOARD */}
        <EncabezadoDashboard
          nombreUsuario="Olmer"
          listaBovinos={listaBovinos}
          vacaSeleccionada={vacaSeleccionada}
          setVacaSeleccionada={setVacaSeleccionada}
        />

        {/* 2. RESUMEN GENERAL DEL HATO */}
        <section className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
            RESUMEN GENERAL DEL HATO
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">TOTAL BOVINOS</span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalAnimales || 126}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1">
                  <TrendingUp size={11} className="text-emerald-600" /> +4.2%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">VACAS ORDEÑO</span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">34</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1">
                  <TrendingUp size={11} className="text-emerald-600" /> +2
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">LECHE HATO HOY</span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">1.240 <span className="text-xs font-bold text-slate-500">L</span></span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1">
                  <TrendingUp size={11} className="text-emerald-600" /> +8.1%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">PESO PROMEDIO</span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">468 <span className="text-xs font-bold text-slate-500">kg</span></span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1">
                  <TrendingUp size={11} className="text-emerald-600" /> +1.7%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SECCIÓN MAESTRA: ANIMAL SELECCIONADO (IZQ) + GRÁFICA PRODUCCIÓN (DER) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Columna Izquierda: Ficha Compacta del Animal Seleccionado (Ancho 5/12) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-sm">
                    🐄
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">
                      {animalSeleccionado?.nombre || 'LOLA'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Arete: <span className="font-semibold text-slate-700">{animalSeleccionado?.arete || '#A023'}</span> | Raza: <span className="font-semibold text-slate-700"></span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Lactancia
                </span>
              </div>

              {/* Métricas rápidas del animal en grid compacto de 2 columnas */}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Calendar size={11} /> PARTO
                  </span>
                  <p className="text-[11px] font-bold text-slate-900 mt-1">15/01/2026</p>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Milk size={11} /> DÍAS LACTANCIA
                  </span>
                  <p className="text-[11px] font-bold text-slate-900 mt-1">{diasLactancia} días</p>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Scale size={11} /> PESO ACTUAL
                  </span>
                  <p className="text-[11px] font-bold text-slate-900 mt-1">{pesoReciente || 485} kg</p>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Milk size={11} /> LECHE HOY
                  </span>
                  <p className="text-[11px] font-bold text-slate-900 mt-1">24,8 L</p>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <TrendingUp size={11} /> PROMEDIO/DÍA
                  </span>
                  <p className="text-[11px] font-bold text-slate-900 mt-1">23,6 L</p>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Milk size={11} /> ACUMULADA
                  </span>
                  <p className="text-[11px] font-bold text-slate-900 mt-1">5.522 L</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span>Estado clínico: <strong className="text-slate-800">Óptimo</strong></span>
              <span>Reproductivo: <strong className="text-emerald-700">Preñada</strong></span>
            </div>
          </div>

          {/* Columna Derecha: Gráfica de Producción de Leche (Ancho 7/12) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                HISTORIAL DE ORDEÑO ({animalSeleccionado?.nombre || 'LOLA'})
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-800">
                Últimos 7 días
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-center min-h-[190px]">
              <GraficaProduccion data={registrosOrdeno} />
            </div>
          </div>

        </section>

        {/* 4. SECCIÓN DOBLE COLUMNA: EVOLUCIÓN PESO + CONTROL CLÍNICO Y REPRODUCTIVO */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                EVOLUCIÓN DE PESO ({animalSeleccionado?.nombre || 'LOLA'})
              </span>
              <span className="text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                Balance: +35 kg
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-center min-h-[190px]">
              <GraficaPeso registros={registrosPeso} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope size={14} className="text-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">CONTROL CLÍNICO Y REPRODUCTIVO</span>
            </div>

            <div className="space-y-2 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60 text-xs flex-1 flex flex-col justify-around">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Estado Sanitario:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Saludable (Sin restricciones)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Tratamiento Actual:</span>
                <span className="font-semibold text-slate-900">Ninguno</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Último Parto:</span>
                <span className="font-semibold text-slate-900">15/01/2026</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Inseminación / Servicio:</span>
                <span className="font-semibold text-slate-900">12/03/2026</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Próximo Parto Estimado:</span>
                <span className="font-semibold text-slate-900">20/12/2026</span>
              </div>
            </div>
          </div>

        </section>

        {/* 5. ESTADO GLOBAL DEL HATO */}
        <section className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
            ESTADÍSTICAS Y DISTRIBUCIÓN GENERAL DEL HATO
          </h2>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">DISTRIBUCIÓN DEL HATO</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Desglose poblacional actual de la totalidad de animales registrados en el sistema.
                </p>
                <div className="pt-1">
                  <span className="text-xl font-black text-slate-900">126</span>
                  <span className="text-[11px] text-slate-500 ml-1 font-semibold">Bovinos Totales</span>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] font-semibold text-slate-400 block uppercase">Vacas Ordeño</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">34</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] font-semibold text-slate-400 block uppercase">Bovinos Activos</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">98</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] font-semibold text-slate-400 block uppercase">En Lactancia</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">34</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] font-semibold text-slate-400 block uppercase">En Tratamiento</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">5</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] font-semibold text-slate-400 block uppercase">Secos</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">10</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9px] font-semibold text-rose-600 block uppercase">Restricción Leche</span>
                  <span className="text-xs font-bold text-rose-700 mt-0.5 block">3</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ALERTAS OPERATIVAS */}
        <section className="space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
            ALERTAS Y NOTIFICACIONES OPERATIVAS
          </h2>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
              <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                LECHE RETENIDA
              </span>
              <p className="text-[11px] text-slate-700 font-medium pt-2">
                Vaca <span className="font-bold text-slate-900">#A031</span> — Tratamiento activo registrado. No utilizar leche. Faltan 2 días.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                PRÓXIMO SECADO
              </span>
              <p className="text-[11px] text-slate-700 font-medium pt-2">
                Vaca <span className="font-bold text-slate-900">#A018</span> — 287 días de lactancia cumplidos. Requiere revisión inminente.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                CONTROL DE PESO
              </span>
              <p className="text-[11px] text-slate-700 font-medium pt-2">
                Vaca <span className="font-bold text-slate-900">#A055</span> — Sin registros de control de peso en los últimos 45 días.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                POTRERO DISPONIBLE
              </span>
              <p className="text-[11px] text-slate-700 font-medium pt-2">
                Potrero <span className="font-bold text-slate-900">El Roble</span> — Disponible para rotación con capacidad para 8 bovinos.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}