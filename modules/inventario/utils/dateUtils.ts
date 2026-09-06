// src/lib/utils/dateUtils.ts (o dentro de tus utilidades generales)
export function calcularEdad(fechaNacimiento?: string | null): string {
  if (!fechaNacimiento) return "N/R";
  
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  if (isNaN(nacimiento.getTime())) return "Inválida";

  let anos = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
    anos--;
    meses += 12;
  }

  if (anos === 0 && meses === 0) return "Recién nacido";

  let resultado = [];
  
  if (anos > 0) {
    resultado.push(`${anos} ${anos === 1 ? "año" : "años"}`);
  }
  
  if (meses > 0) {
    resultado.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);
  }

  return resultado.join(" ");
}