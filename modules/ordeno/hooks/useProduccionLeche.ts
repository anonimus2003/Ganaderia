'use client';
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProduccionLeche } from "../schemas";

export function useProduccionLeche() {
  const [registros, setRegistros] = useState<ProduccionLeche[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); 
  const [total, setTotal] = useState(0); 
  const supabase = createClient();
  const PAGE_SIZE = 10;

  const fetchRegistros = useCallback(async () => {
    setLoading(true);

    // 1. Obtenemos el total real de registros de leche
    const { count, error: countError } = await supabase
      .from("produccion_leche")
      .select("*", { count: 'exact', head: true });

    if (countError) {
      console.error("Error al contar producción:", countError);
      setTotal(0);
    } else {
      setTotal(count || 0); // Aquí debería detectar tus 4975 registros
    }

    // 2. Rango de la página actual (de 10 en 10)
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 3. Traer los 10 registros correspondientes a esta página con la relación de bovinos
    const { data, error } = await supabase
      .from("produccion_leche")
      .select(`
        *,
        bovinos (
          arete,
          nombre
        )
      `)
      .order("fecha", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error al cargar producción:", error);
    } else {
      setRegistros(data || []);
    }
    setLoading(false);
  }, [supabase, page]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  const handleSave = async (formData: Partial<ProduccionLeche>) => {
    const payload = {
      bovino_id: formData.bovino_id,
      fecha: formData.fecha,
      litros: formData.litros,
      jornada: formData.jornada,
      concentrado_kg: formData.concentrado_kg || 0,
      observaciones: formData.observaciones || null,
    };

    if (formData.id) {
      const { error } = await supabase
        .from("produccion_leche")
        .update(payload)
        .eq("id", formData.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("produccion_leche")
        .insert([payload]);
      if (error) throw error;
    }
    await fetchRegistros();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro de ordeño?")) return;
    const { error } = await supabase.from("produccion_leche").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar");
    } else {
      await fetchRegistros();
    }
  };

  const nextPage = () => setPage(p => ((p + 1) * PAGE_SIZE < total ? p + 1 : p));
  const prevPage = () => setPage(p => Math.max(0, p - 1));

  return { 
    registros, 
    loading, 
    handleSave, 
    handleDelete, 
    page, 
    total, 
    nextPage, 
    prevPage, 
    PAGE_SIZE 
  };
}