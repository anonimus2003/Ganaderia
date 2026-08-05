'use server';

import { createClient } from '@/lib/supabase/server'; // O tu cliente de supabase
import { Pesaje } from '../schemas';

export async function obtenerPesajes() {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('pesajes')
    .select('*, bovinos(arete, nombre, categoria)')
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function guardarPesaje(pesaje: Omit<Pesaje, 'id'>) {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('pesajes')
    .insert([pesaje])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}