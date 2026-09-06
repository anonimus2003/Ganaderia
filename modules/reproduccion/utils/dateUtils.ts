export function sumarDiasAFecha(fechaStr: string, dias: number): string {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr + 'T00:00:00');
  if (isNaN(fecha.getTime())) return '';
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split('T')[0];
}