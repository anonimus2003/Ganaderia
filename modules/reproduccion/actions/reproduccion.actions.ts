import { createClient } from "@/lib/supabase/client";
import { Reproduccion } from "../schemas";

const supabase = createClient();

export async function getReproduccionesAction(): Promise<Reproduccion[]> {
  const { data, error } = await supabase
    .from("reproducciones")
    .select("*, bovinos(id, arete, nombre)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener reproducciones:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}

// Función auxiliar para limpiar cadenas vacías y convertirlas en null
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
  // Evitamos enviar la relación anidada de bovinos a supabase al insertar/actualizar
  delete datosLimpios.bovinos;

  if (datosLimpios.id) {
    // Actualizar registro existente
    const reproduccionId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;

    const { error } = await supabase
      .from("reproduccion")
      .update(datosLimpios)
      .eq("id", reproduccionId);

    if (error) {
      console.error("Error al actualizar reproducción:", error.message);
      throw new Error(error.message);
    }
  } else {
    // Crear nuevo registro
    delete datosLimpios.id;
    const { error } = await supabase
      .from("reproduccion")
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
    .from("reproduccion")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar reproducción:", error.message);
    throw new Error(error.message);
  }
}