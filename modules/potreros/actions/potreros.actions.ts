'use server';

import { createClient } from "@/lib/supabase/server";

export async function registrarSalidaPotrero(potreroId: string | number, fechaSalida: string) {
  const supabase = await createClient();

  const potreroIdLimpio = parseInt(String(potreroId).split('_')[0], 10);

  if (isNaN(potreroIdLimpio)) {
    throw new Error(`ID de potrero inválido: ${potreroId}`);
  }

  // 1. Contamos cuántos animales quedan actualmente en el potrero
  const { count: animalesRestantes, error: errContar } = await supabase
    .from('bovinos')
    .select('id', { count: 'exact', head: true })
    .eq('potrero_id', potreroIdLimpio);

  if (errContar) {
    console.error("Error al contar bovinos en el potrero:", errContar.message);
    throw errContar;
  }

  const cantidadQuedan = animalesRestantes ?? 0;

  // 2. Si ya NO quedan animales, cerramos el ciclo en el historial
  if (cantidadQuedan === 0) {
    const { data: ultimoIngreso, error: errBusqueda } = await supabase
      .from('historial_ocupacion_potreros')
      .select('id')
      .eq('potrero_id', potreroIdLimpio)
      .is('fecha_salida', null)
      .order('fecha_entrada', { ascending: false })
      .limit(1);

    if (errBusqueda) {
      console.error("Error al buscar el historial activo:", errBusqueda.message);
      throw errBusqueda;
    }

    if (ultimoIngreso && ultimoIngreso.length > 0) {
      const idHistorialAbierto = ultimoIngreso[0].id;

      const { error: errHistorial } = await supabase
        .from('historial_ocupacion_potreros')
        .update({ fecha_salida: fechaSalida })
        .eq('id', idHistorialAbierto);

      if (errHistorial) {
        console.error("Error al actualizar la salida en el historial:", errHistorial.message);
        throw errHistorial;
      }
    }
  }

  // 3. Estado estricto: 'Ocupado' o 'Disponible'
  const nuevoEstado = cantidadQuedan > 0 ? 'Ocupado' : 'Disponible';

  const { data, error } = await supabase
    .from('potreros')
    .update({
      estado: nuevoEstado,
      bovinos_actuales: cantidadQuedan,
      ...(cantidadQuedan === 0 && { fecha_salida_ganado: fechaSalida })
    })
    .eq('id', potreroIdLimpio)
    .select();

  if (error) {
    console.error("Error al actualizar el estado del potrero:", error.message);
    throw error;
  }

  return { success: true, data, bovinosRestantes: cantidadQuedan };
}

export async function eliminarEventoBitacora(eventoId: string | number) {
  const supabase = await createClient();

  // Limpiamos el ID eliminando sufijos si los hay, pero manteniéndolo como String/UUID
  const idLimpio = String(eventoId).split('_')[0].trim();

  if (!idLimpio || idLimpio === 'NaN' || idLimpio === 'undefined') {
    console.error('El ID proporcionado no es un UUID válido:', eventoId);
    return { success: false, error: 'ID inválido' };
  }

  const { error } = await supabase
    .from('historial_ocupacion_potreros')
    .delete()
    .eq('id', idLimpio); // <-- Se pasa el string (UUID) directamente

  if (error) {
    console.error('Error al eliminar en Supabase:', error.message);
    throw error;
  }

  return { success: true };
}