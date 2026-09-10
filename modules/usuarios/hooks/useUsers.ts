import { useState, useEffect } from "react";
import { Usuario } from "../schemas";
import { getUsuarios } from "../actions/userActions";

export function useUsuarios() {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await getUsuarios();
      if (res.success && res.data) {
        setData(res.data); // <-- Extraer el arreglo .data
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    data,
    loading,
    page,
    pageSize,
    total: data.length,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    refresh: fetchUsuarios,
  };
}