// modules/inventario/actions/bovino.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Bovino } from "../schemas";

const supabase = createClient();

export async function getBovinosAction(): Promise<Bovino[]> {
  const { data, error } = await supabase
    .from("bovinos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener bovinos:", error.message);
    throw new Error(error.message);
  }

  return data || [];
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