'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type PermisosModulo = {
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
};

export function usePermissions(rol: string, nombreModulo: string) {
  const [permisos, setPermisos] = useState<PermisosModulo>({
    puede_ver: false,
    puede_crear: false,
    puede_editar: false,
    puede_eliminar: false,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPermisos() {
      if (!rol || !nombreModulo) return;
      
      setLoading(true);
      try {
        // 1. Buscamos el ID del módulo a partir de su nombre (ej: 'reproduccion', 'inventario')
        const { data: moduloData, error: modError } = await supabase
          .from('modulos')
          .select('id')
          .eq('nombre', nombreModulo)
          .single();

        if (modError || !moduloData) {
          console.error("Módulo no encontrado:", nombreModulo);
          setLoading(false);
          return;
        }

        // 2. Consultamos los permisos para ese rol y ese módulo en la tabla permisos_roles
        const { data: permData, error: permError } = await supabase
          .from('permisos_roles')
          .select('puede_ver, puede_crear, puede_editar, puede_eliminar')
          .eq('rol', rol)
          .eq('modulo_id', moduloData.id)
          .single();

        if (permData && !permError) {
          setPermisos({
            puede_ver: permData.puede_ver ?? false,
            puede_crear: permData.puede_crear ?? false,
            puede_editar: permData.puede_editar ?? false,
            puede_eliminar: permData.puede_eliminar ?? false,
          });
        }
      } catch (err) {
        console.error("Error al obtener permisos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPermisos();
  }, [rol, nombreModulo]);

  return { permisos, loading };
}
