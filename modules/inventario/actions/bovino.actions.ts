// modules/inventario/actions/bovino.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Bovino } from "../schemas";
import { FiltrosBovino } from "../hooks/usebovinos";

const supabase = createClient();

export async function getBovinosAction(page = 1, limit = 10, filtros?: FiltrosBovino) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("bovinos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Aplicar filtros directamente en Supabase para no saturar la memoria
  if (filtros) {
    if (filtros.busqueda) {
      query = query.or(`arete.ilike.%${filtros.busqueda}%,nombre.ilike.%${filtros.busqueda}%`);
    }
    if (filtros.sexo && filtros.sexo !== "todos") {
      query = query.eq("genero", filtros.sexo);
    }
    if (filtros.estado && filtros.estado !== "todos") {
      query = query.ilike("condicion", `%${filtros.estado}%`);
    }
    if (filtros.categoria && filtros.categoria !== "todas") {
      query = query.eq("categoria", filtros.categoria);
    }
    if (filtros.origen && filtros.origen !== "todos") {
      query = query.eq("origen", filtros.origen);
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al obtener bovinos:", error.message);
    throw new Error(error.message);
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

// Función auxiliar para limpiar cadenas vacías y convertirlas en null
function limpiarCamposVacios(data: Partial<Bovino>) {
  const limpio: any = { ...data };
  Object.keys(limpio).forEach(key => {
    if (limpio[key] === "" || limpio[key] === undefined) {
      limpio[key] = null;
    }
  });
  return limpio;
}

export async function saveBovinoAction(dataToSave: Partial<Bovino>): Promise<void> {
  const datosLimpios = limpiarCamposVacios(dataToSave);

  if (datosLimpios.id) {
    // Actualizar registro existente
    const bovinoId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.registrado_por;

    const { error } = await supabase
      .from("bovinos")
      .update(datosLimpios)
      .eq("id", bovinoId);

    if (error) {
      console.error("Error al actualizar bovino:", error.message);
      throw new Error(error.message);
    }
  } else {
    // Crear nuevo registro
    delete datosLimpios.id;
    const { error } = await supabase
      .from("bovinos")
      .insert([datosLimpios]);

    if (error) {
      console.error("Error al insertar bovino:", error.message);
      throw new Error(error.message);
    }
  }
}

export async function deleteBovinoAction(id: string): Promise<void> {
  const { error } = await supabase
    .from("bovinos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar bovino:", error.message);
    throw new Error(error.message);
  }
}