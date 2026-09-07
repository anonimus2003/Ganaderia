// modules/pesajes/actions/pesaje.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Pesaje } from "../schemas";

const supabase = createClient();

export async function getPesajesAction(): Promise<Pesaje[]> {
  const { data, error } = await supabase
    .from("pesajes")
    .select(`
      *,
      bovinos:bovino_id (
        id,
        arete,
        nombre
      )
    `)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener pesajes:", error.message);
    throw new Error(error.message);
  }

  return data || [];
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

  if (datosLimpios.id) {
    const pesajeId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.bovinos; // Remover relación de lectura antes de actualizar

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
    delete datosLimpios.bovinos; // Remover relación de lectura antes de insertar

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