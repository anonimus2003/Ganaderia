'use client';

import { useState, useEffect, useCallback } from 'react';
// import { createClient } from '@/utils/supabase/client';
import { Pesaje } from '../schemas';

export function usePesajes() {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPesajes = useCallback(async () => {
    try {
      setLoading(true);
      // const supabase = createClient();
      // const { data, error } = await supabase.from('pesajes').select('*, bovinos(arete, nombre)');
      // if (error) throw error;
      // if (data) setPesajes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPesajes();
  }, [fetchPesajes]);

  return {
    pesajes,
    loading,
    error,
    recargarPesajes: fetchPesajes,
  };
}