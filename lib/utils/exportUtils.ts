// Exportar a CSV estándar en múltiples columnas (Formato nativo de Supabase)
export function exportToCSV(data: any[], filename = "exportacion.csv") {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  // Extrae las llaves (columnas) del primer objeto como cabeceras
  const keys = Object.keys(data[0]);
  const headers = keys.join(","); // Separado por coma (estándar Supabase)

  // Mapea las filas de forma segura
  const rows = data.map(item => 
    keys.map(key => {
      const val = item[key];
      
      // Si es un objeto anidado (ej. relación 'bovinos'), extraemos un texto limpio 
      // o lo convertimos a string para que no rompa la estructura de columnas
      if (typeof val === 'object' && val !== null) {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      
      return `"${(val || "").toString().replace(/"/g, '""')}"`;
    }).join(",") // Separado por coma
  );

  // Unir cabecera y filas con saltos de línea
  const csvContent = [headers, ...rows].join("\n");

  // Crear un Blob con codificación UTF-8 y BOM (\uFEFF) para las tildes
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Imprimir / Guardar PDF limpio
export function exportToPDF() {
  if (typeof window !== "undefined") {
    window.print();
  }
}