import { createClient } from '@/lib/supabase/client';
import { Potrero, HistorialItem } from '../schemas';

const supabase = createClient();

export async function getPotreros(): Promise<Potrero[]> {
  const { data, error } = await supabase.from('potreros').select('*').order('id', { ascending: true });
  if (error) throw error;

  return (data || []).map((p) => {
    let diasDescansoCalculados = p.dias_descanso || 0;
    if (p.fecha_salida_ganado && (!p.fecha_entrada_ganado || new Date(p.fecha_salida_ganado) > new Date(p.fecha_entrada_ganado))) {
      const diffTime = Math.abs(new Date().getTime() - new Date(p.fecha_salida_ganado).getTime());
      diasDescansoCalculados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      id: p.id,
      nombre: p.nombre,
      estado: p.estado || 'En Descanso',
      crecimiento: p.crecimiento,
      tipoPasto: p.tipo_pasto,
      ultimoAbono: p.ultimo_abono,
      fechaAbono: p.fecha_abono,
      diasDescanso: diasDescansoCalculados,
      bovinosActuales: p.bovinos_actuales ?? 0,
      mensajeCrecimiento: p.mensaje_crecimiento,
      areaM2: p.area_m2,
      fechaSalidaGanado: p.fecha_salida_ganado,
      fechaEntradaGanado: p.fecha_entrada_ganado,
      aforo: p.aforo ?? 0,
      x: p.x ?? 50,
      y: p.y ?? 50,
    };
  });
}

export async function getHistorialPotrero(id: number): Promise<HistorialItem[]> {
  const { data, error } = await supabase
    .from('historial_potreros')
    .select('*')
    .eq('potrero_id', id)
    .order('fecha_cambio', { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function updatePotreroCoordenadas(id: number, x: number, y: number) {
  const { error } = await supabase.from('potreros').update({ x, y }).eq('id', id);
  if (error) throw error;
}

export async function insertPotrero(nuevoPotreroDb: any) {
  const { data, error } = await supabase.from('potreros').insert([nuevoPotreroDb]).select();
  if (error) throw error;
  return data;
}

export async function updatePotreroCompleto(id: number, datosActuales: any, historialData: any) {
  const { error } = await supabase.from('potreros').update(datosActuales).eq('id', id);
  if (error) throw error;

  const { error: errorHistorial } = await supabase.from('historial_potreros').insert([historialData]);
  if (errorHistorial) throw errorHistorial;
}

export async function deletePotreroDb(id: number) {
  const { error } = await supabase.from('potreros').delete().eq('id', id);
  if (error) throw error;
}