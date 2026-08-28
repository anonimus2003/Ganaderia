'use server';

import { createClient } from '@/lib/supabase/server';
import { Pesaje } from '../schemas';

export async function obtenerPesajes() {
  const supabase = await createClient(); // Si tu createClient es async, usa await. Si no, quítalo.
  
  const { data, error } = await supabase
    .from('pesajes')
    .select('*, bovinos(arete, nombre, categoria)')
    .order('fecha', { ascending: false });

  if (error) {
    console.error("Error al obtener pesajes:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function guardarPesaje(pesaje: Omit<Pesaje, 'id'>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('pesajes')
    .insert([pesaje])
    .select();

  if (error) {
    console.error("Error al guardar pesaje:", error);
    throw new Error(error.message);
  }
  return data[0];
}