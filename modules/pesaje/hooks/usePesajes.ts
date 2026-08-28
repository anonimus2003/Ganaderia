'use client';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pesaje } from "../schemas";

export function usePesajes() {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  
  const supabase = createClient();
  const PAGE_SIZE = 10;

  const fetchPesajes = useCallback(async () => {
    setLoading(true);

    const { count, error: countError } = await supabase
      .from("pesajes")
      .select("*", { count: 'exact', head: true });

    if (countError) {
      console.error("Error al contar pesajes:", countError);
      setTotal(0);
    } else {
      setTotal(count || 0);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Consulta simplificada y segura sin alias complejos de join
    const { data, error } = await supabase
      .from("pesajes")
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
      console.error("Error crítico al cargar pesajes desde Supabase:", error);
    } else {
      console.log("Pesajes cargados exitosamente:", data);
      setPesajes((data as unknown as Pesaje[]) || []);
    }
    setLoading(false);
  }, [supabase, page]);

  useEffect(() => {
    fetchPesajes();
  }, [fetchPesajes]);

  const handleSave = async (formData: Partial<Pesaje>) => {
    if (formData.id) {
      const { error } = await supabase
        .from("pesajes")
        .update({
          bovino_id: formData.bovino_id,
          fecha: formData.fecha,
          peso_kgs: formData.peso_kgs,
          condicion_corporal: formData.condicion_corporal ?? null,
          estado_fisiologico: formData.estado_fisiologico ?? null,
          observaciones: formData.observaciones ?? null,
        })
        .eq("id", formData.id);
      
      if (error) {
        console.error("Error en UPDATE de Supabase:", error);
        throw error;
      }
    } else {
      const { id, ...payloadWithoutId } = formData;
      
      const { error } = await supabase
        .from("pesajes")
        .insert([payloadWithoutId]);
      
      if (error) {
        console.error("Error en INSERT de Supabase:", error);
        throw error;
      }
    }
    
    // Recargamos de inmediato tras guardar
    await fetchPesajes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro de pesaje?")) return;
    const { error } = await supabase.from("pesajes").delete().eq("id", id);
    if (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar");
    } else {
      await fetchPesajes();
    }
  };

  const nextPage = () => setPage(p => ((p + 1) * PAGE_SIZE < total ? p + 1 : p));
  const prevPage = () => setPage(p => Math.max(0, p - 1));

  return {
    pesajes,
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    pesoPromedio: 0,
    nextPage,
    prevPage,
    PAGE_SIZE,
  };
}