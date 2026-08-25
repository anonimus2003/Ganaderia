import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tratamiento } from "../schemas";

const PAGE_SIZE = 10;

export function useTratamientos() {
  const [tratamientos, setTratamientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const supabase = createClient();

  const fetchTratamientos = useCallback(async (currentPage: number) => {
    setLoading(true);
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("tratamientos")
      .select("*, bovinos(id, arete, nombre)", { count: "exact" })
      .order("fecha_aplicacion", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error al cargar tratamientos:", error);
    } else {
      setTratamientos(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTratamientos(page);
  }, [page, fetchTratamientos]);

  const handleSave = async (data: Partial<Tratamiento>) => {
    const { id, ...payload } = data; // Extraemos el id y dejamos el resto limpio para la base de datos

    if (id) {
      // Actualizar registro existente
      const { error } = await supabase
        .from("tratamientos")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      // Insertar nuevo registro (Supabase colocará 'creado_por' y 'created_at' solos)
      const { error } = await supabase
        .from("tratamientos")
        .insert([payload]);
      if (error) throw error;
    }
    
    fetchTratamientos(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro de tratamiento?")) return;
    const { error } = await supabase.from("tratamientos").delete().eq("id", id);
    if (error) {
      console.error("Error al eliminar:", error);
    } else {
      fetchTratamientos(page);
    }
  };

  const nextPage = () => {
    if (page * PAGE_SIZE < total) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  return {
    tratamientos,
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