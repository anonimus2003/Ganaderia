import { getMatrizPermisosData, getUsuarios } from '@/modules/usuarios/actions/userActions'
import UsuariosTable from '@/modules/usuarios/components/UsuariosTable'
import MatrizPermisos from '@/modules/usuarios/components/MatrizPermisos'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, ShieldCheck } from 'lucide-react'

export default async function UsuariosPage() {
  const [matrizRes, usuariosRes] = await Promise.all([
    getMatrizPermisosData(),
    getUsuarios(),
  ])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios y Permisos</h1>
        <p className="text-sm text-muted-foreground">
          Administra los accesos del personal y define sus permisos sobre los módulos de la hacienda.
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="usuarios" className="gap-2 text-xs">
            <Users className="h-4 w-4" /> Directorio de Usuarios
          </TabsTrigger>
          <TabsTrigger value="permisos" className="gap-2 text-xs">
            <ShieldCheck className="h-4 w-4" /> Matriz de Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <UsuariosTable usuarios={usuariosRes.data || []} />
        </TabsContent>

        <TabsContent value="permisos">
          <MatrizPermisos
            modulos={matrizRes.modulos || []}
            permisosIniciales={matrizRes.permisos || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}