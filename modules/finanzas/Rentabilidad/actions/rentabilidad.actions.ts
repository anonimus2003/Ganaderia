import { createClient } from "@/lib/supabase/client";
import { ResumenRentabilidad, GastoPorCategoria, FiltrosRentabilidad } from "../schemas";

const supabase = createClient();

export async function getAnalisisRentabilidadAction(filtros?: FiltrosRentabilidad): Promise<{
  resumen: ResumenRentabilidad;
  gastosPorCategoria: GastoPorCategoria[];
  ingresosPorCategoria: GastoPorCategoria[];
}> {
  let query = supabase.from("caja").select("*");

  // Aplicar filtros de fecha si el usuario los selecciona
  if (filtros?.fechaInicio) {
    query = query.gte("fecha", `${filtros.fechaInicio}T00:00:00`);
  }
  if (filtros?.fechaFin) {
    query = query.lte("fecha", `${filtros.fechaFin}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener datos para rentabilidad:", error.message);
    throw new Error(error.message);
  }

  let totalIngresos = 0;
  let totalEgresos = 0;

  const egresosMap: { [key: string]: number } = {};
  const ingresosMap: { [key: string]: number } = {};

  (data || []).forEach((item: any) => {
    const monto = Number(item.monto || 0);
    const categoria = item.categoria || "General";

    if (item.tipo === "ingreso") {
      totalIngresos += monto;
      ingresosMap[categoria] = (ingresosMap[categoria] || 0) + monto;
    } else if (item.tipo === "egreso") {
      totalEgresos += monto;
      egresosMap[categoria] = (egresosMap[categoria] || 0) + monto;
    }
  });

  const balanceNeto = totalIngresos - totalEgresos;
  const margenRentabilidad = totalIngresos > 0 ? (balanceNeto / totalIngresos) * 100 : 0;

  // Transformar egresos a formato de lista con porcentajes
  const gastosPorCategoria: GastoPorCategoria[] = Object.keys(egresosMap).map((cat) => ({
    categoria: cat,
    monto: egresosMap[cat],
    porcentaje: totalEgresos > 0 ? (egresosMap[cat] / totalEgresos) * 100 : 0,
  })).sort((a, b) => b.monto - a.monto);

  // Transformar ingresos a formato de lista con porcentajes
  const ingresosPorCategoria: GastoPorCategoria[] = Object.keys(ingresosMap).map((cat) => ({
    categoria: cat,
    monto: ingresosMap[cat],
    porcentaje: totalIngresos > 0 ? (ingresosMap[cat] / totalIngresos) * 100 : 0,
  })).sort((a, b) => b.monto - a.monto);

  return {
    resumen: {
      totalIngresos,
      totalEgresos,
      balanceNeto,
      margenRentabilidad,
    },
    gastosPorCategoria,
    ingresosPorCategoria,
  };
}