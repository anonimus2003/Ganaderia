// Exportar a CSV de forma dinámica y robusta para cualquier tabla o módulo
export function exportToCSV(data: any[], filename = "exportacion.csv") {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  // Extrae dinámicamente las llaves del primer objeto como cabeceras
  const keys = Object.keys(data[0]);
  const headers = keys.join(";");

  // Mapea las filas de forma segura
  const rows = data.map(item => 
    keys.map(key => {
      const val = item[key];
      
      // Si es un objeto anidado (ej. relaciones de Supabase como 'bovinos'), lo convertimos a texto limpio
      if (typeof val === 'object' && val !== null) {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      
      return `"${(val || "").toString().replace(/"/g, '""')}"`;
    }).join(";")
  );

  // Unir contenido con punto y coma (;) para Excel
  const csvContent = [headers, ...rows].join("\n");

  // Crear un Blob con codificación UTF-8 para reconocer tildes y eñes correctamente
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  
  // Limpiar el recurso creado
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Imprimir / Guardar PDF limpio (solo los datos de la tabla)
export function exportToPDF() {
  if (typeof window !== "undefined") {
    window.print();
  }
}