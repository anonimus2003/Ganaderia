import { createClient } from '@/lib/supabase/client';

export function useRecuperacionPotrero() {
  const supabase = createClient();

  const registrarRecuperacion = async (
    potreroId: number,
    progreso: number,
    fecha: string,
    observacion?: string
  ) => {
    // 1. Registrar la evaluación en el historial
    const { error: historialError } = await supabase
      .from('evaluaciones_potrero')
      .insert({
        potrero_id: potreroId,
        porcentaje: progreso,
        fecha,
        observacion: observacion || null,
      });

    if (historialError) throw historialError;

    // 2. Determinar estado: Disponible solo si llega al 100%
    const nuevoEstado = progreso === 100 ? 'Disponible' : 'En Descanso';

    // 3. Actualizar el potrero con el nuevo progreso y estado
    const { error: potreroError } = await supabase
      .from('potreros')
      .update({
        progreso_pasto: progreso,
        estado: nuevoEstado,
      })
      .eq('id', potreroId);

    if (potreroError) throw potreroError;

    return { progreso, estado: nuevoEstado };
  };

  return { registrarRecuperacion };
}