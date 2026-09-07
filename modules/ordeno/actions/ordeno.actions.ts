// modules/ordeño/actions/ordeno.actions.ts
import { createClient } from "@/lib/supabase/client";
import { Ordeño } from "../schemas";

const supabase = createClient();

export async function getOrdeñosAction(): Promise<Ordeño[]> {
  const { data, error } = await supabase
    .from("ordeño")
    .select(`
      *,
      bovinos (
        id,
        arete,
        nombre,
        genero,
        raza
      )
    `)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener ordeños:", error.message);
    throw new Error(error.message);
  }

  return data || [];
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

  if (datosLimpios.id) {
    const ordeñoId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;
    delete datosLimpios.bovinos;

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
    delete datosLimpios.bovinos;

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