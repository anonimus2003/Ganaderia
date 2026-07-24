'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InventarioPage() {
  const supabase = createClient()
  
  // ESTADOS
  const [bovinos, setBovinos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroCat, setFiltroCat] = useState('Todos')
  const [vacaSeleccionada, setVacaSeleccionada] = useState<any>(null)

  // LÓGICA DE FASES Y CATEGORÍAS GANADERAS PROFESIONALES
  const obtenerCategoriaDetallada = (bovino: any) => {
    if (bovino.genero === 'Macho') {
      if (!bovino.fecha_nacimiento) return 'Macho de Levante'
      const nacimiento = new Date(bovino.fecha_nacimiento)
      const hoy = new Date()
      const meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth())
      return meses <= 10 ? 'Ternero Lactante' : 'Macho de Levante / Reproductor'
    }

    // SI ES HEMBRA
    if (!bovino.fecha_nacimiento) return 'Vaca en Producción'

    const nacimiento = new Date(bovino.fecha_nacimiento)
    const hoy = new Date()
    const meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth())

    // 1. Terneras
    if (meses <= 3) return 'Ternera Lactante'
    if (meses <= 10) return 'Ternera en Crecimiento'

    // 2. Novillas
    if (meses <= 18) return 'Novilla en Desarrollo'
    if (meses <= 30) return 'Novilla de Vientre (Apta Servicio)'

    // 3. Vacas adultas
    if (bovino.estado_productivo === 'Seca') return 'Vaca Seca'
    if (bovino.estado_productivo === 'Gestante') return 'Vaca Gestante'
    
    return 'Vaca en Producción (Ordeño)'
  }

  // Estilos visuales según la fase ganadera
  const getBadgeStyle = (categoria: string) => {
    if (categoria.includes('Terner')) return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' } 
    if (categoria.includes('Novilla')) return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' } 
    if (categoria.includes('Producción') || categoria.includes('Gestante')) return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' } 
    if (categoria.includes('Seca')) return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' } 
    return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' } 
  }

  // CARGA DE DATOS
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('bovinos').select('*')
      if (error) console.error('Error cargando bovinos:', error)
      if (data) setBovinos(data)
    }
    fetchData()
  }, [])

  // FILTRADO INTELIGENTE
  const datosFiltrados = useMemo(() => {
    return bovinos.filter(b => {
      const cat = obtenerCategoriaDetallada(b)
      const cumpleBusqueda = b.arete?.toLowerCase().includes(busqueda.toLowerCase()) || 
                             b.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      
      let cumpleCat = false
      if (filtroCat === 'Todos') cumpleCat = true
      else if (filtroCat === 'Hembra') cumpleCat = b.genero === 'Hembra'
      else if (filtroCat === 'Macho') cumpleCat = b.genero === 'Macho'
      else cumpleCat = cat.toLowerCase().includes(filtroCat.toLowerCase())
      
      return cumpleBusqueda && cumpleCat
    })
  }, [bovinos, busqueda, filtroCat])

  // ESTADÍSTICAS DETALLADAS
  const stats = useMemo(() => ({
    ternerasLactantes: bovinos.filter(b => obtenerCategoriaDetallada(b) === 'Ternera Lactante').length,
    ternerasCrecimiento: bovinos.filter(b => obtenerCategoriaDetallada(b) === 'Ternera en Crecimiento').length,
    novillasDesarrollo: bovinos.filter(b => obtenerCategoriaDetallada(b) === 'Novilla en Desarrollo').length,
    novillasVientre: bovinos.filter(b => obtenerCategoriaDetallada(b) === 'Novilla de Vientre (Apta Servicio)').length,
    vacasProduccion: bovinos.filter(b => obtenerCategoriaDetallada(b) === 'Vaca en Producción (Ordeño)').length,
    vacasSecas: bovinos.filter(b => obtenerCategoriaDetallada(b) === 'Vaca Seca').length,
    machos: bovinos.filter(b => b.genero === 'Macho').length,
  }), [bovinos])

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* ENCABEZADO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Inventario y Fases Ganaderas
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Control automatizado del hato y trazabilidad por etapas de desarrollo.</p>
        </div>
        <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '600', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          Total Hato: <span style={{ color: '#15803d', fontWeight: '800' }}>{bovinos.length}</span>
        </div>
      </div>

      {/* DASHBOARD DE ESTADÍSTICAS AVANZADAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[ 
          {t: 'T. Lactantes', v: stats.ternerasLactantes, color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd'}, 
          {t: 'T. Crecimiento', v: stats.ternerasCrecimiento, color: '#0284c7', bg: '#f0f9ff', border: '#e0f2fe'}, 
          {t: 'N. Desarrollo', v: stats.novillasDesarrollo, color: '#d97706', bg: '#fef3c7', border: '#fde68a'}, 
          {t: 'N. Vientre', v: stats.novillasVientre, color: '#b45309', bg: '#fffbeb', border: '#fef3c7'}, 
          {t: 'V. Producción', v: stats.vacasProduccion, color: '#15803d', bg: '#dcfce7', border: '#bbf7d0'}, 
          {t: 'V. Secas', v: stats.vacasSecas, color: '#c2410c', bg: '#ffedd5', border: '#fed7aa'}, 
          {t: 'Machos', v: stats.machos, color: '#475569', bg: '#f1f5f9', border: '#e2e8f0'}, 
        ].map(s => (
          <div key={s.t} style={{ background: s.bg, padding: '16px 12px', borderRadius: '14px', border: `1px solid ${s.border}`, textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
            <div style={{ color: s.color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.t}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, marginTop: '6px' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input 
          placeholder="Buscar por arete o nombre..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)} 
          style={{ flex: 1, minWidth: '260px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box', transition: 'border-color 0.2s' }} 
          onFocus={(e) => e.target.style.borderColor = '#15803d'}
          onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
        />
        <select 
          value={filtroCat}
          onChange={(e) => setFiltroCat(e.target.value)} 
          style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '14px', color: '#334155', fontWeight: '500', cursor: 'pointer' }}
        >
          <option value="Todos">Todas las Fases / Categorías</option>
          <option value="Lactante">Terneras Lactantes</option>
          <option value="Crecimiento">Terneras en Crecimiento</option>
          <option value="Desarrollo">Novillas en Desarrollo</option>
          <option value="Vientre">Novillas de Vientre</option>
          <option value="Producción">Vacas en Producción</option>
          <option value="Seca">Vacas Secas</option>
          <option value="Macho">Todos los Machos</option>
        </select>
      </div>

      {/* TABLA DE REGISTROS */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px' }}>Animal / Nombre</th>
                <th style={{ padding: '16px 20px' }}>Arete</th>
                <th style={{ padding: '16px 20px' }}>Raza</th>
                <th style={{ padding: '16px 20px' }}>Fase / Categoría</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Ficha Técnica</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length > 0 ? (
                datosFiltrados.map((b, index) => {
                  const categoriaActual = obtenerCategoriaDetallada(b)
                  const badge = getBadgeStyle(categoriaActual)

                  return (
                    <tr 
                      key={b.id || index} 
                      style={{ 
                        borderBottom: index === datosFiltrados.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', fontSize: '14px' }}>{b.nombre || 'Sin nombre'}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{b.genero || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#334155', fontWeight: '600', fontSize: '14px' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          {b.arete}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '14px' }}>{b.raza || 'N/A'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          background: badge.bg, 
                          color: badge.text, 
                          border: `1px solid ${badge.border}`,
                          fontSize: '12px', 
                          fontWeight: '700', 
                          padding: '6px 12px', 
                          borderRadius: '20px',
                          display: 'inline-block'
                        }}>
                          {categoriaActual}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setVacaSeleccionada(b)}
                          title="Ver ficha técnica"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#334155',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9'
                            e.currentTarget.style.borderColor = '#94a3b8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc'
                            e.currentTarget.style.borderColor = '#cbd5e1'
                          }}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
                    No se encontraron registros de bovinos que coincidan con los filtros de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FICHA TÉCNICA (MODAL) */}
      {vacaSeleccionada && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Ficha Técnica</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Detalle integral del bovino</span>
              </div>
              <span style={{ 
                background: getBadgeStyle(obtenerCategoriaDetallada(vacaSeleccionada)).bg, 
                color: getBadgeStyle(obtenerCategoriaDetallada(vacaSeleccionada)).text, 
                border: `1px solid ${getBadgeStyle(obtenerCategoriaDetallada(vacaSeleccionada)).border}`,
                fontSize: '11px', 
                fontWeight: '700', 
                padding: '6px 12px', 
                borderRadius: '20px' 
              }}>
                {obtenerCategoriaDetallada(vacaSeleccionada)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Arete / ID:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{vacaSeleccionada.arete}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Nombre / Alias:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{vacaSeleccionada.nombre || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Raza:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{vacaSeleccionada.raza || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Género:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{vacaSeleccionada.genero || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Peso Inicial:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{vacaSeleccionada.peso_inicial ? `${vacaSeleccionada.peso_inicial} kg` : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Fecha Nacimiento:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{vacaSeleccionada.fecha_nacimiento || 'No registrada'}</span>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Observaciones:</span>
                <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{vacaSeleccionada.observaciones || 'Ninguna observación registrada.'}</span>
              </div>
            </div>

            <button 
              onClick={() => setVacaSeleccionada(null)} 
              style={{ marginTop: '24px', padding: '12px', width: '100%', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}
    </main>
  )
}