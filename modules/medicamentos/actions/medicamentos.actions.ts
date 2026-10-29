// modules/medicamentos/actions/medicamentos.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Medicamento } from "../schemas";
import { FiltrosMedicamento } from "../hooks/useMedicamentos";

const supabase = createClient();

export async function getMedicamentosAction(page = 1, limit = 10, filtros?: FiltrosMedicamento) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("medicamentos")
    .select(`
      *,
      bovinos!inner (
        id,
        arete,
        nombre
      ),
      usuarios!fk_medicamentos_registrado_por_usuarios ( nombre, apellidos, rol )
    `, { count: "exact" })
    .order("fecha_aplicacion", { ascending: false })
    .order("created_at", { ascending: false });

  if (filtros) {
    // 1. Búsqueda general por texto
    if (filtros.search && filtros.search.trim() !== "") {
      const termino = filtros.search.trim();
      query = query.or(`medicamento.ilike.%${termino}%,via.ilike.%${termino}%,veterinario.ilike.%${termino}%`);
    }

    // 2. Filtro por vía de administración
    if (filtros.viaSeleccionada && filtros.viaSeleccionada.trim() !== "") {
      query = query.eq("via", filtros.viaSeleccionada.trim());
    }

    // 3. Rango de fechas (fecha_aplicacion)
    if (filtros.fechaInicio) {
      query = query.gte("fecha_aplicacion", `${filtros.fechaInicio}T00:00:00`);
    }
    if (filtros.fechaFin) {
      query = query.lte("fecha_aplicacion", `${filtros.fechaFin}T23:59:59`);
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al obtener registros:", error.message);
    throw new Error(error.message);
  }

  // Mapear los datos para unificar el nombre y apellido del creador
  const medicamentosConRegistrador = (data || []).map((item: any) => {
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
    data: medicamentosConRegistrador as Medicamento[],
    total: count || 0,
  };
}

function limpiarCamposVacios(data: Partial<Medicamento>) {
  const limpio: any = { ...data };
  Object.keys(limpio).forEach(key => {
    if (limpio[key] === "" || limpio[key] === undefined) {
      limpio[key] = null;
    }
  });
  return limpio;
}

export async function saveMedicamentoAction(dataToSave: Partial<Medicamento>): Promise<void> {
  const datosLimpios = limpiarCamposVacios(dataToSave);

  // ELIMINAR PROPIEDADES VIRTUALES O DE RELACIÓN QUE NO SON COLUMNAS DE LA TABLA
  delete datosLimpios.registrado_por_nombre;
  delete datosLimpios.bovinos;
  delete datosLimpios.usuarios;

  if (datosLimpios.id) {
    const registroId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.registrado_por; // Mantenemos el creador original al actualizar

    const { error } = await supabase
      .from("medicamentos")
      .update(datosLimpios)
      .eq("id", registroId);

    if (error) {
      console.error("Error al actualizar registro:", error.message);
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
      .from("medicamentos")
      .insert([datosLimpios]);

    if (error) {
      console.error("Error al insertar registro:", error.message);
      throw new Error(error.message);
    }
  }
}

export async function deleteMedicamentoAction(id: string | undefined): Promise<void> {
  if (!id) {
    throw new Error("El ID es obligatorio para eliminar.");
  }

  const { error } = await supabase
    .from("medicamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar registro:", error.message);
    throw new Error(error.message);
  }
}