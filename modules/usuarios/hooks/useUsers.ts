'use client';

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Perfil {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: string;
  creado_en: string; // 👈 Corregido al nombre real de tu base de datos
}

export function useUsers(pageSize: number = 10) {
  const [users, setUsers] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const supabase = createClient();

  const fetchUsers = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, count, error: err } = await supabase
        .from("perfiles")
        .select("*", { count: "exact" })
        .order("creado_en", { ascending: false }) // 👈 Apunta a la columna correcta
        .range(from, to);

      if (err) {
        console.error("Error de Supabase:", err.message);
        setError(err.message);
      } else {
        setUsers(data || []);
        setTotal(count || 0);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize, supabase]);

  useEffect(() => { 
    fetchUsers(page); 
  }, [fetchUsers, page]);

  return { 
    users, 
    loading, 
    error, 
    page, 
    total, 
    pageSize, 
    nextPage: () => setPage(p => p + 1), 
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    refetch: () => fetchUsers(page),
    deleteUser: async (id: string) => { 
      await supabase.from("perfiles").delete().eq("id", id);
      fetchUsers(page);
    }
  };
}