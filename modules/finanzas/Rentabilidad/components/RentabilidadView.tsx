"use client";

import { useState, useEffect, useCallback } from "react";
import { getAnalisisRentabilidadAction } from "../actions/rentabilidad.actions";
import { ResumenRentabilidad, GastoPorCategoria } from "../schemas";
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Loader2,
  Milk, Beef, Store, PackageOpen, Layers, ShieldAlert, ShoppingBag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Función auxiliar para asignar iconos según la categoría ganadera
function obtenerIconoCategoria(categoria: string, tipo: 'ingreso' | 'egreso') {
  const catLower = categoria.toLowerCase();
  
  if (tipo === 'ingreso') {
    if (catLower.includes('leche') || catLower.includes('lacteo')) return Milk;
    if (catLower.includes('carne') || catLower.includes('gancho')) return Beef;
    if (catLower.includes('animal') || catLower.includes('ganado') || catLower.includes('venta')) return Store;
    if (catLower.includes('derivado')  || catLower.includes('queso')) return PackageOpen;
    return TrendingUp;
  } else {
    if (catLower.includes('alimento') || catLower.includes('concentrado')) return ShoppingBag;
    if (catLower.includes('medicamento') || catLower.includes('veterinaria')) return ShieldAlert;
    return Layers;
  }
}

export default function RentabilidadView() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenRentabilidad>({
    totalIngresos: 0,
    totalEgresos: 0,
    balanceNeto: 0,
    margenRentabilidad: 0,
  });
  const [gastos, setGastos] = useState<GastoPorCategoria[]>([]);
  const [ingresos, setIngresos] = useState<GastoPorCategoria[]>([]);

  // Filtros de fecha predeterminados (mes actual)
  const fechaActual = new Date();
  const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().split("T")[0];
  const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().split("T")[0];

  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(ultimoDiaMes);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const resultado = await getAnalisisRentabilidadAction({ fechaInicio, fechaFin });
      setResumen(resultado.resumen);
      setGastos(resultado.gastosPorCategoria);
      setIngresos(resultado.ingresosPorCategoria);
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al calcular rentabilidad";
      toast.error("Error", { description: mensaje });
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ENCABEZADO Y FILTROS DE FECHA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-slate-900 text-lg">Análisis de Rentabilidad y Producción</h1>
          <p className="text-xs text-slate-500">Visualiza de forma clara qué productos generan más ingresos y en qué se gasta el dinero.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Desde:
            <Input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="h-9 text-xs w-auto bg-slate-50 border-slate-200"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            Hasta:
            <Input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              className="h-9 text-xs w-auto bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-400 font-medium">Calculando balances y ventas de la finca...</p>
        </div>
      ) : (
        <>
          {/* TARJETAS DE RESUMEN (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ingresos Totales */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Totales</span>
              <div className="text-2xl font-black text-emerald-600">
                ${resumen.totalIngresos.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">Ventas totales registradas en caja</p>
            </div>

            {/* Egresos Totales */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Egresos Totales</span>
              <div className="text-2xl font-black text-rose-600">
                ${resumen.totalEgresos.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">Gastos e inversiones operativos</p>
            </div>

            {/* Balance Neto / Utilidad */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilidad Neta</span>
              <div className={`text-2xl font-black ${resumen.balanceNeto >= 0 ? "text-slate-900" : "text-rose-600"}`}>
                ${resumen.balanceNeto.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400">Ganancia real (Ingresos menos Gastos)</p>
            </div>

            {/* Margen de Rentabilidad */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute right-4 top-4 p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <PieChart className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Margen de Ganancia</span>
              <div className="text-2xl font-black text-slate-900">
                {resumen.margenRentabilidad.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400">Rentabilidad porcentual del periodo</p>
            </div>
          </div>

          {/* GRÁFICAS VISUALES POR CATEGORÍAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. GRÁFICA DE INGRESOS (Leche, Carne, Animales, Derivados) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">¿De dónde viene el dinero? (Ingresos)</h2>
                  <p className="text-xs text-slate-400">Distribución de ventas por categoría en el periodo</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                  ${resumen.totalIngresos.toLocaleString("es-CO")}
                </span>
              </div>

              {ingresos.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Milk className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400">No hay ventas registradas en este rango de fechas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ingresos.map((item) => {
                    const IconoCat = obtenerIconoCategoria(item.categoria, 'ingreso');
                    return (
                      <div key={item.categoria} className="space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                              <IconoCat className="w-4 h-4" />
                            </span>
                            <span>{item.categoria}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-600">${item.monto.toLocaleString("es-CO")}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">({item.porcentaje.toFixed(1)}%)</span>
                          </div>
                        </div>
                        {/* Barra de progreso visual */}
                        <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${Math.max(item.porcentaje, 3)}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. GRÁFICA DE EGRESOS / GASTOS (Insumos, Concentrados, Medicamentos) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">¿En qué se va el dinero? (Egresos)</h2>
                  <p className="text-xs text-slate-400">Distribución de gastos operativos y compras de la finca</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg">
                  ${resumen.totalEgresos.toLocaleString("es-CO")}
                </span>
              </div>

              {gastos.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400">No hay egresos registrados en este rango de fechas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gastos.map((item) => {
                    const IconoCat = obtenerIconoCategoria(item.categoria, 'egreso');
                    return (
                      <div key={item.categoria} className="space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                              <IconoCat className="w-4 h-4" />
                            </span>
                            <span>{item.categoria}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-rose-600">${item.monto.toLocaleString("es-CO")}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">({item.porcentaje.toFixed(1)}%)</span>
                          </div>
                        </div>
                        {/* Barra de progreso visual */}
                        <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-rose-500 h-full rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${Math.max(item.porcentaje, 3)}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}