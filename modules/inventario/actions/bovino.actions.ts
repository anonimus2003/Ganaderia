import { createClient } from "@/lib/supabase/client"; // Ajusta según tu configuración de Supabase
import { Bovino } from "../schemas";

const supabase = createClient();

// Obtener todos los bovinos
export async function getBovinos() {
  const { data, error } = await supabase
    .from("bovinos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener bovinos:", error.message);
    throw new Error(error.message);
  }

  return data as Bovino[];
}

// Crear o actualizar un bovino
export async function saveBovino(bovino: Partial<Bovino>) {
  if (bovino.id) {
    // Actualizar
    const { data, error } = await supabase
      .from("bovinos")
      .update(bovino)
      .eq("id", bovino.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } else {
    // Insertar nuevo
    const { data, error } = await supabase
      .from("bovinos")
      .insert([bovino])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

// Eliminar un bovino
export async function deleteBovino(id: string) {
  const { error } = await supabase
    .from("bovinos")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}