// modules/reproduccion/actions/reproduccion.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Reproduccion, FiltrosReproduccion } from '../schemas';

export async function obtenerReproduccionesPaginadas(
  pagina: number = 1,
  porPagina: number = 10,
  filtros?: FiltrosReproduccion
) {
  const supabase = await createClient();
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  const tieneFiltroBovino = Boolean(filtros?.bovino && filtros.bovino.trim() !== '');
  const relacionBovino = tieneFiltroBovino
    ? 'bovinos!inner ( id, arete, nombre )'
    : 'bovinos ( id, arete, nombre )';

  let query = supabase
    .from('reproducciones')
    .select(`*, ${relacionBovino}`, { count: 'exact' });

  if (filtros) {
    if (tieneFiltroBovino) {
      const termino = filtros.bovino!.trim();
      query = query.or(`arete.ilike.%${termino}%,nombre.ilike.%${termino}%`, { foreignTable: 'bovinos' });
    }
    if (filtros.estado && filtros.estado.trim() !== '') {
      query = query.eq('estado', filtros.estado);
    }
    if (filtros.tipo && filtros.tipo.trim() !== '') {
      query = query.eq('tipo', filtros.tipo);
    }
    if (filtros.fechaInicio && filtros.fechaInicio.trim() !== '') {
      query = query.gte('fecha_inseminacion', filtros.fechaInicio);
    }
    if (filtros.fechaFin && filtros.fechaFin.trim() !== '') {
      query = query.lte('fecha_inseminacion', filtros.fechaFin);
    }
  }

  query = query.order('fecha_inseminacion', { ascending: false }).range(desde, hasta);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error al obtener los registros de reproducción: ${error.message}`);
  }

  return {
    reproducciones: data as Reproduccion[],
    total: count ?? 0,
    paginaActual: pagina,
    porPagina,
  };
}

export async function crearReproduccion(nuevaReproduccion: Partial<Reproduccion>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    ...nuevaReproduccion,
    registrado_por: user?.id || null,
  };

  const { data, error } = await supabase
    .from('reproducciones')
    .insert([payload])
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
    throw new Error(`Error al registrar la reproducción: ${error.message}`);
  }

  revalidatePath('/dashboard/reproduccion');

  return data;
}

export async function actualizarReproduccion(id: string, reproduccionActualizada: Partial<Reproduccion>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reproducciones')
    .update(reproduccionActualizada)
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
    throw new Error(`Error al actualizar la reproducción: ${error.message}`);
  }

  revalidatePath('/dashboard/reproduccion');

  return data;
}

export async function eliminarReproduccion(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('reproducciones')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar el registro de reproducción: ${error.message}`);
  }

  revalidatePath('/dashboard/reproduccion');

  return { success: true };
}