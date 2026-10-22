export interface Punto {
  x: number;
  y: number;
}

/**
 * Parsea, normaliza, escala y desplaza los puntos.
 */
export const obtenerPuntosValidos = (puntosRaw: any): Punto[] | null => {
  try {
    const parsed = typeof puntosRaw === 'string' ? JSON.parse(puntosRaw) : puntosRaw;
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) return null;

    const factorEscala = 0.7; 
    
    // Ajusta este valor para moverlos hacia la derecha (números positivos) 
    // o hacia la izquierda (números negativos). Pruébale con 30, 50, etc.
    const desplazamientoX = 116; 
    
    // Si también necesitaras moverlos verticalmente (arriba/abajo), usa esto:
    const desplazamientoY = 0; 

    return parsed.map((item: any) => {
      let x = 0;
      let y = 0;

      if (Array.isArray(item)) {
        x = Number(item[0]) || 0;
        y = Number(item[1]) || 0;
      } else {
        x = Number(item.x) || 0;
        y = Number(item.y) || 0;
      }

      // Aplicamos escala y desplazamiento
      return {
        x: (x * factorEscala) + desplazamientoX,
        y: (y * factorEscala) + desplazamientoY,
      };
    });
  } catch {
    return null;
  }
};

/**
 * Calcula el centroide de un polígono SVG para ubicar el texto/etiqueta del nombre.
 */
export const calcularCentroide = (puntos: Punto[]): Punto => {
  if (!puntos || !puntos.length) return { x: 0, y: 0 };
  const suma = puntos.reduce(
    (acc, p) => ({ x: acc.x + (p.x || 0), y: acc.y + (p.y || 0) }),
    { x: 0, y: 0 }
  );
  return {
    x: suma.x / puntos.length,
    y: suma.y / puntos.length,
  };
};