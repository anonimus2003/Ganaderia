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
      )
    `, { count: "exact" })
    .order("fecha_aplicacion", { ascending: false })
    .order("created_at", { ascending: false });

  if (filtros) {
    // 1. Búsqueda general por texto
    if (filtros.search && filtros.search.trim() !== "") {
      const termino = filtros.search.trim();
      
      // Aplicamos un filtro .or() múltiple:
      // Buscamos en las columnas de la tabla medicamentos (medicamento, via, veterinario)
      // Y usamos una segunda condición o permitimos que coincida. 
      // Nota: Para buscar en la relación de bovinos y en la principal a la vez sin que rompa, 
      // lo ideal es filtrar por los campos de texto propios de medicamentos aquí:
      query = query.or(`medicamento.ilike.%${termino}%,via.ilike.%${termino}%,veterinario.ilike.%${termino}%`);
      
      // Si también quieres que busque obligatoriamente por arete o nombre de la vaca cuando escribas eso,
      // la forma más segura en Supabase con tablas relacionadas es hacer que el filtro aplique o 
      // bien puedes buscar por arete usando otra condición .or con referencedTable por separado si es necesario.
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

  return {
    data: data || [],
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
  delete datosLimpios.bovinos;

  if (datosLimpios.id) {
    const registroId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;

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