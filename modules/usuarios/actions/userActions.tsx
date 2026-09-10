'use server';

import { createClient } from "@/lib/supabase/server";
import { Usuario } from "../schemas";

export async function getUsuarios(): Promise<Usuario[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error de Supabase en getUsuarios:", error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error.message || error);
    return [];
  }
}

export async function createUsuario(data: Omit<Usuario, "id"> & { password?: string; email?: string }): Promise<Usuario> {
  const supabase = await createClient();

  try {
    if (!data.password || !data.email) {
      throw new Error("El correo y la contraseña son obligatorios para crear un usuario.");
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error("No se pudo obtener el ID del usuario creado en Auth.");

    const payload = {
      id: userId,
      nombre: data.nombre,
      apellidos: data.apellidos,
      email: data.email,
      telefono: data.telefono,
      rol: data.rol,
      permisos: data.permisos,
    };

    const { data: profileData, error: profileError } = await supabase
      .from("usuarios")
      .insert(payload)
      .select()
      .single();

    if (profileError) throw profileError;

    return profileData;
  } catch (error: any) {
    console.error("Error al crear usuario:", error.message || error);
    throw new Error(error.message || "Error desconocido al crear el usuario");
  }
}

export async function updateUsuario(id: string, data: Partial<Usuario> & { password?: string }): Promise<Usuario> {
  const supabase = await createClient();

  try {
    const updatePayload: any = {};
    if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
    if (data.apellidos !== undefined) updatePayload.apellidos = data.apellidos;
    if (data.telefono !== undefined) updatePayload.telefono = data.telefono;
    if (data.rol !== undefined) updatePayload.rol = data.rol;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.permisos !== undefined) updatePayload.permisos = data.permisos;
    
    updatePayload.actualizado_en = new Date().toISOString();

    const { data: profileData, error: profileError } = await supabase
      .from("usuarios")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (profileError) throw profileError;

    if (data.password && data.password.trim() !== "") {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password
      });
      if (passwordError) {
        console.warn("No se pudo actualizar la contraseña:", passwordError.message);
      }
    }

    return profileData;
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error.message || error);
    throw new Error(error.message || "Error desconocido al actualizar el usuario");
  }
}

export async function deleteUsuario(id: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error.message || error);
    return false;
  }
}