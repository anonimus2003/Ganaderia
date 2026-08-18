'use server';

import { createClient } from "@/lib/supabase/server";
import { UserFormValues } from "../schemas";

export async function createUserAction(data: UserFormValues) {
  const supabase = await createClient();

  try {
    if (!data.password) {
      throw new Error("La contraseña es obligatoria para crear un usuario nuevo.");
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error("No se pudo obtener el ID del usuario creado.");

    const { error: profileError } = await supabase
      .from("perfiles")
      .upsert({
        id: userId,
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono,
        rol: data.rol,
      });

    if (profileError) throw profileError;

    return { success: true };
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);
    return { success: false, error: error.message || "Error desconocido al registrar" };
  }
}

export async function updateUserAction(id: string, data: UserFormValues) {
  const supabase = await createClient();

  try {
    const { error: profileError } = await supabase
      .from("perfiles")
      .update({
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono,
        rol: data.rol,
      })
      .eq("id", id);

    if (profileError) throw profileError;

    // Nota: Si quieres actualizar la contraseña desde el servidor de forma segura, 
    // se recomienda usar el cliente con service_role si tu app lo requiere, 
    // o simplemente omitirlo si la gestión de contraseñas se hace por correo de recuperación.
    if (data.password && data.password.trim() !== "") {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password
      });
      if (passwordError) {
        // Si falla por permisos de admin, puedes ignorarlo o manejarlo según tu configuración de Supabase
        console.warn("No se pudo actualizar la contraseña mediante auth estándar:", passwordError.message);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return { success: false, error: error.message || "Error desconocido al actualizar" };
  }
}