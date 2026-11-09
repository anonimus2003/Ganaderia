// modules/finanzas/Caja/actions/caja.actions.ts
import { createClient } from "@/lib/supabase/client";
import { TransaccionCaja, FiltrosCaja } from "../schemas";

const supabase = createClient();

export async function getCajaAction(page = 1, limit = 10, filtros?: FiltrosCaja) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("caja")
    .select(`
      *,
      usuarios!caja_registrado_por_fkey ( nombre, apellidos, rol )
    `, { count: "exact" })
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (filtros) {
    // 1. Búsqueda general por texto (categoría, método de pago o descripción)
    if (filtros.search && filtros.search.trim() !== "") {
      const termino = filtros.search.trim();
      query = query.or(`categoria.ilike.%${termino}%,metodo_pago.ilike.%${termino}%,descripcion.ilike.%${termino}%`);
    }

    // 2. Filtro por tipo (ingreso / egreso)
    if (filtros.tipoSeleccionado && filtros.tipoSeleccionado.trim() !== "") {
      query = query.eq("tipo", filtros.tipoSeleccionado.trim());
    }

    // 3. Rango de fechas
    if (filtros.fechaInicio) {
      query = query.gte("fecha", `${filtros.fechaInicio}T00:00:00`);
    }
    if (filtros.fechaFin) {
      query = query.lte("fecha", `${filtros.fechaFin}T23:59:59`);
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al obtener registros de caja:", error.message);
    throw new Error(error.message);
  }

  // Mapear los datos para unificar el nombre y apellido del creador
  const cajaConRegistrador = (data || []).map((item: any) => {
    const usuarioObj = item.usuarios;
    
    const nombreCreador = usuarioObj && (usuarioObj.nombre || usuarioObj.apellidos)
      ? `${usuarioObj.nombre || ''} ${usuarioObj.apellidos || ''}`.trim()
      : (item.registrado_por ? 'Usuario Registrado' : 'Sistema');

    return {
      ...item,
      registrado_por_nombre: nombreCreador,
    };
  });

  return {
    data: cajaConRegistrador as TransaccionCaja[],
    total: count || 0,
  };
}

function limpiarCamposVacios(data: Partial<TransaccionCaja>) {
  const limpio: any = { ...data };
  Object.keys(limpio).forEach(key => {
    if (limpio[key] === "" || limpio[key] === undefined) {
      limpio[key] = null;
    }
  });
  return limpio;
}

export async function saveCajaAction(dataToSave: Partial<TransaccionCaja>): Promise<void> {
  const datosLimpios = limpiarCamposVacios(dataToSave);

  // Eliminar propiedades virtuales o relaciones que no son columnas directas de la tabla caja
  delete datosLimpios.registrado_por_nombre;
  delete datosLimpios.usuarios;

  if (datosLimpios.id) {
    const registroId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.registrado_por; // Mantenemos el creador original al actualizar

    const { error } = await supabase
      .from("caja")
      .update(datosLimpios)
      .eq("id", registroId);

    if (error) {
      console.error("Error al actualizar movimiento de caja:", error.message);
      throw new Error(error.message);
    }
  } else {
    delete datosLimpios.id;

    // Asignar automáticamente el usuario actual si no viene definido
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !datosLimpios.registrado_por) {
      datosLimpios.registrado_por = user.id;
    }

    const { error } = await supabase
      .from("caja")
      .insert([datosLimpios]);

    if (error) {
      console.error("Error al insertar movimiento de caja:", error.message);
      throw new Error(error.message);
    }
  }
}

export async function deleteCajaAction(id: string | undefined): Promise<void> {
  if (!id) {
    throw new Error("El ID es obligatorio para eliminar.");
  }

  const { error } = await supabase
    .from("caja")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar movimiento de caja:", error.message);
    throw new Error(error.message);
  }
}