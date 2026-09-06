export function calcularEstadoRetiro(fechaAplicacion: string, diasRetiro: number) {
  if (!fechaAplicacion || !diasRetiro || diasRetiro <= 0) {
    return { esApto: true, fechaLibre: null, texto: 'Apto' };
  }

  const fechaApp = new Date(fechaAplicacion);
  const fechaLibre = new Date(fechaApp);
  fechaLibre.setDate(fechaLibre.getDate() + diasRetiro);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaLibre.setHours(0, 0, 0, 0);

  const esApto = hoy >= fechaLibre;
  const fechaFormateada = fechaLibre.toISOString().split('T')[0];

  return {
    esApto,
    fechaLibre: fechaFormateada,
    texto: esApto ? 'Apto' : `Libre el ${fechaFormateada}`,
  };
}