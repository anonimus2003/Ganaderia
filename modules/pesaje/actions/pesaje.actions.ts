// modules/inventario/actions/pesaje.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Pesaje } from "../schemas";
import { FiltrosPesaje } from "../hooks/usePesajes";

const supabase = createClient();

export async function getPesajesAction(page = 1, limit = 10, filtros?: FiltrosPesaje) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("pesajes")
    .select(`
      *,
      bovinos:bovino_id!inner (
        id,
        arete,
        nombre
      ),
      usuarios!fk_pesajes_registrado_por_usuarios ( nombre, apellidos, rol )
    `, { count: "exact" })
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (filtros) {
    if (filtros.busqueda) {
      query = query.or(`arete.ilike.%${filtros.busqueda}%,nombre.ilike.%${filtros.busqueda}%`, { referencedTable: 'bovinos' });
    }
    if (filtros.fechaInicio) {
      query = query.gte("fecha", `${filtros.fechaInicio}T00:00:00`);
    }
    if (filtros.fechaFin) {
      query = query.lte("fecha", `${filtros.fechaFin}T23:59:59`);
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al obtener pesajes con filtros:", error.message);
    throw new Error(error.message);
  }

  // Mapear los datos para unificar el nombre y apellido del creador
  const pesajesConRegistrador = (data || []).map((item: any) => {
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
    data: pesajesConRegistrador as Pesaje[],
    total: count || 0,
  };
}

function limpiarCamposVacios(data: Partial<Pesaje>) {
  const limpio: any = { ...data };
  Object.keys(limpio).forEach(key => {
    if (limpio[key] === "" || limpio[key] === undefined) {
      limpio[key] = null;
    }
  });
  return limpio;
}

export async function savePesajeAction(dataToSave: Partial<Pesaje>): Promise<void> {
  const datosLimpios = limpiarCamposVacios(dataToSave);

  // ELIMINAR PROPIEDADES VIRTUALES O DE RELACIÓN QUE NO SON COLUMNAS DE LA TABLA "pesajes"
  delete datosLimpios.registrado_por_nombre;
  delete datosLimpios.bovinos;
  delete datosLimpios.usuarios;

  if (datosLimpios.id) {
    const pesajeId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.registrado_por; // Mantenemos el creador original al editar

    const { error } = await supabase
      .from("pesajes")
      .update(datosLimpios)
      .eq("id", pesajeId);

    if (error) {
      console.error("Error al actualizar pesaje:", error.message);
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
      .from("pesajes")
      .insert([datosLimpios]);

    if (error) {
      console.error("Error al insertar pesaje:", error.message);
      throw new Error(error.message);
    }
  }
}

export async function deletePesajeAction(id: string): Promise<void> {
  const { error } = await supabase
    .from("pesajes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar pesaje:", error.message);
    throw new Error(error.message);
  }
}