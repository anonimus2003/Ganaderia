import { createClient } from '@/lib/supabase/client';
import { Inseminacion } from '../schemas';

const supabase = createClient();

export async function fetchInseminacionesAction() {
  const { data, error } = await supabase
    .from('inseminaciones')
    .select(`
      *,
      bovinos (
        id,
        arete,
        nombre
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inseminaciones:', error);
    return { data: null, error };
  }

  return { data: data as Inseminacion[], error: null };
}

export async function fetchHembrasAction() {
  const { data, error } = await supabase
    .from('bovinos')
    .select('id, arete, nombre')
    .eq('genero', 'Hembra')
    .order('arete', { ascending: true });

  if (error) {
    console.error('Error fetching hembras:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function saveInseminacionAction(payload: any, isEditing: boolean, id?: string) {
  if (isEditing && id) {
    const { error } = await supabase.from('inseminaciones').update(payload).eq('id', id);
    return { error };
  } else {
    const { error } = await supabase.from('inseminaciones').insert([payload]);
    return { error };
  }
}

export async function deleteInseminacionAction(id: string) {
  const { error } = await supabase.from('inseminaciones').delete().eq('id', id);
  return { error };
}