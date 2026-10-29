// modules/inventario/actions/ordeno.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Ordeño } from "../schemas";
import { FiltrosOrdeño } from "../hooks/useOrdeno";

const supabase = createClient();

export async function getOrdeñosAction(page = 1, limit = 10, filtros?: FiltrosOrdeño) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("ordeño")
    .select(`
      *,
      bovinos!inner (
        id,
        arete,
        nombre,
        genero,
        raza
      ),
      usuarios:registrado_por ( nombre, apellidos, rol )
    `, { count: "exact" })
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (filtros) {
    if (filtros.busqueda) {
      query = query.or(`arete.ilike.%${filtros.busqueda}%,nombre.ilike.%${filtros.busqueda}%`, { referencedTable: 'bovinos' });
    }
    if (filtros.turno && filtros.turno !== "todas" && filtros.turno !== "todos") {
      query = query.ilike("jornada", `%${filtros.turno}%`);
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
    console.error("Error al obtener ordeños:", error.message);
    throw new Error(error.message);
  }

  // Mapear los datos para unificar el nombre y apellido del creador
  const ordeñosConRegistrador = (data || []).map((item: any) => {
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
    data: ordeñosConRegistrador as Ordeño[],
    total: count || 0,
  };
}

function limpiarCamposVacios(data: Partial<Ordeño>) {
  const limpio: any = { ...data };
  Object.keys(limpio).forEach((key) => {
    if (limpio[key] === "" || limpio[key] === undefined) {
      limpio[key] = null;
    }
  });
  return limpio;
}

export async function saveOrdeñoAction(dataToSave: Partial<Ordeño>): Promise<void> {
  const datosLimpios = limpiarCamposVacios(dataToSave);

  // ELIMINAR PROPIEDADES VIRTUALES O DE RELACIÓN QUE NO SON COLUMNAS DE LA TABLA "ordeño"
  delete datosLimpios.registrado_por_nombre;
  delete datosLimpios.bovinos;
  delete datosLimpios.usuarios;

  if (datosLimpios.id) {
    const ordeñoId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.registrado_por; // Mantenemos el creador original al editar

    const { error } = await supabase
      .from("ordeño")
      .update(datosLimpios)
      .eq("id", ordeñoId);

    if (error) {
      console.error("Error al actualizar ordeño:", error.message);
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
      .from("ordeño")
      .insert([datosLimpios]);

    if (error) {
      console.error("Error al insertar ordeño:", error.message);
      throw new Error(error.message);
    }
  }
}

export async function deleteOrdeñoAction(id: string): Promise<void> {
  const { error } = await supabase
    .from("ordeño")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar ordeño:", error.message);
    throw new Error(error.message);
  }
}