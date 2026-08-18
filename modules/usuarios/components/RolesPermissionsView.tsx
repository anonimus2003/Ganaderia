'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Save, Loader2 } from 'lucide-react';

const ROLES = ['Administrador', 'Veterinario', 'Ordeñador', 'Obrero', 'Potreros', 'Trabajador'];

type Modulo = { id: string; nombre: string; etiqueta: string };
type Permiso = {
  modulo_id: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
};

export function RolesPermissionsView() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [permisos, setPermisos] = useState<Record<string, Permiso>>({});
  const [rolSeleccionado, setRolSeleccionado] = useState('Administrador');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Traer módulos de Supabase
        const { data: modulosData, error: modError } = await supabase.from('modulos').select('*');
        
        if (modError) {
          console.error("Error al traer módulos:", modError.message);
          throw modError;
        }

        console.log("Módulos obtenidos exitosamente desde Supabase:", modulosData);

        // 2. Traer permisos del rol seleccionado
        const { data: permisosData, error: permError } = await supabase
          .from('permisos_roles')
          .select('*')
          .eq('rol', rolSeleccionado);

        if (permError) {
          console.error("Error al traer permisos:", permError.message);
          throw permError;
        }

        setModulos(modulosData || []);
        
        // 3. Mapear permisos con los módulos
        const map: Record<string, Permiso> = {};
        modulosData?.forEach((m: any) => {
          const p = permisosData?.find((item: any) => item.modulo_id === m.id);
          map[m.id] = p || { 
            modulo_id: m.id, 
            puede_ver: false, 
            puede_crear: false, 
            puede_editar: false, 
            puede_eliminar: false 
          };
        });
        setPermisos(map);
      } catch (err: any) {
        console.error("Error general en fetchData:", err.message || err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [rolSeleccionado]);

  const togglePermiso = (moduloId: string, campo: keyof Permiso) => {
    setPermisos(prev => ({
      ...prev,
      [moduloId]: { ...prev[moduloId], [campo]: !prev[moduloId][campo] }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.values(permisos).map((p) => ({
        rol: rolSeleccionado,
        modulo_id: p.modulo_id,
        puede_ver: p.puede_ver,
        puede_crear: p.puede_crear,
        puede_editar: p.puede_editar,
        puede_eliminar: p.puede_eliminar,
      }));

      const { error } = await supabase.from('permisos_roles').upsert(payload, { onConflict: 'rol,modulo_id' });
      if (error) throw error;
      alert("Permisos actualizados correctamente para " + rolSeleccionado);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 text-zinc-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Cargando matriz de permisos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#01684c]" />
          <span className="text-sm font-semibold text-zinc-700">Selecciona el rol a configurar:</span>
        </div>
        <select 
          value={rolSeleccionado} 
          onChange={(e) => setRolSeleccionado(e.target.value)} 
          className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 bg-white outline-none cursor-pointer"
        >
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="border border-zinc-100 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
              <th className="py-3 px-4">Módulo</th>
              <th className="py-3 px-4 text-center">Ver</th>
              <th className="py-3 px-4 text-center">Crear</th>
              <th className="py-3 px-4 text-center">Editar</th>
              <th className="py-3 px-4 text-center">Eliminar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {modulos.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-400 font-medium">No hay módulos disponibles.</td>
              </tr>
            ) : (
              modulos.map(m => (
                <tr key={m.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-zinc-800">{m.etiqueta}</td>
                  {(['puede_ver', 'puede_crear', 'puede_editar', 'puede_eliminar'] as const).map(campo => (
                    <td key={campo} className="py-3.5 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={permisos[m.id]?.[campo] || false} 
                        onChange={() => togglePermiso(m.id, campo)} 
                        className="w-4 h-4 accent-[#01684c] rounded cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2.5 bg-[#01684c] text-white rounded-xl font-bold text-sm hover:bg-[#01563f] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Guardando..." : "Guardar Permisos"}
        </button>
      </div>
    </div>
  );
}