'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProduccionLechePage() {
  const router = useRouter()
  const supabase = createClient()

  // Estados de datos
  const [registros, setRegistros] = useState<any[]>([])
  const [bovinosHembras, setBovinosHembras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('Trabajador')

  // Estados para filtros y búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroJornada, setFiltroJornada] = useState('')

  // Control del Panel Lateral (Drawer)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idRegistroSeleccionado, setIdRegistroSeleccionado] = useState<string | null>(null)

  // Campos del formulario
  const [bovinoId, setBovinoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [litros, setLitros] = useState('')
  const [concentrado, setConcentrado] = useState('') // <-- Nuevo estado para Concentrado (kg)
  const [jornada, setJornada] = useState('Mañana')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Cargar datos y obtener el rol real desde la tabla 'perfiles'
  async function cargarDatos() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 1. Obtener el rol del usuario desde la tabla 'perfiles'
    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfilData?.rol) {
      setUserRole(perfilData.rol)
    }

    // 2. Obtener registros de producción de leche (incluyendo concentrado_kg)
    const { data: lecheData } = await supabase
      .from('produccion_leche')
      .select(`
        id,
        fecha,
        litros,
        concentrado_kg,
        jornada,
        observaciones,
        bovino_id,
        bovinos (
          arete,
          nombre
        )
      `)
      .order('fecha', { ascending: false })

    if (lecheData) setRegistros(lecheData)

    // 3. Obtener lista de bovinos hembras
    const { data: hembrasData } = await supabase
      .from('bovinos')
      .select('id, arete, nombre')
      .eq('genero', 'Hembra')
      .order('arete', { ascending: true })

    if (hembrasData) {
      setBovinosHembras(hembrasData)
      if (hembrasData.length > 0 && !bovinoId) {
        setBovinoId(hembrasData[0].id)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  function abrirParaRegistro() {
    setModoEdicion(false)
    setIdRegistroSeleccionado(null)
    if (bovinosHembras.length > 0) {
      setBovinoId(bovinosHembras[0].id)
    } else {
      setBovinoId('')
    }
    setFecha(new Date().toISOString().split('T')[0])
    setLitros('')
    setConcentrado('') // <-- Resetear el campo
    setJornada('Mañana')
    setObservaciones('')
    setIsPanelOpen(true)
  }

  function abrirParaEdicion(reg: any) {
    if (userRole !== 'Administrador' && userRole !== 'administrador') {
      alert('⚠️ Solo los administradores pueden editar o modificar registros de producción.')
      return
    }

    setModoEdicion(true)
    setIdRegistroSeleccionado(reg.id)
    setBovinoId(reg.bovino_id)
    setFecha(reg.fecha)
    setLitros(reg.litros ? reg.litros.toString() : '')
    setConcentrado(reg.concentrado_kg !== null && reg.concentrado_kg !== undefined ? reg.concentrado_kg.toString() : '') // <-- Cargar valor guardado
    setJornada(reg.jornada)
    setObservaciones(reg.observaciones || '')
    setIsPanelOpen(true)
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Sesión expirada.')
      setGuardando(false)
      return
    }

    if (!bovinoId) {
      alert('Debes seleccionar una vaca.')
      setGuardando(false)
      return
    }

    const datosLeche = {
      bovino_id: bovinoId,
      fecha,
      litros: parseFloat(litros),
      concentrado_kg: concentrado ? parseFloat(concentrado) : 0, // <-- Guardar como número o 0 si está vacío
      jornada,
      observaciones: observaciones || null,
      registrado_por: user.id
    }

    if (modoEdicion && idRegistroSeleccionado) {
      if (userRole.toLowerCase() !== 'administrador') {
        alert('Acción no autorizada.')
        setGuardando(false)
        return
      }

      const { error } = await supabase
        .from('produccion_leche')
        .update(datosLeche)
        .eq('id', idRegistroSeleccionado)

      if (error) alert('Error: ' + error.message)
      else {
        setIsPanelOpen(false)
        cargarDatos()
      }
    } else {
      const { error } = await supabase.from('produccion_leche').insert([datosLeche])
      if (error) alert('Error: ' + error.message)
      else {
        setIsPanelOpen(false)
        cargarDatos()
      }
    }
    setGuardando(false)
  }

  async function handleEliminar() {
    if (userRole.toLowerCase() !== 'administrador') {
      alert('No tienes permisos de administrador para eliminar registros.')
      return
    }
    if (!idRegistroSeleccionado) return
    if (!confirm('¿Estás seguro de eliminar este registro de producción?')) return

    setGuardando(true)
    const { error } = await supabase
      .from('produccion_leche')
      .delete()
      .eq('id', idRegistroSeleccionado)

    if (error) alert('Error: ' + error.message)
    else {
      setIsPanelOpen(false)
      cargarDatos()
    }
    setGuardando(false)
  }

  const registrosFiltrados = registros.filter(reg => {
    const vaca = reg.bovinos;
    const cumpleBusqueda = vaca 
      ? vaca.arete.toLowerCase().includes(busqueda.toLowerCase()) || 
        (vaca.nombre && vaca.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      : false

    const cumpleFecha = !filtroFecha || reg.fecha === filtroFecha
    const cumpleJornada = !filtroJornada || reg.jornada === filtroJornada

    return cumpleBusqueda && cumpleFecha && cumpleJornada
  })

  const totalLitros = registrosFiltrados.reduce((acc, curr) => acc + (curr.litros || 0), 0)
  const promedioLitros = registrosFiltrados.length > 0 
    ? (totalLitros / registrosFiltrados.length).toFixed(1) 
    : '0'

  return (
    <main style={{ padding: '32px', overflowY: 'auto', flexGrow: 1, backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', backgroundColor: '#ffffff', padding: '24px 32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4"></path><path d="M16 2v4"></path>
              <rect x="3" y="6" width="18" height="16" rx="3"></rect>
              <path d="M3 10h18"></path>
              <path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path>
              <path d="M10 18h4"></path>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Control de Leche</h1>          
            </div>
          </div>
        </div>

        <button 
          onClick={abrirParaRegistro} 
          style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', transition: 'all 0.2s' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Registrar Ordeño
        </button>
      </div>

      {/* Tarjetas Informativas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Litros Totales (Filtrados)</span>
            <h3 style={{ margin: '8px 0 0 0', fontSize: '30px', fontWeight: '800', color: '#16a34a' }}>{loading ? '...' : `${totalLitros.toFixed(1)} L`}</h3>
          </div>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Promedio por Ordeño</span>
            <h3 style={{ margin: '8px 0 0 0', fontSize: '30px', fontWeight: '800', color: '#2563eb' }}>{loading ? '...' : `${promedioLitros} L`}</h3>
          </div>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <input 
          type="text" placeholder="Buscar por arete o nombre de la vaca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          style={{ flexGrow: 1, maxWidth: '400px', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' }}
        />
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={filtroJornada} 
            onChange={(e) => setFiltroJornada(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#475569', backgroundColor: '#ffffff' }}
          >
            <option value="">Todas las jornadas</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>

          <input 
            type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#475569', backgroundColor: '#ffffff' }}
          />
        </div>
      </div>

      {/* TABLA DE PRODUCCIÓN */}
      <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>Fecha</th>
              <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>Arete</th>
              <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>Nombre Vaca</th>
              <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>Jornada</th>
              <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>Producción</th>
              <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>Concentrado</th>
              <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600' }}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Cargando registros...</td></tr>
            ) : registrosFiltrados.length > 0 ? (
              registrosFiltrados.map((reg) => (
                <tr 
                  key={reg.id} 
                  onClick={() => abrirParaEdicion(reg)} 
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: userRole.toLowerCase() === 'administrador' ? 'pointer' : 'default', transition: 'background-color 0.15s' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title={userRole.toLowerCase() !== 'administrador' ? 'Solo el administrador puede editar este registro' : 'Clic para editar'}
                >
                  <td style={{ padding: '16px 24px', color: '#334155' }}>{reg.fecha}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0f172a' }}>{reg.bovinos?.arete}</td>
                  <td style={{ padding: '16px 24px', color: '#475569' }}>{reg.bovinos?.nombre || '—'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: reg.jornada === 'Mañana' ? '#fef3c7' : '#e0f2fe',
                      color: reg.jornada === 'Mañana' ? '#b45309' : '#0369a1'
                    }}>
                      {reg.jornada}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: '#16a34a' }}>{reg.litros} L</td>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#d97706' }}>
                    {reg.concentrado_kg ? `${reg.concentrado_kg} kg` : '0 kg'}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{reg.observaciones || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                  No se encontraron pesajes de leche registrados con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* DRAWER LATERAL PARA REGISTRO/EDICIÓN */}
      {isPanelOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '440px', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', borderLeft: '1px solid #e2e8f0', zIndex: 100, padding: '32px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{modoEdicion ? '✏️ Editar Registro' : '🥛 Registrar Ordeño'}</h3>
            <button onClick={() => setIsPanelOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          
          <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Seleccionar Vaca *</label>
              <select value={bovinoId} onChange={(e) => setBovinoId(e.target.value)} required style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a' }}>
                <option value="" disabled>Seleccione una hembra...</option>
                {bovinosHembras.map((vaca) => (
                  <option key={vaca.id} value={vaca.id}>
                    Arete: {vaca.arete} {vaca.nombre ? `- ${vaca.nombre}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Fecha *</label>
              <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#0f172a' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Jornada *</label>
                <select value={jornada} onChange={(e) => setJornada(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', backgroundColor: '#ffffff', outline: 'none', color: '#0f172a' }}>
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Litros (L) *</label>
                <input type="number" step="0.1" placeholder="Ej. 12.5" required value={litros} onChange={(e) => setLitros(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#0f172a' }} />
              </div>
            </div>

            {/* Nuevo Campo: Concentrado (kg) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Concentrado (kg)</label>
              <input type="number" step="0.1" min="0" placeholder="Ej. 3.5" value={concentrado} onChange={(e) => setConcentrado(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#0f172a' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Observaciones</label>
              <textarea rows={3} placeholder="Condición de ubre, novedades..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#0f172a' }} />
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              {modoEdicion && userRole.toLowerCase() === 'administrador' && (
                <button type="button" onClick={handleEliminar} style={{ padding: '10px 16px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Eliminar</button>
              )}
              <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginLeft: 'auto', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                {guardando ? 'Guardando...' : 'Guardar Registro'}
              </button>
            </div>
          </form>
        </div>
      )}

    </main>
  )
}