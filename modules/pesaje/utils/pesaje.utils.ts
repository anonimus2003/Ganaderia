export function formatearPeso(peso: number | null | undefined): string {
  if (peso === null || peso === undefined) return '0.00 kg';
  return `${Number(peso).toFixed(2)} kg`;
}

export function formatearFecha(fechaStr: string | null | undefined): string {
  if (!fechaStr) return '';
  // Convierte "YYYY-MM-DD" a un formato más legible localmente
  const [anio, mes, dia] = fechaStr.split('-');
  if (!anio || !mes || !dia) return fechaStr;
  return `${dia}/${mes}/${anio}`;
}

export function calcularGananciaDiaria(
  pesoAnterior: number, 
  pesoActual: number, 
  fechaAnterior: string, 
  fechaActual: string
): number {
  const d1 = new Date(fechaAnterior).getTime();
  const d2 = new Date(fechaActual).getTime();
  const diffDias = (d2 - d1) / (1000 * 60 * 60 * 24);

  if (diffDias <= 0) return 0;

  const diffPeso = pesoActual - pesoAnterior;
  // Retorna los gramos o kilogramos ganhados por día
  return Number((diffPeso / diffDias).toFixed(3));
}