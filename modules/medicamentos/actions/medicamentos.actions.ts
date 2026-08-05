import { createClient } from '@/lib/supabase/client';
import { TratamientoFormData } from '../schemas';

const supabase = createClient();

export async function getBovinos() {
  const { data, error } = await supabase
    .from('bovinos')
    .select('id, arete, nombre, raza, estado');
  if (error) throw error;
  return data || [];
}

export async function getTratamientos() {
  const { data, error } = await supabase
    .from('tratamientos')
    .select(`
      *,
      bovino:bovinos (id, arete, nombre, raza, estado)
    `)
    .order('fecha_aplicacion', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveTratamiento(formData: TratamientoFormData, editingId: string | null) {
  const payload = {
    bovino_id: formData.bovino_id,
    medicamento: formData.medicamento,
    dosis: formData.dosis,
    via: formData.via,
    fecha_aplicacion: formData.fecha_aplicacion,
    tiempo_retiro: formData.tiempo_retiro,
    veterinario: formData.veterinario,
    motivo: formData.motivo || null,
  };

  if (editingId) {
    const { error } = await supabase
      .from('tratamientos')
      .update(payload)
      .eq('id', editingId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('tratamientos')
      .insert([payload]);
    if (error) throw error;
  }
}

export async function deleteTratamiento(id: string) {
  const { error } = await supabase
    .from('tratamientos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}