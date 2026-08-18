// hooks/useModuloPermissions.ts
'use client';
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useModuloPermissions(nombreModulo: string) {
  const [permisos, setPermisos] = useState({
    puede_ver: true,
    puede_crear: true,
    puede_editar: true,
    puede_eliminar: true,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function cargarPermisos() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // 1. Obtener rol del usuario
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('email', user.email)
          .single();

        if (!perfil?.rol) return;
        if (perfil.rol === 'Administrador') {
          // El admin tiene todo permitido por defecto
          setLoading(false);
          return;
        }

        // 2. Obtener ID del módulo
        const { data: modulo } = await supabase
          .from('modulos')
          .select('id')
          .eq('nombre', nombreModulo)
          .single();

        if (!modulo) return;

        // 3. Obtener permisos de la tabla permisos_roles
        const { data: perm } = await supabase
          .from('permisos_roles')
          .select('puede_ver, puede_crear, puede_editar, puede_eliminar')
          .eq('rol', perfil.rol)
          .eq('modulo_id', modulo.id)
          .single();

        if (perm) {
          setPermisos(perm);
        }
      } catch (error) {
        console.error("Error cargando permisos:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarPermisos();
  }, [nombreModulo, supabase]);

  return { permisos, loading };
}