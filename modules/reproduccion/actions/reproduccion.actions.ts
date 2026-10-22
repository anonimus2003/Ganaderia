// modules/reproduccion/actions/reproduccion.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Reproduccion } from "../schemas";
import { FiltrosReproduccion } from "../hooks/useReproduccion";

const supabase = createClient();

export async function getReproduccionesAction(page = 1, limit = 10, filtros?: FiltrosReproduccion) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("reproducciones")
    .select(`
      *,
      bovinos!inner (
        id,
        arete,
        nombre
      ),
      usuarios!fk_reproducciones_registrado_por_usuarios ( nombre, apellidos, rol )
    `, { count: "exact" })
    .order("fecha_inseminacion", { ascending: false })
    .order("created_at", { ascending: false });

  if (filtros) {
    // 1. Filtro de búsqueda por texto (Arete o Nombre de la vaca)
    if (filtros.busqueda && filtros.busqueda.trim() !== "") {
      const termino = filtros.busqueda.trim();
      query = query.or(`arete.ilike.%${termino}%,nombre.ilike.%${termino}%`, { referencedTable: 'bovinos' });
    }

    // 2. Filtro por estado del proceso
    if (filtros.estado && filtros.estado !== "todos") {
      query = query.eq("estado", filtros.estado);
    }

    // 3. Filtro por tipo de servicio
    if (filtros.tipo && filtros.tipo !== "todos") {
      query = query.eq("tipo", filtros.tipo);
    }

    // 4. Rango de fechas
    if (filtros.fechaInicio) {
      query = query.gte("fecha_inseminacion", `${filtros.fechaInicio}T00:00:00`);
    }
    if (filtros.fechaFin) {
      query = query.lte("fecha_inseminacion", `${filtros.fechaFin}T23:59:59`);
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al obtener reproducciones:", error.message);
    throw new Error(error.message);
  }

  // Mapear los datos para unificar el nombre y apellido del creador
  const reproduccionesConRegistrador = (data || []).map((item: any) => {
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
    data: reproduccionesConRegistrador as Reproduccion[],
    total: count || 0,
  };
}

function limpiarCamposVacios(data: Partial<Reproduccion>) {
  const limpio: any = { ...data };
  Object.keys(limpio).forEach(key => {
    if (limpio[key] === "" || limpio[key] === undefined) {
      limpio[key] = null;
    }
  });
  return limpio;
}

export async function saveReproduccionAction(dataToSave: Partial<Reproduccion>): Promise<void> {
  const datosLimpios = limpiarCamposVacios(dataToSave);
  delete datosLimpios.bovinos;
  delete datosLimpios.usuarios;

  if (datosLimpios.id) {
    const reproduccionId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.registrado_por; // Mantenemos el creador original al actualizar

    const { error } = await supabase
      .from("reproducciones")
      .update(datosLimpios)
      .eq("id", reproduccionId);

    if (error) {
      console.error("Error al actualizar reproducción:", error.message);
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
      .from("reproducciones")
      .insert([datosLimpios]);

    if (error) {
      console.error("Error al insertar reproducción:", error.message);
      throw new Error(error.message);
    }
  }
}

export async function deleteReproduccionAction(id: string | undefined): Promise<void> {
  if (!id) {
    throw new Error("El ID de reproducción es obligatorio para eliminar.");
  }

  const { error } = await supabase
    .from("reproducciones")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar reproducción:", error.message);
    throw new Error(error.message);
  }
}