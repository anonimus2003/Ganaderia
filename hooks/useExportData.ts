import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { exportToCSV } from "@/lib/utils/exportUtils";

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const supabase = createClient(); // 1. Inicializamos el cliente aquí

  const exportAll = async (tableName: string, querySelect: string = '*') => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(querySelect);

      if (error) throw error;
      
      exportToCSV(data as any);
    } catch (error) {
      console.error("Error exportando:", error);
      alert("No se pudieron cargar todos los registros para exportar.");
    } finally {
      setIsExporting(false);
    }
  };

  return { exportAll, isExporting };
}