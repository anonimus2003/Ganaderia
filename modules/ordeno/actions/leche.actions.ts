import { SupabaseClient } from '@supabase/supabase-js';
import { ProduccionLeche } from '../schemas';

export interface Bovino {
  id: string;
  arete: string;
  nombre?: string | null;
  raza?: string;
  estado?: string;
}

const PAGE_SIZE = 10;

interface FetchTablaParams {
  page: number;
  busqueda: string;
  bovinoFiltroId: string;
  fechaInicio: string;
  fechaFin: string;
}

// 1. Cargar lista de bovinos para selectores
export async function getBovinosLista(supabase: SupabaseClient): Promise<Bovino[]> {
  const { data, error } = await supabase
    .from('bovinos')
    .select('id, arete, nombre, raza, estado')
    .order('arete', { ascending: true });

  if (error) throw new Error('Error al cargar bovinos: ' + error.message);
  return data || [];
}

// 2. Cargar tabla paginada de producción
export async function getProduccionLechePaginated(supabase: SupabaseClient, params: FetchTablaParams) {
  const { page, busqueda, bovinoFiltroId, fechaInicio, fechaFin } = params;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('produccion_leche')
    .select('*, bovinos!inner(arete, nombre)', { count: 'exact' })
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (busqueda.trim() !== '') {
    const term = busqueda.trim();
    query = query.or(`arete.ilike.%${term}%,nombre.ilike.%${term}%`, { foreignTable: 'bovinos' });
  }

  if (bovinoFiltroId) {
    query = query.eq('bovino_id', bovinoFiltroId);
  }

  if (fechaInicio) {
    query = query.gte('fecha', fechaInicio);
  }
  if (fechaFin) {
    query = query.lte('fecha', fechaFin);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    registros: (data as unknown as ProduccionLeche[]) || [],
    totalCount: count || 0,
  };
}

// 3. Métricas de producción
export async function getMetricasLeche(supabase: SupabaseClient, filters: Omit<FetchTablaParams, 'page'>) {
  const { busqueda, bovinoFiltroId, fechaInicio, fechaFin } = filters;

  let query = supabase
    .from('produccion_leche')
    .select('litros, concentrado_kg, bovinos!inner(arete, nombre)');

  if (busqueda.trim() !== '') {
    const term = busqueda.trim();
    query = query.or(`arete.ilike.%${term}%,nombre.ilike.%${term}%`, { foreignTable: 'bovinos' });
  }

  if (bovinoFiltroId) {
    query = query.eq('bovino_id', bovinoFiltroId);
  }

  if (fechaInicio) {
    query = query.gte('fecha', fechaInicio);
  }
  if (fechaFin) {
    query = query.lte('fecha', fechaFin);
  }

  const { data, error } = await query;
  if (error || !data) return { litrosTotales: 0, concentradoTotal: 0, promedioOrdeno: '0' };

  const totalLitros = data.reduce((acc, curr) => acc + (Number(curr.litros) || 0), 0);
  const totalConcentrado = data.reduce((acc, curr) => acc + (Number(curr.concentrado_kg) || 0), 0);
  const promedio = data.length > 0 ? (totalLitros / data.length).toFixed(1) : '0';

  return {
    litrosTotales: totalLitros,
    concentradoTotal: totalConcentrado,
    promedioOrdeno: promedio,
  };
}

// 4. Eliminar registro
export async function deleteProduccionLeche(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('produccion_leche').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// 5. Crear nuevo registro
export async function createProduccionLeche(supabase: SupabaseClient, payload: Partial<ProduccionLeche>) {
  const { data: { user } } = await supabase.auth.getUser();

  const dataToInsert = {
    bovino_id: payload.bovino_id,
    fecha: payload.fecha,
    litros: payload.litros,
    jornada: payload.jornada,
    concentrado_kg: payload.concentrado_kg || 0,
    observaciones: payload.observaciones || null,
    registrado_por: user ? user.id : null,
  };

  const { error } = await supabase.from('produccion_leche').insert([dataToInsert]);
  if (error) throw new Error('Error al crear registro: ' + error.message);
}

// 6. Actualizar registro existente
export async function updateProduccionLeche(supabase: SupabaseClient, id: string, payload: Partial<ProduccionLeche>) {
  const dataToUpdate = {
    bovino_id: payload.bovino_id,
    fecha: payload.fecha,
    litros: payload.litros,
    jornada: payload.jornada,
    concentrado_kg: payload.concentrado_kg || 0,
    observaciones: payload.observaciones || null,
  };

  const { error } = await supabase.from('produccion_leche').update(dataToUpdate).eq('id', id);
  if (error) throw new Error('Error al actualizar registro: ' + error.message);
}