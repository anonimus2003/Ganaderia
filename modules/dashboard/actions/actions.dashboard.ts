'use server'

import { createClient } from '@/lib/supabase/server' // O tu cliente server-side

export async function registrarNuevoPesaje(bovinoId: string, pesoKgs: number, fecha: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('pesajes')
    .insert([{ bovino_id: bovinoId, peso_kgs: pesoKgs, fecha }])

  if (error) {
    throw new Error(`Error al registrar peso: ${error.message}`)
  }
  return { success: true }
}