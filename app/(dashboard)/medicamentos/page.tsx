'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Bovino {
  id: string
  arete: string
  nombre: string | null
  raza: string
}

interface Tratamiento {
  id: string
  bovino_id: string
  medicamento: string
  dosis: string
  via: 'Intramuscular' | 'Subcutánea' | 'Oral' | 'Tópica'
  fecha_aplicacion: string
  tiempo_retiro: number
  veterinario: string
  motivo: string | null
  bovinos?: {
    arete: string
    nombre: string | null
    raza: string
  }
}

export default function MedicamentosPage() {
  // Inicializamos el cliente de Supabase dentro del componente o usamos una instancia fija
  const supabase = createClient()

  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [bovinos, setBovinos] = useState<Bovino[]>([])
  const [loading, setLoading] = useState(true)

  // Estados del formulario
  const [bovinoId, setBovinoId] = useState('')
  const [medicamento, setMedicamento] = useState('')
  const [dosis, setDosis] = useState('')
  const [via, setVia] = useState<'Intramuscular' | 'Subcutánea' | 'Oral' | 'Tópica'>('Intramuscular')
  const [fechaAplicacion, setFechaAplicacion] = useState('')
  const [tiempoRetiro, setTiempoRetiro] = useState('')
  const [veterinario, setVeterinario] = useState('')
  const [motivo, setMotivo] = useState('')

  // Cargar datos al iniciar
  useEffect(() => {
    fetchDatos()
  }, [])

  const fetchDatos = async () => {
    setLoading(true)
    try {
      // 1. Obtener lista de bovinos para el selector
      const { data: bovinosData, error: bovinosError } = await supabase
        .from('bovinos')
        .select('id, arete, nombre, raza')
        .order('arete', { ascending: true })

      if (bovinosError) throw bovinosError
      if (bovinosData) setBovinos(bovinosData)

      // 2. Obtener tratamientos con información del bovino asociado
      const { data: tratamientosData, error: tratamientosError } = await supabase
        .from('tratamientos')
        .select(`
          *,
          bovinos (
            arete,
            nombre,
            raza
          )
        `)
        .order('fecha_aplicacion', { ascending: false })

      if (tratamientosError) throw tratamientosError
      if (tratamientosData) setTratamientos(tratamientosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para evaluar si el animal sigue en periodo de retiro (cuarentena)
  const evaluarEstadoRetiro = (fechaAplicacionStr: string, diasRetiro: number) => {
    if (diasRetiro === 0) return { label: 'Sin Restricción', colorBg: '#f0fdf4', colorText: '#16a34a' }

    const fechaAplicacion = new Date(fechaAplicacionStr)
    const fechaLimite = new Date(fechaAplicacion)
    fechaLimite.setDate(fechaLimite.getDate() + diasRetiro)
    
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    fechaLimite.setHours(0, 0, 0, 0)

    if (hoy <= fechaLimite) {
      const msDiferencia = fechaLimite.getTime() - hoy.getTime()
      const diasRestantes = Math.ceil(msDiferencia / (1000 * 60 * 60 * 24))
      return { 
        label: `🚫 Retiro Activo (${diasRestantes}d rest.)`, 
        colorBg: '#fef2f2', 
        colorText: '#ef4444' 
      }
    }

    return { label: '✅ Liberado', colorBg: '#f0fdf4', colorText: '#16a34a' }
  }

  // Manejar el envío del formulario a Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bovinoId || !medicamento || !dosis || !fechaAplicacion || !veterinario) return

    const nuevoTratamiento = {
      bovino_id: bovinoId,
      medicamento,
      dosis,
      via,
      fecha_aplicacion: fechaAplicacion,
      tiempo_retiro: tiempoRetiro ? parseInt(tiempoRetiro) : 0,
      veterinario,
      motivo: motivo.trim() || null
    }

    const { error } = await supabase.from('tratamientos').insert([nuevoTratamiento])

    if (error) {
      alert('Hubo un error al guardar el tratamiento: ' + error.message)
      console.error(error)
      return
    }

    // Limpiar campos del formulario
    setBovinoId('')
    setMedicamento('')
    setDosis('')
    setFechaAplicacion('')
    setTiempoRetiro('')
    setVeterinario('')
    setMotivo('')
    
    // Refrescar la tabla y métricas
    fetchDatos()
  }

  // Métricas calculadas dinámicamente
  const totalRegistros = tratamientos.length
  const enRetiroCount = tratamientos.filter(tr => {
    const estado = evaluarEstadoRetiro(tr.fecha_aplicacion, tr.tiempo_retiro)
    return estado.colorText === '#ef4444'
  }).length

  return (
    <div style={{ padding: '24px', boxSizing: 'border-box', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Botón de regreso y Encabezado */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          ← Volver al Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#09090b', letterSpacing: '-0.5px' }}>
          💉 Sanidad y Medicamentos
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#71717a' }}>
          Lleva el registro de tratamientos clínicos, diagnósticos y control estricto de tiempos de retiro sincronizado con Supabase.
        </p>
      </div>

      {/* Tarjetas de Métricas Sanitarias */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase' }}>Tratamientos Totales</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#09090b' }}>{totalRegistros} registros</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#71717a' }}>Historial clínico general</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase' }}>En Tiempo de Retiro</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>{enRetiroCount} animal(es)</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#ef4444', fontWeight: '500' }}>⚠️ Leche/Carne no apta para consumo</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase' }}>Bovinos Registrados</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#2563eb' }}>{bovinos.length} total</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#71717a' }}>Disponibles para tratamiento</p>
        </div>
      </div>

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        
        {/* TABLA DE TRATAMIENTOS */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e4e4e7', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09090b' }}>Historial Clínico de Aplicaciones</h3>
            <span style={{ fontSize: '12px', color: '#71717a', fontWeight: '500' }}>{tratamientos.length} registros</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Bovino (Arete)</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Medicamento / Dosis</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Vía Adm.</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Diagnóstico / Motivo</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Fecha Aplic.</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a', textAlign: 'center' }}>Estado Retiro</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#71717a' }}>Cargando historial clínico...</td>
                  </tr>
                ) : tratamientos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#71717a' }}>No hay tratamientos registrados todavía.</td>
                  </tr>
                ) : (
                  tratamientos.map((tr) => {
                    const estadoRetiro = evaluarEstadoRetiro(tr.fecha_aplicacion, tr.tiempo_retiro)
                    return (
                      <tr key={tr.id} style={{ borderBottom: '1px solid #f4f4f5', transition: 'background-color 0.15s ease' }}>
                        <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                          <span style={{ fontWeight: '700', color: '#09090b', display: 'block' }}>{tr.bovinos?.arete || 'S/N'}</span>
                          <span style={{ fontSize: '12px', color: '#71717a' }}>{tr.bovinos?.nombre ? `${tr.bovinos.nombre} (${tr.bovinos.raza})` : tr.bovinos?.raza || ''}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                          <span style={{ fontWeight: '600', color: '#27272a', display: 'block' }}>{tr.medicamento}</span>
                          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Cant: {tr.dosis}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#27272a' }}>{tr.via}</td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#52525b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tr.motivo || 'N/A'}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '14px', color: '#27272a' }}>{tr.fecha_aplicacion}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            backgroundColor: estadoRetiro.colorBg, 
                            color: estadoRetiro.colorText, 
                            fontWeight: '700',
                            fontSize: '11px',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            {estadoRetiro.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REGISTRO DE TRATAMIENTO */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e4e4e7', 
          borderRadius: '16px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#09090b' }}>💉 Aplicar Tratamiento</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Selector de Bovino */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Seleccionar Bovino</label>
              <select 
                value={bovinoId} 
                onChange={(e) => setBovinoId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                required 
              >
                <option value="">-- Seleccione un animal --</option>
                {bovinos.map((b) => (
                  <option key={b.id} value={b.id}>
                    Arete: {b.arete} {b.nombre ? `- ${b.nombre}` : ''} ({b.raza})
                  </option>
                ))}
              </select>
            </div>

            {/* Medicamento */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Medicamento / Biológico</label>
              <input 
                type="text" 
                placeholder="Ej. Penicilina G" 
                value={medicamento} 
                onChange={(e) => setMedicamento(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>

            {/* Dosis y Vía de Administración */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Dosis</label>
                <input 
                  type="text" 
                  placeholder="Ej. 15 ml" 
                  value={dosis} 
                  onChange={(e) => setDosis(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Vía</label>
                <select 
                  value={via} 
                  onChange={(e) => setVia(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                >
                  <option value="Intramuscular">Intramuscular</option>
                  <option value="Subcutánea">Subcutánea</option>
                  <option value="Oral">Oral</option>
                  <option value="Tópica">Tópica</option>
                </select>
              </div>
            </div>

            {/* Fecha y Tiempo de Retiro */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Fecha Aplicación</label>
                <input 
                  type="date" 
                  value={fechaAplicacion} 
                  onChange={(e) => setFechaAplicacion(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Retiro (Días)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="Ej. 5" 
                  value={tiempoRetiro} 
                  onChange={(e) => setTiempoRetiro(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Veterinario */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Responsable / Veterinario</label>
              <input 
                type="text" 
                placeholder="Ej. Dr. Felipe Restrepo" 
                value={veterinario} 
                onChange={(e) => setVeterinario(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>

            {/* Diagnóstico / Motivo */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Diagnóstico / Motivo</label>
              <textarea 
                placeholder="Ej. Presenta mastitis en cuarto trasero izquierdo." 
                value={motivo} 
                onChange={(e) => setMotivo(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '60px' }}
              />
            </div>

            <button 
              type="submit" 
              style={{
                backgroundColor: '#09090b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '8px',
                transition: 'background-color 0.15s'
              }}
            >
              Registrar Aplicación
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}