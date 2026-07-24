import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache' // Importante para refrescar los datos

export default async function PotrerosPage() {
  const supabase = createClient()

  // 1. Consultar potreros
  const { data: potrerosData, error: errorPotreros } = await supabase
    .from('potreros')
    .select('*')
    .order('nombre', { ascending: true })

  if (errorPotreros) {
    console.error("Error cargando potreros:", errorPotreros.message)
  }
  const potreros = potrerosData || []

  // 2. Consultar historial de abonos
  const { data: historialData, error: errorHistorial } = await supabase
    .from('historial_abonos')
    .select(`
      id, insumo, fecha_aplicacion, cantidad, responsable,
      potreros ( nombre )
    `)
    .order('fecha_aplicacion', { ascending: false })

  const historialAbonos = historialData || []

  // Cálculos rápidos
  const aptos = potreros.filter(p => p.estado === "Apto").length
  const enDescanso = potreros.filter(p => p.estado === "En Descanso").length
  const ocupados = potreros.filter(p => p.estado === "Ocupado").length

  const calcularDiasDesdeSalida = (fechaSalida: string | null) => {
    if (!fechaSalida) return 0
    const fechaPasada = new Date(fechaSalida)
    const hoy = new Date()
    const diferenciaTiempo = hoy.getTime() - fechaPasada.getTime()
    const dias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24))
    return dias >= 0 ? dias : 0
  }

  // =====================================================================
  // 3. SERVER ACTION PARA ACTUALIZAR EL ESTADO Y GANADO (LA LÓGICA NUEVA)
  // =====================================================================
  async function moverGanadoAction(formData: FormData) {
    'use server'
    const supabaseClient = createClient() // Crear cliente dentro de la acción

    const id = formData.get('id') as string
    const nuevoEstado = formData.get('nuevoEstado') as string
    const bovinos = parseInt(formData.get('bovinos_actuales') as string) || 0

    // Objeto con los datos a actualizar
    const datosActualizacion: any = {
      estado: nuevoEstado,
      bovinos_actuales: bovinos
    }

    // LÓGICA INTELIGENTE DE FECHAS:
    // Si el potrero pasa a "Ocupado", registramos automáticamente la fecha de entrada.
    // Si el potrero pasa a "En Descanso" (o Apto), registramos la fecha de salida del ganado.
    if (nuevoEstado === 'Ocupado') {
      // Asegúrate de tener una columna 'fecha_entrada_ganado' en tu tabla potreros
      datosActualizacion.fecha_entrada_ganado = new Date().toISOString().split('T')[0] // Fecha de hoy YYYY-MM-DD
      // Si entra ganado, opcionalmente reseteamos los días de descanso
      datosActualizacion.dias_descanso = 0 
    } 
    // Opcional: Si sale el ganado, guardamos la fecha de salida para el descanso
    /* 
    else if (nuevoEstado === 'En Descanso') {
       datosActualizacion.fecha_salida_ganado = new Date().toISOString().split('T')[0]
    } 
    */

    // Ejecutar el UPDATE en Supabase
    const { error } = await supabaseClient
      .from('potreros')
      .update(datosActualizacion)
      .eq('id', id)

    if (error) {
      console.error("Error al mover ganado:", error.message)
      // Podrías manejar un estado de error aquí
      return
    }

    // Refrescar la página actual para que los cambios se reflejen inmediatamente
    revalidatePath('/potreros')
  }


  return (
    <>
      {/* Fila de Tarjetas de Estado General (Sin cambios) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#71717a' }}>Potreros Aptos (Listos)</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{aptos}</h3>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#71717a' }}>En Periodo de Descanso</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{enDescanso}</h3>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#71717a' }}>Ocupados actualmente</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{ocupados}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#09090b' }}>
          Estado de Potreros y Rotación
        </h2>
        <Link href="/potreros/nuevo">
          <button style={{ backgroundColor: '#09090b', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            + Registrar Potrero Nuevo
          </button>
        </Link>
      </div>

      {/* Grilla de Potreros con Botones de Acción Rápida */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {potreros.map((potrero) => {
          // Colores de estado (Sin cambios)
          const badgeColors = {
            "Apto": { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: '✅ LISTO' },
            "En Descanso": { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: '⏳ EN DESCANSO' },
            "Ocupado": { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: '🐄 OCUPADO' }
          }[potrero.estado as "Apto" | "En Descanso" | "Ocupado"] || { bg: '#f4f4f5', text: '#71717a', border: '#e4e4e7', label: '...' }

          const diasDescansoReal = potrero.estado !== "Ocupado" ? calcularDiasDesdeSalida(potrero.fecha_salida_ganado) : 0
          const diasMetaDescanso = 45
          const porcentajeProgreso = potrero.estado === "Ocupado" ? 0 : Math.min(Math.round((diasDescansoReal / diasMetaDescanso) * 100), 100)

          // ===============================================================================
          // 4. FORMULARIO INTEGRADO EN CADA TARJETA (PARA GESTIONAR LA ROTACIÓN RÁPIDA)
          // ===============================================================================
          const estaOcupado = potrero.estado === 'Ocupado';
          const textoBotonAccion = estaOcupado ? "🔄 Sacar Ganado" : "🐄 Meter Ganado";
          const nuevoEstadoDestino = estaOcupado ? "En Descanso" : "Ocupado";
          const colorBotonAccion = estaOcupado ? "#3b82f6" : "#10b981"; // Azul para sacar, Verde para meter

          return (
            <div key={potrero.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              
              {/* Cabecera de la Tarjeta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{potrero.nombre}</h3>
                  <span style={{ fontSize: '12px', color: '#71717a' }}>📏 {potrero.area_m2 ? `${Number(potrero.area_m2).toLocaleString()} m²` : 'Área no especificada'}</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: badgeColors.bg, color: badgeColors.text, padding: '4px 6px', borderRadius: '6px', border: `1px solid ${badgeColors.border}` }}>
                  {badgeColors.label}
                </span>
              </div>

              {/* Datos clave */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#71717a' }}>Pasto:</span>
                  <strong style={{ display: 'block', color: '#09090b' }}>{potrero.tipo_pasto || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#71717a' }}>Días sin uso:</span>
                  <strong style={{ display: 'block', color: '#2563eb' }}>{diasDescansoReal} días</strong>
                </div>
                <div>
                  <span style={{ color: '#71717a' }}>Animales:</span>
                  <strong style={{ display: 'block', color: '#ef4444' }}>{potrero.bovinos_actuales || 0} cabezas</strong>
                </div>
              </div>

              {/* Barra de progreso (Sin cambios) */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#71717a' }}>Progreso de Recuperación</span>
                  <strong style={{ color: '#09090b' }}>{porcentajeProgreso}%</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e4e4e7', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${porcentajeProgreso}%`, height: '100%', backgroundColor: porcentajeProgreso > 80 ? '#10b981' : '#3b82f6', borderRadius: '3px' }} />
                </div>
              </div>

              {/* ============================================================ */}
              {/* ZONA DE ACCIÓN RÁPIDA: FORMULARIO PARA ACTUALIZAR ESTADO    */}
              {/* ============================================================ */}
              <form action={moverGanadoAction} style={{ marginTop: 'auto', borderTop: '1px solid #f4f4f5', paddingTop: '12px' }}>
                {/* Campos ocultos necesarios para la actualización */}
                <input type="hidden" name="id" value={potrero.id} />
                <input type="hidden" name="nuevoEstado" value={nuevoEstadoDestino} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Input para editar la cantidad de bovinos si se van a meter */}
                  {!estaOcupado && (
                    <input 
                      type="number" 
                      name="bovinos_actuales" 
                      placeholder="Cant. vacas" 
                      min="1" 
                      required 
                      style={{ width: '100px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e4e4e7', fontSize: '13px', outline: 'none' }}
                    />
                  )}
                  
                  {/* Input fijo si está ocupado para que el formulario funcione */}
                  {estaOcupado && (
                    <input type="hidden" name="bovinos_actuales" value="0" />
                  )}

                  {/* BOTÓN DE ACCIÓN (Submit) */}
                  <button type="submit" style={{ 
                    flexGrow: 1, 
                    backgroundColor: colorBotonAccion, 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: '6px', 
                    padding: '7px 12px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}>
                    {textoBotonAccion}
                  </button>
                </div>
                
                {/* Texto de ayuda dinámico para el botón */}
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#71717a', fontStyle: 'italic', textAlign: 'center' }}>
                   {estaOcupado 
                      ? `Al sacar el ganado, el potrero entrará en descanso automático.`
                      : `Introduce cuántas cabezas entran para activar el potrero.`
                   }
                </p>
                
              </form>
            </div>
          )
        })}
      </div>
      
      {/* Historial de Abonos (Sin cambios) */}
      {/* ... (omito el código de la tabla de abonos para centrarme en la grilla) ... */}
    </>
  )
}