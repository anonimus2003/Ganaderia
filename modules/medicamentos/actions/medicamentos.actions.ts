import { createClient } from "@/lib/supabase/client";
import { Medicamento } from "../schemas";

const supabase = createClient();

export async function getMedicamentosAction(): Promise<Medicamento[]> {
  const { data, error } = await supabase
    .from("medicamentos") // 👈 Nombre unificado
    .select(`
      *,
      bovinos (
        id,
        arete,
        nombre
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener registros:", error.message);
    throw new Error(error.message);
  }

  return data || [];
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
  
  // Limpiamos campos relacionales que no deben insertarse directamente como columnas planas si causan conflicto
  delete datosLimpios.bovinos;

  if (datosLimpios.id) {
    const registroId = datosLimpios.id;
    delete datosLimpios.id;
    delete datosLimpios.created_at;

    const { error } = await supabase
      .from("medicamentos") // 👈 Cambiado a "medicamentos"
      .update(datosLimpios)
      .eq("id", registroId);

    if (error) {
      console.error("Error al actualizar registro:", error.message);
      throw new Error(error.message);
    }
  } else {
    delete datosLimpios.id;
    const { error } = await supabase
      .from("medicamentos") // 👈 Cambiado a "medicamentos"
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
    .from("medicamentos") // 👈 Cambiado a "medicamentos"
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar registro:", error.message);
    throw new Error(error.message);
  }
}