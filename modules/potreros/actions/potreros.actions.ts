import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ==========================================
// 1. HISTORIAL DE OCUPACIÓN
// ==========================================
export async function getHistorialOcupacionAction(page = 1, limit = 10, potreroId?: string | number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("historial_ocupacion_potreros")
    .select(`
      id,
      potrero_id,
      bovino_id,
      fecha_entrada,
      fecha_salida,
      aforo,
      registrado_por,
      potreros ( id, nombre ),
      bovinos ( id, arete, nombre, raza ),
      usuarios ( id, nombre, apellidos, rol )
    `, { count: "exact" })
    .order("fecha_entrada", { ascending: false });


  if (potreroId && potreroId !== "todos") {
    query = query.eq("potrero_id", potreroId);
  }
  

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al obtener historial de ocupación:", error.message);
    throw new Error(error.message);
  }

  const eventosMapeados = (data || []).map((item: any) => {
    const usuarioObj = item.usuarios;
    const bovinoObj = item.bovinos;
    const potreroObj = item.potreros;

    const nombreCreador = usuarioObj && (usuarioObj.nombre || usuarioObj.apellidos)
      ? `${usuarioObj.nombre || ''} ${usuarioObj.apellidos || ''}`.trim()
      : 'Sistema';

    return {
      ...item,
      potrero_nombre: potreroObj?.nombre || `Potrero #${item.potrero_id}`,
      bovino_arete: bovinoObj?.arete || 'S/A',
      bovino_nombre: bovinoObj?.nombre || '',
      registrado_por_nombre: nombreCreador,
      aforo_formateado: item.aforo !== null && item.aforo !== undefined ? `${item.aforo}` : '-',
    };
  });

  return {
    data: eventosMapeados,
    total: count || 0,
  };
}

// ==========================================
// 2. HISTORIAL DE ABONOS (Añade esta función que faltaba)
// ==========================================
// ==========================================
// 2. HISTORIAL DE ABONOS (Corregido para tu esquema de BD)
// ==========================================
export async function getHistorialAbonosAction(page = 1, limit = 10, potreroId?: string | number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("historial_abonos")
    .select(`
      id,
      potrero_id,
      tipo_abono,
      fecha_aplicacion,
      cantidad,
      unidad_medida,
      responsable,
      observaciones,
      registrado_por,
      potreros ( id, nombre )
    `, { count: "exact" })
    .order("fecha_aplicacion", { ascending: false });

  if (potreroId && potreroId !== "todos") {
    query = query.eq("potrero_id", potreroId);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error al obtener historial de abonos:", error.message);
    throw new Error(error.message);
  }

  const abonosMapeados = (data || []).map((item: any) => {
    const potreroObj = item.potreros;

    return {
      ...item,
      potrero_nombre: potreroObj?.nombre || `Potrero #${item.potrero_id}`,
      registrado_por_nombre: item.responsable || 'Sistema',
    };
  });

  return {
    data: abonosMapeados,
    total: count || 0,
  };
}
// ==========================================
// 3. REGISTRAR INGRESO DE GANADO
// ==========================================
export async function registrarIngresoGanado(data: {
  potreroId: string | number;
  animalesIds: string[];
  fecha: string;
  aforo?: number;
  cantidad: number;
  tipoAnimal?: string;
}) {
  const fechaIso = data.fecha ? new Date(data.fecha).toISOString() : new Date().toISOString();
  let descripcionAnimales = `${data.cantidad} animales (${data.tipoAnimal || 'Vaca'})`;

  if (data.animalesIds && data.animalesIds.length > 0) {
    const { data: bovinos, error: errBovinos } = await supabase
      .from('bovinos')
      .select('id, arete, nombre')
      .in('id', data.animalesIds);

    if (errBovinos) throw errBovinos;

    if (bovinos && bovinos.length > 0) {
      const detalleAnimales = bovinos
        .map((b) => `${b.arete}${b.nombre ? ` (${b.nombre})` : ''}`)
        .join(', ');

      descripcionAnimales = `los animales: ${detalleAnimales}`;
    }

    const nuevosRegistros = data.animalesIds.map((bovinoId) => ({
      potrero_id: data.potreroId,
      bovino_id: bovinoId,
      fecha_entrada: fechaIso,
      aforo: data.aforo || null,
    }));

    const { error: errHistorial } = await supabase
      .from('historial_ocupacion_potreros')
      .insert(nuevosRegistros);

    if (errHistorial) throw errHistorial;
  }

  const { error: errPotrero } = await supabase
    .from('potreros')
    .update({ estado: 'Ocupado' })
    .eq('id', data.potreroId);

  if (errPotrero) throw errPotrero;

  return await supabase.from('bitacora_potreros').insert({
    potrero_id: data.potreroId,
    tipo_evento: 'Ingreso Ganado',
    descripcion: `Ingreso de ${descripcionAnimales}. Aforo: ${data.aforo || 'N/A'} kg/m²`,
    fecha: fechaIso,
    cantidad_animales: data.cantidad,
  });
}

