'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bovino, RegistroOrdeno, RegistroPeso, AlertaAnimal } from '../types/dashboard'

export function useDashboardData() {
  const supabase = createClient()

  const [totalAnimales, setTotalAnimales] = useState(0)
  const [totalPotreros, setTotalPotreros] = useState(0)
  const [listaBovinos, setListaBovinos] = useState<Bovino[]>([])
  const [vacaSeleccionada, setVacaSeleccionada] = useState<string>('')
  
  const [registrosOrdeno, setRegistrosOrdeno] = useState<RegistroOrdeno[]>([])
  const [registrosPeso, setRegistrosPeso] = useState<RegistroPeso[]>([])
  const [alertasAnimal, setAlertasAnimal] = useState<AlertaAnimal[]>([])
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null)

  // Cargar datos generales y lista de bovinos
  useEffect(() => {
    async function init() {
      try {
        const [{ count: countAnim }, { count: countPot }] = await Promise.all([
          supabase.from('bovinos').select('*', { count: 'exact', head: true }),
          supabase.from('potreros').select('*', { count: 'exact', head: true })
        ])

        setTotalAnimales(countAnim || 0)
        setTotalPotreros(countPot || 0)

        const { data: bovinos, error } = await supabase
          .from('bovinos')
          .select('id, nombre, arete')

        if (error) throw error

        if (bovinos && bovinos.length > 0) {
          setListaBovinos(bovinos)
          setVacaSeleccionada(String(bovinos[0].id))
        } else {
          setErrorSupabase("No hay bovinos registrados en la base de datos.")
        }
      } catch (err: any) {
        setErrorSupabase(err.message)
      }
    }
    init()
  }, [])

  // Cargar historial del bovino seleccionado
  useEffect(() => {
    if (!vacaSeleccionada) return

    async function cargarHistorial() {
      const [{ data: ordeno }, { data: pesajes }] = await Promise.all([
        supabase.from('ordeño').select('fecha, litros, jornada').eq('bovino_id', vacaSeleccionada).order('fecha', { ascending: true }),
        supabase.from('pesajes').select('fecha, peso_kgs').eq('bovino_id', vacaSeleccionada).order('fecha', { ascending: true })
      ])

      setRegistrosOrdeno(ordeno || [])
      setRegistrosPeso(pesajes || [])

      // Análisis de alertas de rendimiento
      const alertas: AlertaAnimal[] = []
      if (ordeno && ordeno.length >= 2) {
        const ultimo = Number(ordeno[ordeno.length - 1].litros)
        const anterior = Number(ordeno[ordeno.length - 2].litros)
        if (ultimo < anterior * 0.7) {
          alertas.push({ tipo: 'produccion', mensaje: 'Alerta de rendimiento: Caída abrupta mayor al 30% en el último ordeño.' })
        }
      }
      setAlertasAnimal(alertas)
    }

    cargarHistorial()
  }, [vacaSeleccionada])

  return {
    totalAnimales,
    totalPotreros,
    listaBovinos,
    vacaSeleccionada,
    setVacaSeleccionada,
    registrosOrdeno,
    registrosPeso,
    alertasAnimal,
    errorSupabase
  }
}