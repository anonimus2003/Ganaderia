'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface PesajeRegistro {
  id: string
  fecha: string
  numero: string
  nombre: string
  categoria: string
  pesoKgs: number
  condicionCorporal: number
  estadoFisiologico: string
  observaciones: string
}

export default function PesajePage() {
  const supabase = createClient()

  const [pesajes, setPesajes] = useState<PesajeRegistro[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Formulario campos
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Ceba')
  const [pesoKgs, setPesoKgs] = useState('')
  const [condicionCorporal, setCondicionCorporal] = useState('3')
  const [estadoFisiologico, setEstadoFisiologico] = useState('Normal')
  const [observaciones, setObservaciones] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

  const [busqueda, setBusqueda] = useState('')

  // 1. Cargar los pesajes existentes al iniciar
  useEffect(() => {
    async function cargarPesajes() {
      try {
        setCargando(true)
        const { data: pesajesData, error } = await supabase
          .from('pesajes')
          .select('*')
          .order('fecha', { ascending: false })

        if (!error && pesajesData) {
          const formateados: PesajeRegistro[] = pesajesData.map((p: any) => ({
            id: p.id,
            fecha: p.fecha,
            numero: p.numero,
            nombre: p.nombre,
            categoria: p.categoria,
            pesoKgs: Number(p.peso_kgs),
            condicionCorporal: Number(p.condicion_corporal),
            estadoFisiologico: p.estado_fisiologico || '',
            observaciones: p.observaciones || ''
          }))
          setPesajes(formateados)
        }
      } catch (err) {
        console.error('Error al cargar pesajes:', err)
      } finally {
        setCargando(false)
      }
    }

    cargarPesajes()
  }, [])

  // 🐄 AUTOCOMPLETAR DIRECTO DESDE LA TABLA 'BOVINOS'
  // Esta función se ejecuta cuando el usuario termina de escribir el arete y sale del campo (onBlur)
  const buscarBovinoPorArete = async (areteBuscado: string) => {
    if (!areteBuscado.trim()) return

    try {
      // Consultamos directamente a tu tabla 'bovinos' usando el campo 'arete'
      const { data, error } = await supabase
        .from('bovinos')
        .select('nombre, peso_inicial, raza')
        .eq('arete', areteBuscado.trim())
        .single()

      if (data) {
        // Si encuentra la vaca, autocompleta el nombre
        setNombre(data.nombre || 'Sin nombre')
        console.log('Vaca encontrada:', data)
      } else {
        // Si no está en bovinos, intentamos buscar si ya tiene pesajes previos
        const pesajeAnterior = pesajes.find(p => p.numero.toLowerCase() === areteBuscado.toLowerCase())
        if (pesajeAnterior) {
          setNombre(pesajeAnterior.nombre)
          setCategoria(pesajeAnterior.categoria)
        }
      }
    } catch (err) {
      console.error('Error al buscar el bovino:', err)
    }
  }

  // 2. Guardar el nuevo pesaje en Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numero || !nombre || !pesoKgs) return

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('pesajes')
        .insert([
          {
            fecha,
            numero,
            nombre,
            categoria,
            peso_kgs: parseFloat(pesoKgs),
            condicion_corporal: parseFloat(condicionCorporal),
            estado_fisiologico: estadoFisiologico,
            observaciones,
            user_id: user?.id
          }
        ])
        .select()

      if (error) {
        alert('Error al guardar en Supabase: ' + error.message)
        return
      }

      if (data && data.length > 0) {
        const nuevoInsertado: PesajeRegistro = {
          id: data[0].id,
          fecha: data[0].fecha,
          numero: data[0].numero,
          nombre: data[0].nombre,
          categoria: data[0].categoria,
          pesoKgs: Number(data[0].peso_kgs),
          condicionCorporal: Number(data[0].condicion_corporal),
          estadoFisiologico: data[0].estado_fisiologico,
          observaciones: data[0].observaciones
        }

        setPesajes([nuevoInsertado, ...pesajes])
        setNumero('')
        setNombre('')
        setPesoKgs('')
        setObservaciones('')
        setMostrarFormulario(false)
        alert('¡Pesaje guardado exitosamente!')
      }
    } catch (err) {
      console.error('Error al insertar:', err)
    }
  }

  // Cálculo automático de la GDP
  const calcularGDPYInfoAnterior = (item: PesajeRegistro) => {
    const historialAnimal = pesajes
      .filter(p => p.numero === item.numero && new Date(p.fecha) < new Date(item.fecha))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    if (historialAnimal.length === 0) {
      return { gdpText: <span style={{ color: '#9ca3af', fontSize: '11px' }}>Primer pesaje</span> }
    }

    const ultimoAnterior = historialAnimal[0]
    const pesoAnt = ultimoAnterior.pesoKgs
    const diffTime = Math.abs(new Date(item.fecha).getTime() - new Date(ultimoAnterior.fecha).getTime())
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (dias <= 0) return { gdpText: <span style={{ fontSize: '11px' }}>Mismo día</span> }

    const gdp = Math.round(((item.pesoKgs - pesoAnt) / dias) * 1000)
    let color = '#047857'
    let bg = '#ecfdf5'
    if (gdp < 100) { color = '#b91c1c'; bg = '#fef2f2'; }
    else if (gdp < 500) { color = '#b45309'; bg = '#fffbeb'; }

    return {
      gdpText: (
        <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: bg, color: color, fontWeight: '700', fontSize: '11px' }}>
          +{gdp} g/d
        </span>
      )
    }
  }

  const pesajesFiltrados = pesajes.filter(p => 
    p.numero.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ padding: '32px', boxSizing: 'border-box', maxWidth: '1450px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#111827' }}>
            🐄 Control de Pesaje Conectado a Bovinos
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Escribe el número de arete y sal del campo para autocompletar el nombre desde tu tabla de bovinos.
          </p>
        </div>

        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          {mostrarFormulario ? '✕ Cerrar Formulario' : '＋ Registrar Nuevo Pesaje'}
        </button>
      </div>

      {mostrarFormulario && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>✍️ Registrar Nuevo Control de Peso</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Número / Arete</label>
              <input 
                type="text" 
                placeholder="Ej. 142 o A01" 
                value={numero} 
                onChange={(e) => setNumero(e.target.value)} 
                onBlur={(e) => buscarBovinoPorArete(e.target.value)} // <-- AQUÍ BUSCA EN LA TABLA BOVINOS AL SALIR DEL CAMPO
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Nombre</label>
              <input type="text" placeholder="Se autocompleta..." value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#f9fafb' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#fff' }}>
                <option value="Levante">Levante</option>
                <option value="Ceba">Ceba</option>
                <option value="Cría">Cría</option>
                <option value="Reproductor">Reproductor</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Peso Actual (kgs)</label>
              <input type="number" step="0.1" placeholder="445" value={pesoKgs} onChange={(e) => setPesoKgs(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Condición Corporal (1 a 5)</label>
              <select value={condicionCorporal} onChange={(e) => setCondicionCorporal(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#fff' }}>
                <option value="1">1 - Muy Flaca</option>
                <option value="2">2 - Delgada</option>
                <option value="3">3 - Moderada / Ideal</option>
                <option value="4">4 - Buena</option>
                <option value="5">5 - Obesa</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Estado Fisiológico</label>
              <input type="text" placeholder="Ej. Normal" value={estadoFisiologico} onChange={(e) => setEstadoFisiologico(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>Observaciones</label>
              <input type="text" placeholder="Notas..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="submit" style={{ backgroundColor: '#111827', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Guardar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por número o nombre..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', width: '280px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>FECHA</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>NUMERO</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>NOMBRE</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>CATEGORIA</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563', textAlign: 'right' }}>PESO (kgs)</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563', textAlign: 'center' }}>GDP</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563', textAlign: 'center' }}>CONDICION</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>ESTADO</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center' }}>Cargando datos...</td></tr>
              ) : pesajesFiltrados.length > 0 ? (
                pesajesFiltrados.map((item) => {
                  const infoCalc = calcularGDPYInfoAnterior(item)
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>{item.fecha}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700' }}>{item.numero}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>{item.nombre}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px'}}>{item.categoria}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', textAlign: 'right', fontWeight: '700' }}>{item.pesoKgs} kg</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', textAlign: 'center' }}>{infoCalc.gdpText}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', textAlign: 'center' }}>⭐ {item.condicionCorporal}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>{item.estadoFisiologico}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{item.observaciones || '—'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No hay registros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}