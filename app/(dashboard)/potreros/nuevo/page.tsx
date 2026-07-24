import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NuevoPotreroPage() {
  const supabase = createClient()

  // 1. Validar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil para la interfaz del Sidebar
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user.id)
    .single()

  // 3. Server Action para procesar la creación del potrero
  async function registrarPotrero(formData: FormData) {
    'use server'

    const supabase = createClient()

    // Extraer y procesar los campos del formulario
    const nombre = formData.get('nombre') as string
    const estado = formData.get('estado') as string
    const tipo_pasto = formData.get('tipo_pasto') as string
    const area_m2 = parseFloat(formData.get('area_m2') as string) || 0
    const bovinos_actuales = parseInt(formData.get('bovinos_actuales') as string) || 0
    
    const rawUltimoAbono = formData.get('ultimo_abono') as string
    const ultimo_abono = (rawUltimoAbono && rawUltimoAbono.trim() !== '') ? rawUltimoAbono : null

    const rawFechaAbono = formData.get('fecha_abono') as string
    const fecha_abono = (rawFechaAbono && rawFechaAbono.trim() !== '') ? rawFechaAbono : null

    // Insertar en la base de datos ajustado a tu tabla actual de Supabase
    const { error } = await supabase
      .from('potreros')
      .insert([
        {
          nombre,
          estado,
          tipo_pasto,
          area_m2,
          bovinos_actuales,
          ultimo_abono,
          fecha_abono
        }
      ])

    if (error) {
      console.error("DETALLE DEL ERROR SUPABASE:", error.message)
      return
    }

    // Redirigir de vuelta al listado de potreros
    redirect('/potreros')
  }

  // Server Action para cerrar sesión
  async function logout() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      minHeight: '100vh', 
      backgroundColor: '#fcfcfc', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#09090b',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. CONTENEDOR PRINCIPAL */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>

        {/* Contenido Formulario */}
        <main style={{ padding: '32px 24px', boxSizing: 'border-box', flexGrow: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '640px' }}>
            
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Registrar Nuevo Potrero</h1>
              <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>Introduce los datos de la nueva división y su superficie en metros cuadrados.</p>
            </div>

            <form action={registrarPotrero} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
              
              {/* Nombre del Potrero */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="nombre" style={{ fontSize: '13px', fontWeight: '600', color: '#3f3f46' }}>Nombre del Potrero o Zona</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  required 
                  placeholder="Ej. Potrero El Prado (Zona A)" 
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none' }}
                />
              </div>

              {/* Fila: Estado y Tipo de Pasto */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="estado" style={{ fontSize: '13px', fontWeight: '600', color: '#3f3f46' }}>Estado Inicial</label>
                  <select 
                    id="estado" 
                    name="estado" 
                    required 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', color: '#09090b', backgroundColor: '#ffffff', outline: 'none' }}
                  >
                    <option value="En Descanso">En Descanso / Recuperación</option>
                    <option value="Apto">Apto (Listo para pastoreo)</option>
                    <option value="Ocupado">Ocupado actualmente</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="tipo_pasto" style={{ fontSize: '13px', fontWeight: '600', color: '#3f3f46' }}>Tipo de Pasto</label>
                  <input 
                    type="text" 
                    id="tipo_pasto" 
                    name="tipo_pasto" 
                    required 
                    placeholder="Ej. Estrella, Brachiaria, Kikuyo" 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Fila: Metros Cuadrados y Cabezas de Ganado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="area_m2" style={{ fontSize: '13px', fontWeight: '600', color: '#3f3f46' }}>Superficie (m²)</label>
                  <input 
                    type="number" 
                    id="area_m2" 
                    name="area_m2" 
                    step="any"
                    min="0" 
                    required 
                    placeholder="Ej. 5000" 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="bovinos_actuales" style={{ fontSize: '13px', fontWeight: '600', color: '#3f3f46' }}>Cabezas de Ganado Actuales</label>
                  <input 
                    type="number" 
                    id="bovinos_actuales" 
                    name="bovinos_actuales" 
                    min="0" 
                    defaultValue="0" 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Divisor Visual para sección de Abonos */}
              <div style={{ borderTop: '1px solid #f4f4f5', margin: '10px 0' }} />

              <span style={{ fontSize: '12px', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Último Tratamiento / Abono (Opcional)</span>

              {/* Fila: Insumo y Fecha de Abono */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="ultimo_abono" style={{ fontSize: '13px', fontWeight: '600', color: '#3f3f46' }}>Abono Aplicado</label>
                  <input 
                    type="text" 
                    id="ultimo_abono" 
                    name="ultimo_abono" 
                    placeholder="Ej. Urea, Triple 15, Compost" 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="fecha_abono" style={{ fontSize: '13px', fontWeight: '600', color: '#3f3f46' }}>Fecha de Aplicación</label>
                  <input 
                    type="date" 
                    id="fecha_abono" 
                    name="fecha_abono" 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', color: '#09090b', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Botonera de Envío */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <Link href="/potreros" style={{ textDecoration: 'none' }}>
                  <button type="button" style={{ 
                    padding: '10px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e4e4e7', 
                    backgroundColor: '#ffffff', 
                    color: '#09090b', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}>
                    Cancelar
                  </button>
                </Link>
                
                <button type="submit" style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  backgroundColor: '#09090b', 
                  color: '#ffffff', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}>
                  Guardar Potrero
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>

    </div>
  )
}