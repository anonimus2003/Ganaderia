// app/dashboard/inseminacion/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface Inseminacion {
  id: string
  areteVaca: string
  nombreVaca: string
  toroPajilla: string // Código de la pajilla o nombre del toro
  tipo: 'I.A.' | 'Monta Natural'
  fechaInseminacion: string
  fechaChequeo: string // Fecha tentativa para palpación/eco (ej. +60 días)
  tecnico: string
  estado: 'Pendiente' | 'Confirmada' | 'Fallida'
}

export default function InseminacionPage() {
  // Datos mock iniciales
  const [registros, setRegistros] = useState<Inseminacion[]>([
    {
      id: '1',
      areteVaca: '#0142',
      nombreVaca: 'Clavelina',
      toroPajilla: 'GIR-840 (Gyr)',
      tipo: 'I.A.',
      fechaInseminacion: '2026-05-10',
      fechaChequeo: '2026-07-10',
      tecnico: 'Carlos Gómez',
      estado: 'Confirmada'
    },
    {
      id: '2',
      areteVaca: '#0085',
      nombreVaca: 'Mariposa',
      toroPajilla: 'HOL-120 (Holstein)',
      tipo: 'I.A.',
      fechaInseminacion: '2026-06-15',
      fechaChequeo: '2026-08-15',
      tecnico: 'Andrés López',
      estado: 'Pendiente'
    },
    {
      id: '3',
      areteVaca: '#0204',
      nombreVaca: 'Estrella',
      toroPajilla: 'JER-099 (Jersey)',
      tipo: 'I.A.',
      fechaInseminacion: '2026-04-01',
      fechaChequeo: '2026-06-01',
      tecnico: 'Carlos Gómez',
      estado: 'Fallida'
    }
  ])

  // Estados del formulario
  const [areteVaca, setAreteVaca] = useState('')
  const [nombreVaca, setNombreVaca] = useState('')
  const [toroPajilla, setToroPajilla] = useState('')
  const [tipo, setTipo] = useState<'I.A.' | 'Monta Natural'>('I.A.')
  const [fechaInseminacion, setFechaInseminacion] = useState('')
  const [tecnico, setTecnico] = useState('')

  // Manejar el registro
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!areteVaca || !nombreVaca || !toroPajilla || !fechaInseminacion || !tecnico) return

    // Calcular fecha automática de chequeo tentativo (+60 días)
    const fechaInsemObj = new Date(fechaInseminacion)
    fechaInsemObj.setDate(fechaInsemObj.getDate() + 60)
    const chequeoCalculado = fechaInsemObj.toISOString().split('T')[0]

    const nuevoRegistro: Inseminacion = {
      id: Date.now().toString(),
      areteVaca,
      nombreVaca,
      toroPajilla,
      tipo,
      fechaInseminacion,
      fechaChequeo: chequeoCalculado,
      tecnico,
      estado: 'Pendiente'
    }

    setRegistros([nuevoRegistro, ...registros])

    // Limpiar formulario
    setAreteVaca('')
    setNombreVaca('')
    setToroPajilla('')
    setFechaInseminacion('')
    setTecnico('')
  }

  // Helper para renderizar los badges de estado
  const renderEstadoBadge = (estado: 'Pendiente' | 'Confirmada' | 'Fallida') => {
    let bgColor = '#fff7ed'
    let textColor = '#c2410c'
    let text = '⏳ Pendiente'

    if (estado === 'Confirmada') {
      bgColor = '#f0fdf4'
      textColor = '#16a34a'
      text = '🤰 Confirmada'
    } else if (estado === 'Fallida') {
      bgColor = '#fef2f2'
      textColor = '#ef4444'
      text = '❌ Vacía / Repitió'
    }

    return (
      <span style={{ 
        padding: '6px 12px', 
        borderRadius: '20px', 
        backgroundColor: bgColor, 
        color: textColor, 
        fontWeight: '700',
        fontSize: '12px',
        display: 'inline-block',
        whiteSpace: 'nowrap'
      }}>
        {text}
      </span>
    )
  }

  return (
    <div style={{ padding: '24px', boxSizing: 'border-box', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Botón de regreso y Encabezado */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          ← Volver al Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#09090b', letterSpacing: '-0.5px' }}>
          🧬 Reproducción e Inseminación
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#71717a' }}>
          Gestión de montas, inseminación artificial (I.A.) y seguimiento de preñeces.
        </p>
      </div>

      {/* Tarjetas de Métricas de Reproducción */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase' }}>Tasa de Concepción</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#16a34a' }}>64%</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#71717a' }}>Efectividad de preñez del hato</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase' }}>Días Abiertos Prom.</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#09090b' }}>115 días</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#71717a' }}>Intervalo parto-concepción</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase' }}>Servicios por Concepción</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#d97706' }}>1.6</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#71717a' }}>Pajillas promedio por preñez</p>
        </div>
      </div>

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        
        {/* TABLA DE REGISTROS DE INSEMINACIÓN */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e4e4e7', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09090b' }}>Historial Reproductivo</h3>
            <span style={{ fontSize: '12px', color: '#71717a', fontWeight: '500' }}>{registros.length} Registros totales</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Hembra (Arete)</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Toro / Pajilla</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Tipo</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Fecha Serv.</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Chequeo Preñez</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a' }}>Inseminador</th>
                  <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: '#71717a', textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id} style={{ borderBottom: '1px solid #f4f4f5', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                      <span style={{ fontWeight: '700', color: '#09090b', display: 'block' }}>{registro.areteVaca}</span>
                      <span style={{ fontSize: '12px', color: '#71717a' }}>{registro.nombreVaca}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#27272a' }}>{registro.toroPajilla}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        backgroundColor: registro.tipo === 'I.A.' ? '#eff6ff' : '#f5f3ff',
                        color: registro.tipo === 'I.A.' ? '#1d4ed8' : '#6d28d9'
                      }}>
                        {registro.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#27272a' }}>{registro.fechaInseminacion}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#71717a' }}>
                      ⏳ {registro.fechaChequeo}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#71717a' }}>{registro.tecnico}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {renderEstadoBadge(registro.estado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FORMULARIO DE REGISTRO RÁPIDO */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e4e4e7', 
          borderRadius: '16px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#09090b' }}>🧬 Programar / Registrar</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Arete Vaca */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Arete de la Vaca / Receptora</label>
              <input 
                type="text" 
                placeholder="Ej. #0085" 
                value={areteVaca} 
                onChange={(e) => setAreteVaca(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>

            {/* Nombre Vaca */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Nombre / Alias</label>
              <input 
                type="text" 
                placeholder="Ej. Mariposa" 
                value={nombreVaca} 
                onChange={(e) => setNombreVaca(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>

            {/* Tipo de Servicio */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Tipo de Reproducción</label>
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value as any)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
              >
                <option value="I.A.">Inseminación Artificial (I.A.)</option>
                <option value="Monta Natural">Monta Natural</option>
              </select>
            </div>

            {/* Toro / Pajilla */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Código Pajilla / Toro Donante</label>
              <input 
                type="text" 
                placeholder="Ej. HOL-120 (Holstein)" 
                value={toroPajilla} 
                onChange={(e) => setToroPajilla(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>

            {/* Fecha Inseminación */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Fecha de Inseminación / Monta</label>
              <input 
                type="date" 
                value={fechaInseminacion} 
                onChange={(e) => setFechaInseminacion(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>

            {/* Técnico / Responsable */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#71717a', marginBottom: '6px' }}>Inseminador / Técnico Responsable</label>
              <input 
                type="text" 
                placeholder="Ej. Carlos Gómez" 
                value={tecnico} 
                onChange={(e) => setTecnico(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
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
              Registrar Servicio
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}