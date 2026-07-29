// Archivo: src/app/(dashboard)/inventario/nuevo/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function registrarBovino(formData: FormData) {
  const supabase = createClient();

  // 1. Verificar autenticación del usuario
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Devolvemos un objeto error en lugar de lanzar throw
    return { error: 'No estás autorizado para realizar esta acción.' };
  }

  // 2. Extraer la información del formulario
  const arete = formData.get('arete') as string;
  const nombre = formData.get('nombre') as string;
  const raza = formData.get('raza') as string;
  const genero = formData.get('genero') as string;
  const peso_inicial_str = formData.get('peso_inicial') as string;
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string;
  const estado = formData.get('estado') as string;
  const observaciones = formData.get('observaciones') as string;

  // Validación básica
  if (!arete || !raza || !genero || !peso_inicial_str || !estado) {
    return { error: 'Por favor complete todos los campos obligatorios marcados con *' };
  }

  const peso_inicial = parseFloat(peso_inicial_str);

  // 3. Insertar el registro en la base de datos
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
        estado,
        observaciones: observaciones || null,
        creado_por: user.id
      }
    ]);

  if (error) {
    console.error('Error al insertar en BD:', error.message);
    // Retornamos un objeto con el mensaje de error
    return { error: 'Ocurrió un error al intentar registrar el bovino. Es posible que el número de arete ya exista.' };
  }

  // 4. ÉXITO: Revalidamos la página de inventario para que aparezca el nuevo animal
  revalidatePath('/inventario');
  
  // Retornamos un objeto indicando éxito (sin propiedad error)
  return { success: true };
}