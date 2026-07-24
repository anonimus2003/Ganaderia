'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function registrarBovino(formData: FormData) {
  const supabase = createClient()

  // 1. Verificar autenticación del usuario
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No estás autorizado para realizar esta acción.')
  }

  // 2. Extraer de manera limpia la información del formulario
  const arete = formData.get('arete') as string
  const nombre = formData.get('nombre') as string
  const raza = formData.get('raza') as string
  const genero = formData.get('genero') as string
  const peso_inicial = parseFloat(formData.get('peso_inicial') as string)
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string
  const estado = formData.get('estado') as string // Nuevo campo capturado
  const observaciones = formData.get('observaciones') as string

  // 3. Insertar el registro en la base de datos de Supabase
  const { error } = await supabase
    .from('bovinos')
    .insert([
      {
        arete,
        nombre: nombre || null,
        raza,
        genero,
        peso_inicial,
        fecha_nacimiento: fecha_nacimiento || null,
        estado, // Nuevo campo enviado a la BD
        observaciones: observaciones || null,
        creado_por: user.id
      }
    ])

  if (error) {
    console.error('Error al insertar en la base de datos:', error.message)
    return { error: 'Ocurrió un error al intentar registrar el bovino. Asegúrate de que el número de arete no esté duplicado.' }
  }

  // 4. Redireccionar al dashboard tras guardar exitosamente
  redirect('/')
}