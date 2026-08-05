'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bovino } from '../schemas';

export function useInventario() {
  const supabase = createClient();
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedEstado, setSelectedEstado] = useState<string>("Todos");
  const [selectedGenero, setSelectedGenero] = useState<string>("Todos");

  const [selectedBovino, setSelectedBovino] = useState<Bovino | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<Bovino>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchBovinos();
  }, []);

  const fetchBovinos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bovinos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setBovinos(data || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredBovinos = bovinos.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.arete.toLowerCase().includes(term) ||
      (item.nombre && item.nombre.toLowerCase().includes(term)) ||
      item.raza.toLowerCase().includes(term);

    const matchesEstado = selectedEstado === "Todos" || item.estado === selectedEstado;
    const matchesGenero = selectedGenero === "Todos" || item.genero === selectedGenero;

    return matchesSearch && matchesEstado && matchesGenero;
  });

  return {
    bovinos,
    filteredBovinos,
    loading,
    searchTerm,
    setSearchTerm,
    selectedEstado,
    setSelectedEstado,
    selectedGenero,
    setSelectedGenero,
    selectedBovino,
    setSelectedBovino,
    isDetailOpen,
    setIsDetailOpen,
    isEditOpen,
    setIsEditOpen,
    editFormData,
    setEditFormData,
    isSubmitting,
    setIsSubmitting,
    fetchBovinos,
    setBovinos
  };
}