import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { exportToCSV } from "@/lib/utils/exportUtils";

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const supabase = createClient(); 

  /**
   * Opción A: Consulta directo a cualquier tabla de Supabase (ideal para exportaciones masivas).
   */
  const exportFromTable = async (tableName: string, querySelect: string = '*', filename?: string) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(querySelect);

      if (error) throw error;
      
      exportToCSV(data as any[], `${tableName}_export.csv`);
    } catch (error) {
      console.error(`Error exportando la tabla ${tableName}:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Opción B: Exporta los datos que ya están filtrados y en pantalla en el cliente.
   */
  const exportLocalData = (data: any[], filename = "datos_filtrados.csv") => {
    if (!data || data.length === 0) return;
    exportToCSV(data, filename);
  };

  return { exportFromTable, exportLocalData, isExporting };
}