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
  
  // ESTADOS PARA EDICIÓN Y GUARDADO
  const [editando, setEditando] = useState(false)
  const [formEdicion, setFormEdicion] = useState<any>({})
  const [guardando, setGuardando] = useState(false)

  // OBTENER ESTADO DIRECTAMENTE DE LA COLUMNA 'estado' (o un fallback por defecto)
  const obtenerEstadoBovino = (bovino: any) => {
    return bovino.estado || (bovino.genero === 'Macho' ? 'Macho / Destete / Levante' : 'En producción')
  }

  // Estilos visuales según la fase ganadera / estado
  const getBadgeStyle = (estado: string) => {
    const est = estado ? estado.toLowerCase() : ''
    if (est.includes('ternera') || est.includes('lactancia') || est.includes('crecimiento')) return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' } 
    if (est.includes('novilla')) return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' } 
    if (est.includes('producción') || est.includes('gestante')) return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' } 
    if (est.includes('seca')) return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' } 
    return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' } 
  }

  // CARGA DE DATOS
  async function fetchData() {
    const { data, error } = await supabase.from('bovinos').select('*')
    if (error) console.error('Error cargando bovinos:', error)
    if (data) setBovinos(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // MANEJAR APERTURA DE FICHA Y CARGA DE FORMULARIO DE EDICIÓN
  const abrirFicha = (b: any) => {
    setVacaSeleccionada(b)
    setFormEdicion({ ...b })
    setEditando(false)
  }

  // GUARDAR CAMBIOS EN SUPABASE (Actualiza el estado registrado)
  const guardarCambios = async () => {
    if (!formEdicion.id) return
    setGuardando(true)

    const { error } = await supabase
      .from('bovinos')
      .update({
        arete: formEdicion.arete,
        nombre: formEdicion.nombre,
        raza: formEdicion.raza,
        genero: formEdicion.genero,
        estado: formEdicion.estado, // Se guarda la columna estado de tu tabla
        peso_inicial: formEdicion.peso_inicial ? parseFloat(formEdicion.peso_inicial) : null,
        fecha_nacimiento: formEdicion.fecha_nacimiento || null,
        observaciones: formEdicion.observaciones
      })
      .eq('id', formEdicion.id)

    setGuardando(false)

    if (error) {
      alert('Error al actualizar: ' + error.message)
    } else {
      alert('¡Datos actualizados con éxito!')
      setEditando(false)
      await fetchData()
      // Actualizar el objeto seleccionado actual en el modal
      setVacaSeleccionada({ ...formEdicion })
    }
  }

  // FILTRADO INTELIGENTE
  const datosFiltrados = useMemo(() => {
    return bovinos.filter(b => {
      const est = obtenerEstadoBovino(b)
      const cumpleBusqueda = b.arete?.toLowerCase().includes(busqueda.toLowerCase()) || 
                             b.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      
      let cumpleCat = false
      if (filtroCat === 'Todos') cumpleCat = true
      else if (filtroCat === 'Hembra') cumpleCat = b.genero === 'Hembra'
      else if (filtroCat === 'Macho') cumpleCat = b.genero === 'Macho'
      else cumpleCat = est.toLowerCase().includes(filtroCat.toLowerCase())
      
      return cumpleBusqueda && cumpleCat
    })
  }, [bovinos, busqueda, filtroCat])

  // ESTADÍSTICAS DETALLADAS (Basadas en el campo estado)
  const stats = useMemo(() => ({
    ternerasLactancia: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('terna en lactancia') || obtenerEstadoBovino(b).toLowerCase().includes('lactancia')).length,
    ternerasCrecimiento: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('crecimiento')).length,
    novillasDesarrollo: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('desarrollo')).length,
    novillasVientre: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('vientre')).length,
    enProduccion: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('producción')).length,
    secas: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('seca')).length,
    machos: bovinos.filter(b => b.genero === 'Macho' || obtenerEstadoBovino(b).toLowerCase() === 'macho').length,
    destete: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('destete')).length,
    levante: bovinos.filter(b => obtenerEstadoBovino(b).toLowerCase().includes('levante')).length,
  }), [bovinos])

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* ENCABEZADO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Inventario y Estados del Hato
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Control y gestión manual de los estados registrados de los animales.</p>
        </div>
        <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '600', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          Total Hato: <span style={{ color: '#15803d', fontWeight: '800' }}>{bovinos.length}</span>
        </div>
      </div>

      {/* DASHBOARD DE ESTADÍSTICAS (ACTUALIZADO CON TODAS LAS OPCIONES) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[ 
          {t: 'T. Lactancia', v: stats.ternerasLactancia, color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd'}, 
          {t: 'T. Crecimiento', v: stats.ternerasCrecimiento, color: '#0284c7', bg: '#f0f9ff', border: '#e0f2fe'}, 
          {t: 'N. Desarrollo', v: stats.novillasDesarrollo, color: '#d97706', bg: '#fef3c7', border: '#fde68a'}, 
          {t: 'N. Vientre', v: stats.novillasVientre, color: '#b45309', bg: '#fffbeb', border: '#fef3c7'}, 
          {t: 'En Producción', v: stats.enProduccion, color: '#15803d', bg: '#dcfce7', border: '#bbf7d0'}, 
          {t: 'Secas', v: stats.secas, color: '#c2410c', bg: '#ffedd5', border: '#fed7aa'}, 
          {t: 'Machos', v: stats.machos, color: '#475569', bg: '#f1f5f9', border: '#e2e8f0'}, 
          {t: 'Destete', v: stats.destete, color: '#0e7490', bg: '#cffafe', border: '#a5f3fc'}, 
          {t: 'Levante', v: stats.levante, color: '#65a30d', bg: '#ecfccb', border: '#d9f99d'}, 
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
          style={{ flex: 1, minWidth: '260px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box' }} 
        />
        <select 
          value={filtroCat}
          onChange={(e) => setFiltroCat(e.target.value)} 
          style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '14px', color: '#334155', fontWeight: '500', cursor: 'pointer' }}
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Ternera en lactancia">Ternera en lactancia</option>
          <option value="Ternera en crecimiento">Ternera en crecimiento</option>
          <option value="Novilla en desarrollo">Novilla en desarrollo</option>
          <option value="Novilla de vientre">Novilla de vientre</option>
          <option value="En producción">En producción</option>
          <option value="Seca">Seca</option>
          <option value="Macho">Macho</option>
          <option value="Destete">Destete</option>
          <option value="Levante">Levante</option>
        </select>
      </div>

      {/* TABLA DE REGISTROS */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px' }}>Nombre</th>
                <th style={{ padding: '16px 20px' }}>Arete</th>
                <th style={{ padding: '16px 20px' }}>Raza</th>
                <th style={{ padding: '16px 20px' }}>Estado Actual</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Ficha Técnica</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length > 0 ? (
                datosFiltrados.map((b, index) => {
                  const estadoActual = obtenerEstadoBovino(b)
                  const badge = getBadgeStyle(estadoActual)

                  return (
                    <tr 
                      key={b.id || index} 
                      style={{ borderBottom: index === datosFiltrados.length - 1 ? 'none' : '1px solid #f1f5f9' }}
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
                          {estadoActual}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => abrirFicha(b)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#334155'
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

      {/* FICHA TÉCNICA (MODAL CON OPCIÓN DE EDICIÓN) */}
      {vacaSeleccionada && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                  {editando ? 'Editar Ficha Técnica' : 'Ficha Técnica'}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{editando ? 'Modifique los campos necesarios' : 'Detalle integral del bovino'}</span>
              </div>
              {!editando && (
                <button 
                  onClick={() => setEditando(true)}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Editar Datos
                </button>
              )}
            </div>

            {/* MODO VISTA */}
            {!editando ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Arete:</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{vacaSeleccionada.arete}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Nombre:</span>
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
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Estado:</span>
                    <span style={{ fontWeight: '600', color: '#15803d' }}>{obtenerEstadoBovino(vacaSeleccionada)}</span>
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
                  style={{ marginTop: '24px', padding: '12px', width: '100%', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cerrar Ficha
                </button>
              </>
            ) : (
              /* MODO EDICIÓN MANUAL CON EL SELECT DE ESTADOS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Arete:</label>
                  <input 
                    type="text" 
                    value={formEdicion.arete || ''} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, arete: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Nombre:</label>
                  <input 
                    type="text" 
                    value={formEdicion.nombre || ''} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Raza:</label>
                  <input 
                    type="text" 
                    value={formEdicion.raza || ''} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, raza: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Género:</label>
                  <select 
                    value={formEdicion.genero || 'Hembra'} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, genero: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Estado:</label>
                  <select 
                    value={formEdicion.estado || 'En producción'} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, estado: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Ternera en lactancia">Ternera en lactancia</option>
                    <option value="Ternera en crecimiento">Ternera en crecimiento</option>
                    <option value="Novilla en desarrollo">Novilla en desarrollo</option>
                    <option value="Novilla de vientre">Novilla de vientre</option>
                    <option value="En producción">En producción</option>
                    <option value="Seca">Seca</option>
                    <option value="Macho">Macho</option>
                    <option value="Destete">Destete</option>
                    <option value="Levante">Levante</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Peso Inicial (kg):</label>
                  <input 
                    type="number" 
                    value={formEdicion.peso_inicial || ''} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, peso_inicial: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Fecha de Nacimiento:</label>
                  <input 
                    type="date" 
                    value={formEdicion.fecha_nacimiento || ''} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, fecha_nacimiento: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Observaciones:</label>
                  <textarea 
                    value={formEdicion.observaciones || ''} 
                    onChange={(e) => setFormEdicion({ ...formEdicion, observaciones: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }}
                    rows={3}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    onClick={() => setEditando(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={guardarCambios}
                    disabled={guardando}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#15803d', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  )
}