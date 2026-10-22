import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function getPotrerosData(page: number = 1, pageSize: number = 10) {
  // Calcular el rango para Supabase (Ej: Página 1 = 0 a 9, Página 2 = 10 a 19)
  const desde = (page - 1) * pageSize;
  const hasta = desde + pageSize - 1;

  // 1. Consultar todos los potreros
  const { data: potrerosData, error: errPotreros } = await supabase
    .from('potreros')
    .select('*')
    .order('nombre', { ascending: true });

  if (errPotreros) {
    console.error('Error al obtener potreros:', errPotreros);
  }

  // 2. Consultar historial de ocupación trayendo datos del bovino, potrero y el usuario creador
  const { data: ocupacionData, count: totalOcupacion, error: errOcupacion } = await supabase
    .from('historial_ocupacion_potreros')
    .select(`
      id,
      potrero_id,
      bovino_id,
      fecha_entrada,
      fecha_salida,
      aforo,
      registrado_por,
      potreros ( nombre ),
      bovinos:bovino_id ( id, arete, nombre ),
      usuarios:registrado_por ( nombre, apellidos, rol )
    `, { count: 'exact' })
    .order('fecha_entrada', { ascending: false })
    .range(desde, hasta);

  if (errOcupacion) {
    console.error('Error al obtener historial_ocupacion_potreros:', errOcupacion);
  }

  // 3. Consultar historial de abonos trayendo datos del potrero y el usuario creador
  const { data: abonosData, count: totalAbonos, error: errAbonos } = await supabase
    .from('historial_abonos')
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
      potreros ( nombre )
    `, { count: 'exact' })
    .order('fecha_aplicacion', { ascending: false })
    .range(desde, hasta);

  if (errAbonos) {
    console.error('Error al obtener historial_abonos:', errAbonos);
  }

  // 4. Mapear y unificar eventos agregando el nombre y apellido del creador
  const eventosCombinados = [
    ...(ocupacionData || []).map((item: any) => {
      const bovinoObj = item.bovinos;
      const usuarioObj = item.usuarios; // 👈 Datos de la tabla usuarios
      
      // Construimos el nombre completo del creador si existe
      const nombreCreador = usuarioObj 
        ? `${usuarioObj.nombre || ''} ${usuarioObj.apellidos || ''}`.trim() 
        : (item.responsable || 'Sistema');

      return {
        ...item,
        potrero_nombre: item.potreros?.nombre,
        bovino_nombre: bovinoObj?.nombre || item.bovino_nombre,
        arete: bovinoObj?.arete || item.arete,
        fecha_entrada: item.fecha_entrada,
        registrado_por_nombre: nombreCreador, // 👈 Nombre y apellido listo para mostrarse
        rol_registrador: usuarioObj?.rol || 'Trabajador',
      };
    }),
    ...(abonosData || []).map((item: any) => {
      const usuarioObj = item.usuarios; // 👈 Datos de la tabla usuarios
      
      const nombreCreador = usuarioObj 
        ? `${usuarioObj.nombre || ''} ${usuarioObj.apellidos || ''}`.trim() 
        : (item.responsable || 'Sistema');

      return {
        ...item,
        potrero_nombre: item.potreros?.nombre,
        tipo_abono: item.tipo_abono,
        registrado_por_nombre: nombreCreador, // 👈 Nombre y apellido listo para mostrarse
        rol_registrador: usuarioObj?.rol || 'Trabajador',
      };
    }),
  ];

  return {
    potrerosData: potrerosData || [],
    eventosData: eventosCombinados,
    totalOcupacion: totalOcupacion || 0,
    totalAbonos: totalAbonos || 0,
  };
}