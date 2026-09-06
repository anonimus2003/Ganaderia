// modules/ordeno/actions/ordeno.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Ordeno, FiltrosOrdeno } from '../schemas';

export async function obtenerOrdenosPaginados(
  pagina: number = 1, 
  porPagina: number = 10, 
  filtros?: FiltrosOrdeno & { busqueda?: string }
) {
  const supabase = await createClient();
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  const terminoBusqueda = filtros?.bovino || filtros?.busqueda;
  const tieneFiltroBovino = Boolean(terminoBusqueda && terminoBusqueda.trim() !== '');
  
  const relacionBovino = tieneFiltroBovino 
    ? 'bovinos!inner ( id, arete, nombre )' 
    : 'bovinos ( id, arete, nombre )';

  let query = supabase
    .from('ordeño')
    .select(`*, ${relacionBovino}`, { count: 'exact' });

  if (filtros) {
    if (tieneFiltroBovino) {
      const termino = terminoBusqueda!.trim();
      query = query.or(`arete.ilike.%${termino}%,nombre.ilike.%${termino}%`, { foreignTable: 'bovinos' });
    }
    if (filtros.jornada && filtros.jornada.trim() !== '' && filtros.jornada !== 'todas') {
      query = query.eq('jornada', filtros.jornada);
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
    console.error("Error en Supabase:", error.message);
    throw new Error(`Error al obtener los registros de ordeño: ${error.message}`);
  }

  return {
    ordenos: data as Ordeno[],
    total: count ?? 0,
    paginaActual: pagina,
    porPagina,
  };
}

export async function crearOrdeno(nuevoOrdeno: Partial<Ordeno>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Limpiamos la propiedad 'bovinos' para que Supabase no intente guardarla como columna
  const { bovinos, ...restoDatos } = nuevoOrdeno;

  const payload = {
    ...restoDatos,
    registrado_por: user?.id || null,
  };

  const { data, error } = await supabase
    .from('ordeño')
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
    throw new Error(`Error al registrar el ordeño: ${error.message}`);
  }

  revalidatePath('/dashboard/ordeno');

  return data;
}

export async function actualizarOrdeno(id: string, ordenoActualizado: Partial<Ordeno>) {
  const supabase = await createClient();

  // Limpiamos la propiedad 'bovinos' antes de actualizar para evitar el error de esquema
  const { bovinos, ...datosAActualizar } = ordenoActualizado;

  const { data, error } = await supabase
    .from('ordeño')
    .update(datosAActualizar)
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
    throw new Error(`Error al actualizar el ordeño: ${error.message}`);
  }

  revalidatePath('/dashboard/ordeno'); 

  return data;
}

export async function eliminarOrdeno(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('ordeño')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar el ordeño: ${error.message}`);
  }

  revalidatePath('/dashboard/ordeno');

  return { success: true };
}