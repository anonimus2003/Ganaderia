import { createClient } from "@/lib/supabase/client";
import { Bovino, ProduccionLeche, Tratamiento, RegistroActividad } from "../tipos";

const supabase = createClient();

export async function obtenerBovinos(): Promise<Bovino[]> {
  const { data, error } = await supabase
    .from("bovinos")
    .select("id, arete, nombre, raza, genero, peso_inicial, estado")
    .order("arete", { ascending: true });

  if (error) throw new Error(`Error al cargar bovinos: ${error.message}`);
  return data || [];
}

export async function obtenerProduccion(bovinoId?: string): Promise<ProduccionLeche[]> {
  let query = supabase
    .from("produccion_leche")
    .select("*")
    .order("fecha", { ascending: true });

  if (bovinoId) query = query.eq("bovino_id", bovinoId);

  const { data, error } = await query;

  if (error) throw new Error(`Error al cargar producción: ${error.message}`);
  return data || [];
}

// Usando la función SQL de Supabase (RPC)
export async function obtenerTotalLitrosHistorico(): Promise<number> {
  const { data, error } = await supabase.rpc("obtener_suma_total_litros");

  if (error) {
    throw new Error(`Error al calcular total histórico: ${error.message}`);
  }

  return Number(data) || 0;
}

export async function obtenerTratamientos(): Promise<Tratamiento[]> {
  const { data, error } = await supabase
    .from("tratamientos")
    .select("*")
    .order("fecha_aplicacion", { ascending: false });

  if (error) throw new Error(`Error al cargar tratamientos: ${error.message}`);
  return data || [];
}

export async function obtenerActividadReciente(): Promise<RegistroActividad[]> {
  const { data, error } = await supabase
    .from("registros_actividad")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(`Error al cargar actividad: ${error.message}`);
  return data || [];
}