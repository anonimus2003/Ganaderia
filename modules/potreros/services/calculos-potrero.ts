import { EventoBitacora, CicloOcupacion } from '../types/potrero.types';

/**
 * Calcula los días de ocupación entre dos fechas.
 */
export const calcularDiasOcupacion = (inicio: string, fin?: string): number => {
  const fechaInicio = new Date(inicio).getTime();
  const fechaFin = fin ? new Date(fin).getTime() : new Date().getTime();
  const diferenciaMs = Math.abs(fechaFin - fechaInicio);
  return Math.max(1, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)));
};

/**
 * Determina el color dinámico del potrero en el SVG según su último evento o estado base.
 */
export const obtenerColorPotrero = (
  potreroId: string | number,
  eventos: EventoBitacora[] = [],
  estadoBase?: string
): string => {
  const evs = eventos.filter(
    (e) => String(e.potrero_id) === String(potreroId) && e.tipo !== 'abono'
  );

  if (evs.length > 0) {
    const ordenados = [...evs].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    const ultimoEvento = ordenados[0];

    if (ultimoEvento.tipo === 'ingreso') return 'rgba(182, 0, 0, 0.75)'; // 🔴 Rojo (Ocupado)
    if (ultimoEvento.tipo === 'salida') return 'rgba(1, 51, 19)';  // 🟢 Verde (Disponible)
  }

  const estadoNormalized = estadoBase?.toLowerCase() || '';
  if (estadoNormalized.includes('ocupado')) {
    return 'rgba(182, 0, 0, 0.75)';
  }

  return 'rgb(1, 51, 19)';
};

/**
 * Normaliza y agrupa los eventos de la bitácora en ciclos de ocupación o eventos individuales.
 */
export const unificarCiclosBitacora = (eventos: EventoBitacora[]) => {
  if (!eventos || eventos.length === 0) {
    return { ciclosUnificados: [], eventosOtros: [] };
  }

  const eventosOrdenados = [...eventos].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const ciclos: CicloOcupacion[] = [];
  const otros: EventoBitacora[] = [];

  eventosOrdenados.forEach((ev) => {
    if (ev.tipo === 'ingreso') {
      const proximaSalida = eventosOrdenados.find(
        (s) =>
          s.tipo === 'salida' &&
          String(s.potrero_id) === String(ev.potrero_id) &&
          new Date(s.fecha) >= new Date(ev.fecha)
      );

      const dias = calcularDiasOcupacion(ev.fecha, proximaSalida?.fecha);
      const valorAforo = ev.aforo ?? proximaSalida?.aforo;

      ciclos.push({
        idPrincipal: ev.id,
        potreroNombre: ev.potrero_nombre || `Potrero #${ev.potrero_id}`,
        eventoOriginal: ev,
        eventoSalida: proximaSalida,
        fechaIngreso: ev.fecha,
        fechaSalida: proximaSalida ? proximaSalida.fecha : 'En curso (Actualidad)',
        diasOcupacion: dias,
        activo: !proximaSalida,
        animales: ev.animales || [],
        aforo: valorAforo,
      });
    } else if (ev.tipo === 'abono') {
      otros.push(ev);
    }
  });

  return {
    ciclosUnificados: ciclos.reverse(),
    eventosOtros: otros.reverse(),
  };
};