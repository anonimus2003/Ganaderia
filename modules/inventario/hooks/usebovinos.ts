'use client';
import { useState, useEffect, useCallback } from "react";
import { Bovino } from "../schemas";
import { createClient } from "@/lib/supabase/client"; // Asegúrate de importar tu cliente de supabase si usas llamadas directas, o ajusta según tus actions

export function useBovinos() {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const supabase = createClient();
  const PAGE_SIZE = 10;

  const fetchBovinos = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener el conteo total de bovinos
      const { count, error: countError } = await supabase
        .from("bovinos")
        .select("*", { count: 'exact', head: true });

      if (!countError) {
        setTotal(count || 0);
      }

      // 2. Calcular rango para la página actual
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // 3. Obtener solo los 10 registros de la página
      const { data, error } = await supabase
        .from("bovinos")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setBovinos(data || []);
    } catch (error) {
      console.error("Error al cargar bovinos:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, page]);

  useEffect(() => {
    fetchBovinos();
  }, [fetchBovinos]);

  const handleSave = async (bovinoData: Partial<Bovino>) => {
    try {
      // Aquí puedes seguir usando tu action saveBovino(bovinoData)
      const { error } = bovinoData.id 
        ? await supabase.from("bovinos").update(bovinoData).eq("id", bovinoData.id)
        : await supabase.from("bovinos").insert([bovinoData]);

      if (error) throw error;
      await fetchBovinos(); // Recargar lista y conteo
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const handleDelete = async (id: string, arete: string) => {
    if (confirm(`¿Estás seguro de eliminar el bovino con arete ${arete}?`)) {
      try {
        const { error } = await supabase.from("bovinos").delete().eq("id", id);
        if (error) throw error;
        await fetchBovinos(); // Recargar para ajustar la paginación correctamente
      } catch (error: any) {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  // Funciones de navegación
  const nextPage = () => setPage(p => ((p + 1) * PAGE_SIZE < total ? p + 1 : p));
  const prevPage = () => setPage(p => Math.max(0, p - 1));

  return {
    bovinos,
    loading,
    handleSave,
    handleDelete,
    refresh: fetchBovinos,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
  };
}