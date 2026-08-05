// modules/leche/actions/leche.actions.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { ProduccionLeche, Bovino } from '../schemas';

const PAGE_SIZE = 10;

export async function getBovinosLista(supabase: SupabaseClient): Promise<Bovino[]> {
  const { data, error } = await supabase
    .from('bovinos')
    .select('id, arete, nombre, raza, estado')
    .order('arete', { ascending: true });

  if (error) throw new Error('Error al cargar bovinos: ' + error.message);
  return data || [];
}

interface FetchTablaParams {
  page: number;
  busqueda: string;
  bovinoFiltroId: string;
  fechaInicio: string;
  fechaFin: string;
}

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

export async function deleteProduccionLeche(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('produccion_leche').delete().eq('id', id);
  if (error) throw new Error(error.message);
}