// ==========================================
// 4. REGISTRAR SALIDA DE GANADO
// ==========================================
export async function registrarSalidaGanado(data: {
  potreroId: string | number;
  animalesIds?: string[];
  fecha: string;
  cantidad: number;
  tipoAnimal?: string; // 👈 Agrégalo aquí para que TypeScript lo acepte
}) {
  const fechaIso = data.fecha ? new Date(data.fecha).toISOString() : new Date().toISOString();
  let descripcionAnimales = `${data.cantidad} animales`;

  if (data.animalesIds && data.animalesIds.length > 0) {
    const { data: bovinos, error: errBovinos } = await supabase
      .from('bovinos')
      .select('id, arete, nombre')
      .in('id', data.animalesIds);

    if (!errBovinos && bovinos && bovinos.length > 0) {
      const detalleAnimales = bovinos
        .map((b) => `${b.arete}${b.nombre ? ` (${b.nombre})` : ''}`)
        .join(', ');

      descripcionAnimales = `los animales: ${detalleAnimales}`;
    }
  }

  let queryHistorial = supabase
    .from('historial_ocupacion_potreros')
    .update({ fecha_salida: fechaIso })
    .eq('potrero_id', data.potreroId)
    .is('fecha_salida', null);

  if (data.animalesIds && data.animalesIds.length > 0) {
    queryHistorial = queryHistorial.in('bovino_id', data.animalesIds);
  }

  const { error: errHistorial } = await queryHistorial;
  if (errHistorial) throw errHistorial;

  const { error: errPotrero } = await supabase
    .from('potreros')
    .update({ estado: 'Disponible' })
    .eq('id', data.potreroId);

  if (errPotrero) throw errPotrero;

  return await supabase.from('bitacora_potreros').insert({
    potrero_id: data.potreroId,
    tipo_evento: 'Salida Ganado',
    descripcion: `Salida de ${descripcionAnimales}.`,
    fecha: fechaIso,
    cantidad_animales: data.cantidad,
  });
}

// ==========================================
// 5. REGISTRAR ABONO
// ==========================================
export async function registrarAbono(data: {
  potreroId: string | number;
  unidades: number;
  unidadMedida: string;
  tipoAbono: string;
  fecha: string;
  responsable?: string;
  detalleExtra?: string;
}) {
  const fechaIso = data.fecha ? new Date(data.fecha).toISOString() : new Date().toISOString();

  const { error: errAbono } = await supabase.from('historial_abonos').insert({
    potrero_id: data.potreroId,
    cantidad: data.unidades,
    unidad_medida: data.unidadMedida,
    tipo_abono: data.tipoAbono,
    fecha_aplicacion: fechaIso,
    responsable: data.responsable || null,
    observaciones: data.detalleExtra || null,
  });

  if (errAbono) throw errAbono;

  return await supabase.from('bitacora_potreros').insert({
    potrero_id: data.potreroId,
    tipo_evento: 'Abonado',
    descripcion: `Aplicación de ${data.unidades} ${data.unidadMedida} de ${data.tipoAbono}. ${
      data.detalleExtra ? `Nota: ${data.detalleExtra}` : ''
    }`,
    fecha: fechaIso,
    responsable: data.responsable || null,
  });
}

// ==========================================
// 6. ELIMINAR REGISTRO DE OCUPACIÓN
// ==========================================
export async function deleteHistorialOcupacionAction(id: number | string): Promise<void> {
  const { error } = await supabase
    .from("historial_ocupacion_potreros")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar registro de ocupación:", error.message);
    throw new Error(error.message);
  }
}

// ==========================================
// 7. ELIMINAR REGISTRO DE ABONO
// ==========================================
export async function deleteHistorialAbonoAction(id: string | number): Promise<void> {
  const { error } = await supabase
    .from("historial_abonos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar registro de abono:", error.message);
    throw new Error(error.message);
  }
}