'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// Interfaces de Base de Datos
export interface Bovino {
  id: string
  arete: string
  nombre?: string
  raza: string
  genero: string
  peso_inicial: number
  fecha_nacimiento?: string
  observaciones?: string
  estado?: string
}

export interface ProduccionLeche {
  id: string
  bovino_id: string
  fecha: string
  litros: number
  jornada: string
  concentrado_kg?: number
  observaciones?: string
}

export interface Inseminacion {
  id: string
  vaca_id: string
  fecha: string
  toro_pajuela?: string
  tipo?: string
  inseminador?: string
  confirmado?: boolean
  observaciones?: string
}

export default function DashboardPage() {
  const supabase = createClient()

  // Estados de carga e inventario
  const [bovinos, setBovinos] = useState<Bovino[]>([])
  const [selectedBovinoId, setSelectedBovinoId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingDetalles, setLoadingDetalles] = useState<boolean>(false)

  // Datos del bovino seleccionado (Hoja de Vida)
  const [bovinoActual, setBovinoActual] = useState<Bovino | null>(null)
  const [producciones, setProducciones] = useState<ProduccionLeche[]>([])
  const [inseminaciones, setInseminaciones] = useState<Inseminacion[]>([])

  // Cargar lista general de bovinos
  useEffect(() => {
    async function loadBovinos() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('bovinos')
          .select('*')
          .order('arete', { ascending: true })

        if (error) console.error('Error cargando bovinos:', error.message)
        else setBovinos(data || [])
      } catch (err) {
        console.error('Error al consultar bovinos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBovinos()
  }, [])

  // Cargar toda la información de la vaca seleccionada
  useEffect(() => {
    if (!selectedBovinoId) {
      setBovinoActual(null)
      setProducciones([])
      setInseminaciones([])
      return
    }

    async function fetchHojaDeVida() {
      setLoadingDetalles(true)
      try {
        // 1. Datos básicos del bovino
        const bActual = bovinos.find((b) => b.id === selectedBovinoId) || null
        setBovinoActual(bActual)

        // 2. Historial de Producción de Leche
        const { data: prodData } = await supabase
          .from('produccion_leche')
          .select('*')
          .eq('bovino_id', selectedBovinoId)
          .order('fecha', { ascending: true })

        setProducciones(prodData || [])

        // 3. Historial de Inseminaciones
        const { data: insemData } = await supabase
          .from('inseminaciones')
          .select('*')
          .eq('vaca_id', selectedBovinoId)
          .order('fecha', { ascending: false })

        setInseminaciones(insemData || [])
      } catch (err) {
        console.error('Error cargando la Hoja de Vida:', err)
      } finally {
        setLoadingDetalles(false)
      }
    }

    fetchHojaDeVida()
  }, [selectedBovinoId, bovinos])

  // --- CÁLCULOS Y MÉTRICAS DE LA VACA SELECCIONADA ---
  const totalLitros = producciones.reduce((acc, curr) => acc + Number(curr.litros || 0), 0)

  // Agrupar litros por fecha (ordenadas cronológicamente)
  const diasConProduccion = Array.from(new Set(producciones.map((p) => p.fecha))).sort()

  const promedioDiario =
    diasConProduccion.length > 0
      ? (totalLitros / diasConProduccion.length).toFixed(1)
      : '0.0'

  // Estimación de Fecha de Parto / Inicio Lactancia (primer registro de leche)
  const primeraFechaProd =
    diasConProduccion.length > 0 ? new Date(diasConProduccion[0]) : null
  const hoy = new Date()
  const diasEnLactancia = primeraFechaProd
    ? Math.floor((hoy.getTime() - primeraFechaProd.getTime()) / (1000 * 3600 * 24))
    : 0

  // Máximo diario para calcular la escala Y del gráfico
  const maxLitrosDia = Math.max(
    ...diasConProduccion.map((f) =>
      producciones.filter((p) => p.fecha === f).reduce((a, c) => a + Number(c.litros), 0)
    ),
    10
  )

  // Configuración dinámica del lienzo SVG
  const svgWidth = Math.max(600, diasConProduccion.length * 70) // Garantiza espacio por cada día
  const svgHeight = 260
  const margin = { top: 35, right: 30, bottom: 65, left: 45 }
  const chartWidth = svgWidth - margin.left - margin.right
  const chartHeight = svgHeight - margin.top - margin.bottom

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      
      {/* BARRA DE FILTRO POR VACA */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#09090b' }}>
            🔍 Filtrar Hoja de Vida e Historial Por Vaca
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#71717a' }}>
            Selecciona un animal para ver su curva de lactancia individual, producción y eventos.
          </p>
        </div>

        <div style={{ minWidth: '280px' }}>
          <select
            value={selectedBovinoId}
            onChange={(e) => setSelectedBovinoId(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #d4d4d8',
              backgroundColor: '#f8fafc',
              fontSize: '14px',
              fontWeight: '600',
              color: '#09090b',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Ver Hato General (Todas) --</option>
            {bovinos.map((b) => (
              <option key={b.id} value={b.id}>
                Arete: {b.arete} {b.nombre ? `- ${b.nombre}` : ''} ({b.estado || 'Sin estado'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DETALLES DE LA VACA SELECCIONADA */}
      {selectedBovinoId && bovinoActual ? (
        loadingDetalles ? (
          <p style={{ fontSize: '14px', color: '#71717a' }}>Cargando Hoja de Vida...</p>
        ) : (
          <>
            {/* 1. TARJETAS DE MÉTRICAS INDIVIDUALES */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px' 
            }}>
              
              {/* Total Litros */}
              <div style={cardStyle}>
                <div>
                  <span style={cardTitleStyle}>Total Producido</span>
                  <h3 style={cardValueStyle}>{totalLitros.toLocaleString()} Lts</h3>
                </div>
                <p style={cardSubtextStyle}>🥛 Litros acumulados cargados</p>
              </div>

              {/* Promedio Diario */}
              <div style={cardStyle}>
                <div>
                  <span style={cardTitleStyle}>Promedio Diario</span>
                  <h3 style={cardValueStyle}>{promedioDiario} Lts/día</h3>
                </div>
                <p style={cardSubtextStyle}>📊 Promedio en días con ordeño</p>
              </div>

              {/* Días en Lactancia (DEL) */}
              <div style={cardStyle}>
                <div>
                  <span style={cardTitleStyle}>Días en Lactancia (DEL)</span>
                  <h3 style={{ ...cardValueStyle, color: '#2563eb' }}>{diasEnLactancia} Días</h3>
                </div>
                <p style={cardSubtextStyle}>
                  📅 Est. desde 1er ordeño: {primeraFechaProd ? primeraFechaProd.toISOString().split('T')[0] : 'N/A'}
                </p>
              </div>

              {/* Estado y Raza */}
              <div style={cardStyle}>
                <div>
                  <span style={cardTitleStyle}>Estado Productivo</span>
                  <h3 style={{ ...cardValueStyle, fontSize: '20px' }}>{bovinoActual.estado || 'En Producción'}</h3>
                </div>
                <p style={cardSubtextStyle}>🐄 Raza: {bovinoActual.raza}</p>
              </div>
            </div>

            {/* 2. CURVA DE LACTANCIA INDIVIDUAL CON TIEMPO Y VALORES */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#09090b' }}>
                📈 Curva de Lactancia Individual: Arete {bovinoActual.arete} {bovinoActual.nombre ? `(${bovinoActual.nombre})` : ''}
              </h3>

              {producciones.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#71717a' }}>No hay registros de leche para generar la curva de este animal.</p>
              ) : (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <div style={{ width: `${svgWidth}px`, height: `${svgHeight}px`, margin: '0 auto' }}>
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%' }}>
                      
                      {/* Líneas horizontales de referencia */}
                      <line x1={margin.left} y1={margin.top} x2={svgWidth - margin.right} y2={margin.top} stroke="#f4f4f5" strokeWidth="1" />
                      <line x1={margin.left} y1={margin.top + chartHeight / 2} x2={svgWidth - margin.right} y2={margin.top + chartHeight / 2} stroke="#f4f4f5" strokeWidth="1" />
                      <line x1={margin.left} y1={margin.top + chartHeight} x2={svgWidth - margin.right} y2={margin.top + chartHeight} stroke="#e4e4e7" strokeWidth="1.5" />

                      {/* Etiquetas del eje Y (Litros) */}
                      <text x={margin.left - 8} y={margin.top + 4} fill="#a1a1aa" fontSize="10" fontWeight="600" textAnchor="end">{maxLitrosDia} L</text>
                      <text x={margin.left - 8} y={margin.top + chartHeight / 2 + 4} fill="#a1a1aa" fontSize="10" fontWeight="600" textAnchor="end">{(maxLitrosDia / 2).toFixed(0)} L</text>
                      <text x={margin.left - 8} y={margin.top + chartHeight + 4} fill="#a1a1aa" fontSize="10" fontWeight="600" textAnchor="end">0 L</text>

                      {/* Trazado continuo de la línea de producción */}
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={diasConProduccion.map((fecha, i) => {
                          const totalDia = producciones
                            .filter((p) => p.fecha === fecha)
                            .reduce((a, c) => a + Number(c.litros), 0)
                          
                          const x = margin.left + (diasConProduccion.length === 1 ? chartWidth / 2 : (i / (diasConProduccion.length - 1)) * chartWidth)
                          const y = margin.top + chartHeight - (totalDia / maxLitrosDia) * chartHeight
                          return `${x},${y}`
                        }).join(' ')}
                      />

                      {/* Puntos, totales por fecha y eje de tiempo (Eje X) */}
                      {diasConProduccion.map((fecha, i) => {
                        const totalDia = producciones
                          .filter((p) => p.fecha === fecha)
                          .reduce((a, c) => a + Number(c.litros), 0)

                        const x = margin.left + (diasConProduccion.length === 1 ? chartWidth / 2 : (i / (diasConProduccion.length - 1)) * chartWidth)
                        const y = margin.top + chartHeight - (totalDia / maxLitrosDia) * chartHeight

                        return (
                          <g key={fecha}>
                            {/* Punto del día */}
                            <circle cx={x} cy={y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />

                            {/* VALOR TOTAL EN EL PICO (Mañana + Tarde) */}
                            <text
                              x={x}
                              y={y - 10}
                              fill="#1e40af"
                              fontSize="11"
                              fontWeight="800"
                              textAnchor="middle"
                            >
                              {totalDia.toFixed(1)} L
                            </text>

                            {/* Marca en la línea del eje X */}
                            <line x1={x} y1={margin.top + chartHeight} x2={x} y2={margin.top + chartHeight + 6} stroke="#a1a1aa" strokeWidth="1" />

                            {/* VARIABLE DE TIEMPO (FECHA DÍA DE ORDEÑO) */}
                            <text
                              x={x}
                              y={margin.top + chartHeight + 20}
                              fill="#52525b"
                              fontSize="11"
                              fontWeight="600"
                              textAnchor="end"
                              transform={`rotate(-35, ${x}, ${margin.top + chartHeight + 20})`}
                            >
                              {fecha}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* 3. HOJA DE VIDA COMPLETA DEL ANIMAL */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#09090b' }}>
                📄 Hoja de Vida e Información General
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px', color: '#3f3f46' }}>
                <div><strong>Arete:</strong> {bovinoActual.arete}</div>
                <div><strong>Nombre:</strong> {bovinoActual.nombre || 'N/A'}</div>
                <div><strong>Raza:</strong> {bovinoActual.raza}</div>
                <div><strong>Género:</strong> {bovinoActual.genero}</div>
                <div><strong>Peso Inicial:</strong> {bovinoActual.peso_inicial} kg</div>
                <div><strong>Fecha Nacimiento:</strong> {bovinoActual.fecha_nacimiento || 'No registrada'}</div>
                <div><strong>Estado:</strong> {bovinoActual.estado || 'No especificado'}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Observaciones:</strong> {bovinoActual.observaciones || 'Sin observaciones.'}</div>
              </div>
            </div>

            {/* HISTORIAL REPRODUCTIVO / INSEMINACIONES */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#09090b' }}>
                💉 Historial Reproductivo / Inseminaciones ({inseminaciones.length})
              </h3>
              {inseminaciones.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#71717a' }}>No se registran inseminaciones para este animal.</p>
              ) : (
                <table style={{ width: '100%', textAlign: 'left', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                      <th style={{ padding: '8px' }}>Fecha</th>
                      <th style={{ padding: '8px' }}>Toro/Pajuela</th>
                      <th style={{ padding: '8px' }}>Tipo</th>
                      <th style={{ padding: '8px' }}>Inseminador</th>
                      <th style={{ padding: '8px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inseminaciones.map((ins) => (
                      <tr key={ins.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                        <td style={{ padding: '8px' }}>{ins.fecha}</td>
                        <td style={{ padding: '8px' }}>{ins.toro_pajuela || '-'}</td>
                        <td style={{ padding: '8px' }}>{ins.tipo || 'IA'}</td>
                        <td style={{ padding: '8px' }}>{ins.inseminador || '-'}</td>
                        <td style={{ padding: '8px' }}>
                          {ins.confirmado ? '✅ Preñada' : '⏳ Pendiente'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )
      ) : (
        /* PANORAMA GENERAL CUANDO NO HAY NINGUNA VACA SELECCIONADA */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={cardStyle}>
              <div>
                <span style={cardTitleStyle}>Total Bovinos</span>
                <h3 style={cardValueStyle}>{bovinos.length}</h3>
              </div>
              <p style={cardSubtextStyle}>🐂 Registrados en el hato</p>
            </div>
          </div>

          <h2 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', color: '#09090b' }}>Módulos del Sistema</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>📋 Inventario de Ganado</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#71717a' }}>Gestión integral de bovinos y pesajes.</p>
              <Link href="/dashboard/inventario">
                <button style={btnPrimaryStyle}>Ver animales</button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Estilos Reutilizables
const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '16px',
  padding: '24px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '130px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#71717a',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const cardValueStyle: React.CSSProperties = {
  margin: '8px 0 0 0',
  fontSize: '28px',
  fontWeight: '800',
  letterSpacing: '-0.8px',
  color: '#09090b'
}

const cardSubtextStyle: React.CSSProperties = {
  margin: '8px 0 0 0',
  fontSize: '12px',
  color: '#71717a'
}

const btnPrimaryStyle: React.CSSProperties = {
  backgroundColor: '#09090b',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 16px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer'
}