'use client';
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Inseminacion } from "../schemas";

export function useInseminaciones() {
  const [inseminaciones, setInseminaciones] = useState<Inseminacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  
  const supabase = createClient();
  const PAGE_SIZE = 10;

  const fetchInseminaciones = useCallback(async () => {
    setLoading(true);

    // 1. Obtener conteo total para la paginación
    const { count, error: countError } = await supabase
      .from("inseminaciones")
      .select("*", { count: 'exact', head: true });

    if (countError) {
      console.error("Error al contar inseminaciones:", countError);
      setTotal(0);
    } else {
      setTotal(count || 0);
    }

    // 2. Rango de paginación
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 3. Traer los registros con relación a bovinos
    const { data, error } = await supabase
      .from("inseminaciones")
      .select(`
        *,
        bovinos (
          arete,
          nombre
        )
      `)
      .order("fecha_inseminacion", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error al cargar inseminaciones:", error);
    } else {
      setInseminaciones(data || []);
    }
    setLoading(false);
  }, [supabase, page]);

  useEffect(() => {
    fetchInseminaciones();
  }, [fetchInseminaciones]);

  const handleSave = async (formData: Partial<Inseminacion>) => {
    const payload = {
      bovino_id: formData.bovino_id,
      toro_pajilla: formData.toro_pajilla,
      raza_toro: formData.raza_toro || null,
      numero_servicios: formData.numero_servicios || 1,
      tipo: formData.tipo || 'I.A.',
      fecha_inseminacion: formData.fecha_inseminacion,
      fecha_chequeo: formData.fecha_chequeo || null,
      fecha_probable_parto: formData.fecha_probable_parto || null,
      tecnico: formData.tecnico,
      estado: formData.estado || 'Pendiente',
    };

    if (formData.id) {
      const { error } = await supabase
        .from("inseminaciones")
        .update(payload)
        .eq("id", formData.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("inseminaciones")
        .insert([payload]);
      if (error) throw error;
    }
    await fetchInseminaciones();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro reproductivo?")) return;
    const { error } = await supabase.from("inseminaciones").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar");
    } else {
      await fetchInseminaciones();
    }
  };

  const nextPage = () => setPage(p => ((p + 1) * PAGE_SIZE < total ? p + 1 : p));
  const prevPage = () => setPage(p => Math.max(0, p - 1));

  return {
    inseminaciones,
    loading,
    handleSave,
    handleDelete,
    page,
    total,
    nextPage,
    prevPage,
    PAGE_SIZE,
  };
}