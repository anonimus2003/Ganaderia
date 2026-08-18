'use client';
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pesaje } from "../schemas";

export function usePesajes() {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pesoPromedio, setPesoPromedio] = useState<number>(0);
  
  const supabase = createClient();
  const PAGE_SIZE = 10;

  const fetchPesajes = useCallback(async () => {
    setLoading(true);

    // 1. Obtener conteo total para la paginación
    const { count, error: countError } = await supabase
      .from("pesajes")
      .select("*", { count: 'exact', head: true });

    if (countError) {
      console.error("Error al contar pesajes:", countError);
      setTotal(0);
    } else {
      setTotal(count || 0);
    }

    // 1.1. Obtener el peso promedio global mediante función o cálculo
    const { data: promData, error: promError } = await supabase.rpc('obtener_peso_promedio');
    if (!promError && promData !== null) {
      setPesoPromedio(Number(promData));
    }

    // 2. Rango de paginación
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 3. Traer los registros con relación a bovinos
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
      console.error("Error al cargar pesajes:", error);
    } else {
      setPesajes(data || []);
    }
    setLoading(false);
  }, [supabase, page]);

  useEffect(() => {
    fetchPesajes();
  }, [fetchPesajes]);

  const handleSave = async (formData: Partial<Pesaje>) => {
    const payload = {
      bovino_id: formData.bovino_id,
      fecha: formData.fecha,
      peso_kgs: formData.peso_kgs,
      condicion_corporal: formData.condicion_corporal ?? null,
      estado_fisiologico: formData.estado_fisiologico ?? null,
      observaciones: formData.observaciones ?? null,
    };

    if (formData.id) {
      const { error } = await supabase
        .from("pesajes")
        .update(payload)
        .eq("id", formData.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("pesajes")
        .insert([payload]);
      if (error) throw error;
    }
    await fetchPesajes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro de pesaje?")) return;
    const { error } = await supabase.from("pesajes").delete().eq("id", id);
    if (error) {
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
    pesoPromedio,
    nextPage,
    prevPage,
    PAGE_SIZE,
  };
}