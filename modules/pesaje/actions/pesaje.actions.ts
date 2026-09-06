'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { FiltrosPesaje } from '../components/PesajeFiltersDrawer';

export async function obtenerPesajes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pesajes')
    .select(`
      *,
      bovinos (
        id,
        arete,
        nombre
      )
    `)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener los pesajes: ${error.message}`);
  }

  return data;
}

export async function obtenerPesajesPaginados(
  pagina: number = 1, 
  porPagina: number = 10, 
  filtros?: FiltrosPesaje
) {
  const supabase = await createClient();
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  const tieneFiltroBusqueda = Boolean(filtros?.busqueda && filtros.busqueda.trim() !== '');

  const relacionBovino = tieneFiltroBusqueda 
    ? 'bovinos!inner ( id, arete, nombre )' 
    : 'bovinos ( id, arete, nombre )';

  let query = supabase
    .from('pesajes')
    .select(`*, ${relacionBovino}`, { count: 'exact' });

  if (filtros) {
    if (tieneFiltroBusqueda) {
      const termino = filtros.busqueda.trim();
      query = query.or(`arete.ilike.%${termino}%,nombre.ilike.%${termino}%`, { foreignTable: 'bovinos' });
    }
    
    if (filtros.metodo && filtros.metodo !== 'todos') {
      query = query.eq('metodo_pesaje', filtros.metodo);
    }

    if (filtros.condicion && filtros.condicion !== 'todas') {
      query = query.eq('condicion_corporal', parseFloat(filtros.condicion));
    }

    if (filtros.fechaInicio && filtros.fechaInicio.trim() !== '') {
      query = query.gte('fecha', filtros.fechaInicio);
    }

    if (filtros.fechaFin && filtros.fechaFin.trim() !== '') {
      query = query.lte('fecha', filtros.fechaFin);
    }
  }

  query = query.order('fecha', { ascending: false }).range(desde, hasta);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error al obtener los pesajes paginados: ${error.message}`);
  }

  return {
    pesajes: data,
    total: count ?? 0,
    paginaActual: pagina,
    porPagina,
  };
}

export async function crearPesaje(nuevoPesaje: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pesajes')
    .insert([nuevoPesaje])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear el pesaje: ${error.message}`);
  }

  revalidatePath('/pesaje');
  revalidatePath('/pesajes');

  return data;
}

export async function actualizarPesaje(id: string, pesajeActualizado: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pesajes')
    .update(pesajeActualizado)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar el pesaje: ${error.message}`);
  }

  revalidatePath('/pesaje'); 
  revalidatePath('/pesajes');

  return data;
}

export async function eliminarPesaje(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('pesajes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar el pesaje: ${error.message}`);
  }

  revalidatePath('/pesaje');
  revalidatePath('/pesajes');

  return { success: true };
}