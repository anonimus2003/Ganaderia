'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface FiltrosMedicamento {
  bovino?: string;
  medicamento?: string;
  via?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export async function obtenerMedicamentos() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('medicamentos')
    .select(`
      *,
      bovinos (
        id,
        arete,
        nombre
      )
    `)
    .order('fecha_aplicacion', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener los medicamentos: ${error.message}`);
  }

  return data;
}

export async function obtenerMedicamentosPaginados(
  pagina: number = 1, 
  porPagina: number = 10, 
  filtros?: FiltrosMedicamento
) {
  const supabase = await createClient();
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  const tieneFiltroBovino = Boolean(filtros?.bovino && filtros.bovino.trim() !== '');

  const relacionBovino = tieneFiltroBovino 
    ? 'bovinos!inner ( id, arete, nombre )' 
    : 'bovinos ( id, arete, nombre )';

  let query = supabase
    .from('medicamentos')
    .select(`*, ${relacionBovino}`, { count: 'exact' });

  if (filtros) {
    if (tieneFiltroBovino) {
      const termino = filtros.bovino!.trim();
      query = query.or(`arete.ilike.%${termino}%,nombre.ilike.%${termino}%`, { foreignTable: 'bovinos' });
    }
    
    if (filtros.medicamento && filtros.medicamento.trim() !== '') {
      query = query.ilike('medicamento', `%${filtros.medicamento.trim()}%`);
    }

    if (filtros.via && filtros.via.trim() !== '') {
      query = query.eq('via', filtros.via);
    }

    if (filtros.fechaInicio && filtros.fechaInicio.trim() !== '') {
      query = query.gte('fecha_aplicacion', filtros.fechaInicio);
    }

    if (filtros.fechaFin && filtros.fechaFin.trim() !== '') {
      query = query.lte('fecha_aplicacion', filtros.fechaFin);
    }
  }

  query = query.order('fecha_aplicacion', { ascending: false }).range(desde, hasta);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error al obtener los medicamentos paginados: ${error.message}`);
  }

  return {
    medicamentos: data,
    total: count ?? 0,
    paginaActual: pagina,
    porPagina,
  };
}

export async function crearMedicamento(nuevoMedicamento: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('medicamentos')
    .insert([nuevoMedicamento])
    .select(`
      *,
      bovinos (
        id,
        arete,
        nombre
      )
    `)
    .single();

  if (error) {
    throw new Error(`Error al crear el medicamento: ${error.message}`);
  }

  revalidatePath('/medicamentos');

  return data;
}

export async function actualizarMedicamento(id: string, medicamentoActualizado: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('medicamentos')
    .update(medicamentoActualizado)
    .eq('id', id)
    .select(`
      *,
      bovinos (
        id,
        arete,
        nombre
      )
    `)
    .single();

  if (error) {
    throw new Error(`Error al actualizar el medicamento: ${error.message}`);
  }

  revalidatePath('/medicamentos'); 

  return data;
}

export async function eliminarMedicamento(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('medicamentos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar el medicamento: ${error.message}`);
  }

  revalidatePath('/medicamentos');

  return { success: true };
}