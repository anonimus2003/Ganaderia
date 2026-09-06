/**
 * Exporta un arreglo de datos a formato CSV.
 */
export function exportToCSV(data: any[], filename = "export_data.csv") {
  if (!data || data.length === 0) {
    console.warn("Intento de exportar datos vacíos.");
    return;
  }

  const keys = Object.keys(data[0]);

  const rows = data.map(item => 
    keys.map(key => {
      const val = item[key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(";")
  );

  const csvContent = [
    keys.join(";"),
    ...rows
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta un arreglo de datos a formato PDF.
 * (Aquí puedes implementar tu lógica con jsPDF o la librería que uses para PDFs).
 */
export function exportToPDF(data: any[]) {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar a PDF.");
    return;
  }
  
  // Lógica temporal o definitiva de tu PDF
  console.log("Generando PDF con datos:", data);
  alert("Exportación a PDF en desarrollo o lista para integrar con jsPDF.");
}