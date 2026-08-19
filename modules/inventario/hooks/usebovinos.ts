'use client';

import { useState, useEffect, useCallback } from "react";
import { Bovino } from "../schemas";
import { createClient } from "@/lib/supabase/client";

export function useBovinos() {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [allBovinos, setAllBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const supabase = createClient();
  const PAGE_SIZE = 10;

  const fetchBovinos = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener conteo
      const { count } = await supabase
        .from("bovinos")
        .select("*", { count: 'exact', head: true });
      setTotal(count || 0);

      // 2. Consulta PLANA (sin JOINs para evitar errores de RLS o Foreign Keys faltantes)
      const { data: dataAll, error: errorAll } = await supabase
        .from("bovinos")
        .select("*")
        .order("arete", { ascending: true });

      if (errorAll) console.error("Error cargando lista completa:", errorAll);
      setAllBovinos(dataAll || []);

      // 3. Paginación
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

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
      const esEdicion = Boolean(bovinoData.id);

      const { error } = esEdicion
        ? await supabase.from("bovinos").update(bovinoData).eq("id", bovinoData.id)
        : await supabase.from("bovinos").insert([bovinoData]);

      if (error) throw error;

      // Mensaje dinámico si se editó o se creó nuevo
      alert(esEdicion ? "¡Bovino actualizado exitosamente!" : "¡Bovino registrado exitosamente!");
      
      await fetchBovinos();
    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const handleDelete = async (id: string, arete: string) => {
    if (confirm(`¿Estás seguro de eliminar el bovino con arete ${arete}?`)) {
      try {
        const { error } = await supabase.from("bovinos").delete().eq("id", id);
        if (error) throw error;
        
        alert("¡Bovino eliminado exitosamente!");
        await fetchBovinos();
      } catch (error: any) {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  return {
    bovinos,
    allBovinos,
    loading,
    handleSave,
    handleDelete,
    refresh: fetchBovinos,
    page,
    total,
    nextPage: () => setPage(p => ((p + 1) * PAGE_SIZE < total ? p + 1 : p)),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
    PAGE_SIZE,
  };
}