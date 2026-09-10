'use client'

import { useState, useTransition } from 'react'
import { guardarMatrizPermisos, PermisoRolPayload, RolValido } from '../actions/userActions'

// Componentes de UI de shadcn
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Save, ShieldCheck } from 'lucide-react'

const ROLES_LISTA: RolValido[] = [
  'Administrador',
  'Veterinario',
  'Ordeñador',
  'Obrero',
  'Potreros',
  'Trabajador'
]

export interface Modulo {
  id: string
  nombre: string
  etiqueta: string
  categoria: string
}

export interface PermisoRol {
  id?: string
  rol: RolValido
  modulo_id: string
  puede_ver: boolean
  puede_crear: boolean
  puede_editar: boolean
  puede_eliminar: boolean
}

interface MatrizPermisosProps {
  modulos: Modulo[]
  permisosIniciales: PermisoRol[]
}

export default function MatrizPermisos({ modulos = [], permisosIniciales = [] }: MatrizPermisosProps) {
  const [permisos, setPermisos] = useState<PermisoRol[]>(permisosIniciales)
  const [isPending, startTransition] = useTransition()

  // Buscar un permiso específico o devolver el estado por defecto
  const getPermiso = (rol: RolValido, moduloId: string): PermisoRol => {
    return (
      permisos.find(p => p.rol === rol && p.modulo_id === moduloId) || {
        rol,
        modulo_id: moduloId,
        puede_ver: false,
        puede_crear: false,
        puede_editar: false,
        puede_eliminar: false
      }
    )
  }

  // Manejar el cambio de un checkbox
  const handleCheckboxChange = (
    rol: RolValido,
    moduloId: string,
    campo: 'puede_ver' | 'puede_crear' | 'puede_editar' | 'puede_eliminar',
    valor: boolean
  ) => {
    setPermisos(prev => {
      const existeIndex = prev.findIndex(p => p.rol === rol && p.modulo_id === moduloId)

      if (existeIndex >= 0) {
        const copia = [...prev]
        copia[existeIndex] = { ...copia[existeIndex], [campo]: valor }
        return copia
      } else {
        const nuevo: PermisoRol = {
          rol,
          modulo_id: moduloId,
          puede_ver: false,
          puede_crear: false,
          puede_editar: false,
          puede_eliminar: false,
          [campo]: valor
        }
        return [...prev, nuevo]
      }
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await guardarMatrizPermisos(permisos as PermisoRolPayload[])
        if (res?.success) {
          toast.success('Matriz de permisos actualizada correctamente')
        } else {
          toast.error(res?.error || 'Ocurrió un error al guardar los permisos')
        }
      } catch (error) {
        toast.error('Error de conexión con el servidor')
      }
    })
  }

  return (
    <Card className="w-full shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Matriz de Permisos por Rol
          </CardTitle>
          <CardDescription>
            Configura las acciones de acceso (Ver, Crear, Editar, Eliminar) para cada módulo del sistema.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="gap-2">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px] font-bold">Módulo / Categoría</TableHead>
              {ROLES_LISTA.map(rol => (
                <TableHead key={rol} className="text-center font-bold min-w-[140px]">
                  {rol}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {modulos.map(mod => (
              <TableRow key={mod.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="align-top py-4">
                  <div className="font-semibold text-foreground">{mod.etiqueta}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {mod.categoria}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">({mod.nombre})</span>
                  </div>
                </TableCell>

                {ROLES_LISTA.map(rol => {
                  const perm = getPermiso(rol, mod.id)
                  const isAdmin = rol === 'Administrador'

                  return (
                    <TableCell key={rol} className="align-top text-center p-3 border-l">
                      <div className="flex flex-col gap-2 items-start bg-background p-2.5 rounded-lg border text-xs shadow-xs">
                        {/* Permiso Ver */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <Checkbox
                            checked={isAdmin ? true : perm.puede_ver}
                            disabled={isAdmin}
                            onCheckedChange={checked =>
                              handleCheckboxChange(rol, mod.id, 'puede_ver', Boolean(checked))
                            }
                          />
                          <span className="font-medium">Ver</span>
                        </label>

                        {/* Permiso Crear */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <Checkbox
                            checked={isAdmin ? true : perm.puede_crear}
                            disabled={isAdmin}
                            onCheckedChange={checked =>
                              handleCheckboxChange(rol, mod.id, 'puede_crear', Boolean(checked))
                            }
                          />
                          <span className="font-medium">Crear</span>
                        </label>

                        {/* Permiso Editar */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <Checkbox
                            checked={isAdmin ? true : perm.puede_editar}
                            disabled={isAdmin}
                            onCheckedChange={checked =>
                              handleCheckboxChange(rol, mod.id, 'puede_editar', Boolean(checked))
                            }
                          />
                          <span className="font-medium">Editar</span>
                        </label>

                        {/* Permiso Eliminar */}
                        <label className="flex items-center gap-2 cursor-pointer select-none text-destructive">
                          <Checkbox
                            checked={isAdmin ? true : perm.puede_eliminar}
                            disabled={isAdmin}
                            className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                            onCheckedChange={checked =>
                              handleCheckboxChange(rol, mod.id, 'puede_eliminar', Boolean(checked))
                            }
                          />
                          <span className="font-medium">Eliminar</span>
                        </label>
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}