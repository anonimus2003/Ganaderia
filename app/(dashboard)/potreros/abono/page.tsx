import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NuevoAbonoPage() {
  const supabase = createClient()

  // 1. Obtener la lista de potreros para llenar el selector
  const { data: potreros } = await supabase
    .from('potreros')
    .select('id, nombre')
    .order('nombre', { ascending: true })

  // 2. Server Action para guardar el abono y actualizar la tarjeta del potrero
  async function registrarAbono(formData: FormData) {
    'use server'

    const supabase = createClient()

    const potrero_id = formData.get('potrero_id')
    const insumo = formData.get('insumo') as string
    const fecha_aplicacion = formData.get('fecha_aplicacion') as string
    const cantidad = formData.get('cantidad')
    const responsable = formData.get('responsable')

    if (!potrero_id || !insumo || !fecha_aplicacion) {
      console.error('Faltan campos obligatorios.')
      return
    }

    // A. Insertar en la tabla de historial_abonos
    const { error: errorHistorial } = await supabase.from('historial_abonos').insert([
      {
        potrero_id: Number(potrero_id),
        insumo,
        fecha_aplicacion,
        cantidad,
        responsable,
      },
    ])

    if (errorHistorial) {
      console.error('Error al guardar en el historial:', errorHistorial.message)
      return
    }

    // B. Actualizar el resumen directamente en la tarjeta de la tabla potreros
    const { error: errorPotrero } = await supabase
      .from('potreros')
      .update({
        ultimo_abono: insumo,
        fecha_abono: fecha_aplicacion,
      })
      .eq('id', Number(potrero_id))

    if (errorPotrero) {
      console.error('Error al actualizar el estado del potrero:', errorPotrero.message)
      return
    }

    // C. Redirigir de regreso al panel principal de potreros
    redirect('/potreros')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
        <Link href="/dashboard/potreros" style={{ color: '#71717a', textDecoration: 'none', fontSize: '14px' }}>
          ← Volver a Potreros
        </Link>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Registrar Abono o Mantenimiento</h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#71717a' }}>
          Anota los insumos aplicados (fertilizantes, urea, cal, etc.) para mantener la trazabilidad de tus potreros.
        </p>

        <form action={registrarAbono} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#09090b' }}>
              Seleccionar Potrero *
            </label>
            <select 
              name="potrero_id" 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', backgroundColor: '#fff' }}
            >
              <option value="">-- Elige un potrero --</option>
              {potreros?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#09090b' }}>
              Insumo / Abono Aplicado *
            </label>
            <input 
              type="text" 
              name="insumo" 
              required 
              placeholder="Ej: Urea 46%, Abono Orgánico, Cal Agrícola"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#09090b' }}>
                Cantidad Aplicada *
              </label>
              <input 
                type="text" 
                name="cantidad" 
                required 
                placeholder="Ej: 150 Kg o 5 Bultos"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#09090b' }}>
                Fecha de Aplicación *
              </label>
              <input 
                type="date" 
                name="fecha_aplicacion" 
                defaultValue={new Date().toISOString().split('T')[0]}
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#09090b' }}>
              Responsable / Operario
            </label>
            <input 
              type="text" 
              name="responsable" 
              placeholder="Ej: Carlos Gómez o Estudiantes SENA"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Link href="/dashboard/potreros">
              <button type="button" style={{ backgroundColor: '#f4f4f5', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Cancelar
              </button>
            </Link>
            <button type="submit" style={{ backgroundColor: '#09090b', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}