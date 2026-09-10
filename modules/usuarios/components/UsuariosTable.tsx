'use client'

import { useState, useMemo, useTransition } from 'react'
import { Usuario, ROLES_LISTA, RolValido } from '../schemas'
import { cambiarRolUsuario } from '../actions/userActions'
import UsuarioModal from './UsuarioModal'

// Componentes UI de shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

// Componente para cambiar el rol del usuario en vivo
function RolCell({ usuario }: { usuario: Usuario }) {
  const [isPending, startTransition] = useTransition()
  const [rolActual, setRolActual] = useState<RolValido>(usuario.rol)

  const handleRolChange = (nuevoRol: RolValido) => {
    const rolAnterior = rolActual
    setRolActual(nuevoRol)

    startTransition(async () => {
      const res = await cambiarRolUsuario(usuario.id, nuevoRol)
      if (res.success) {
        toast.success(`Rol de ${usuario.nombre} actualizado a "${nuevoRol}"`)
      } else {
        setRolActual(rolAnterior)
        toast.error(res.error || 'Error al actualizar el rol')
      }
    })
  }

  const badgeColor = {
    Administrador: 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
    Veterinario: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    Ordeñador: 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    Obrero: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    Potreros: 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    Trabajador: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  }[rolActual]

  return (
    <Select
      value={rolActual}
      onValueChange={(val) => handleRolChange(val as RolValido)}
      disabled={isPending}
    >
      <SelectTrigger className={`h-8 text-xs font-semibold w-[140px] border ${badgeColor}`}>
        {isPending ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Guardando...</span>
          </div>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {ROLES_LISTA.map((rol) => (
          <SelectItem key={rol} value={rol} className="text-xs font-medium">
            {rol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface UsuariosTableProps {
  usuarios: Usuario[]
}

export default function UsuariosTable({ usuarios = [] }: UsuariosTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Estado para modal
  const [modalOpen, setModalOpen] = useState(false)
  const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null)

  const handleCrearNuevo = () => {
    setUsuarioAEditar(null)
    setModalOpen(true)
  }

  const handleEditar = (usuario: Usuario) => {
    setUsuarioAEditar(usuario)
    setModalOpen(true)
  }

  // 1. Filtrado de usuarios según búsqueda
  const usuariosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return usuarios

    const busqueda = searchTerm.toLowerCase()
    return usuarios.filter((u) => {
      const nombreCompleto = `${u.nombre} ${u.apellidos || ''}`.toLowerCase()
      const email = (u.email || '').toLowerCase()
      const rol = (u.rol || '').toLowerCase()
      const telefono = u.telefono || ''

      return (
        nombreCompleto.includes(busqueda) ||
        email.includes(busqueda) ||
        rol.includes(busqueda) ||
        telefono.includes(busqueda)
      )
    })
  }, [usuarios, searchTerm])

  // 2. Paginación manual
  const totalPages = Math.ceil(usuariosFiltrados.length / pageSize) || 1

  const usuariosPaginados = useMemo(() => {
    const inicio = (currentPage - 1) * pageSize
    return usuariosFiltrados.slice(inicio, inicio + pageSize)
  }, [usuariosFiltrados, currentPage, pageSize])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reiniciar a la primera página cuando se busca
  }

  return (
    <>
      <Card className="w-full shadow-sm border-border">
        {/* Encabezado */}
        <CardHeader className="space-y-4 pb-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Directorio de Usuarios
              </CardTitle>
              <CardDescription>
                Administra el personal de la hacienda, asigna roles y actualiza su información.
              </CardDescription>
            </div>
            <Button onClick={handleCrearNuevo} className="gap-2 self-start sm:self-auto">
              <UserPlus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, correo, rol..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>

        {/* Tabla */}
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Usuario</TableHead>
                <TableHead className="font-bold">Teléfono</TableHead>
                <TableHead className="font-bold">Rol Asignado</TableHead>
                <TableHead className="font-bold">Fecha Registro</TableHead>
                <TableHead className="font-bold text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosPaginados.length > 0 ? (
                usuariosPaginados.map((u) => {
                  const nombreCompleto = `${u.nombre} ${u.apellidos || ''}`.trim()
                  const iniciales = `${u.nombre?.[0] || ''}${u.apellidos?.[0] || ''}`.toUpperCase() || 'U'
                  const fecha = u.creado_en ? new Date(u.creado_en) : null

                  return (
                    <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                      {/* Usuario / Avatar */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {iniciales}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground">
                              {nombreCompleto}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 inline" />
                              {u.email || 'Sin correo'}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Teléfono */}
                      <TableCell className="py-3">
                        {u.telefono ? (
                          <span className="text-xs font-medium text-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {u.telefono}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Sin registrar</span>
                        )}
                      </TableCell>

                      {/* Rol */}
                      <TableCell className="py-3">
                        <RolCell usuario={u} />
                      </TableCell>

                      {/* Fecha de Registro */}
                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground font-mono">
                          {fecha
                            ? fecha.toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors outline-none focus:ring-1 focus:ring-ring">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditar(u)}
                              className="gap-2 cursor-pointer text-xs font-medium"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No se encontraron usuarios registrados o que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <div>
              Mostrando {usuariosPaginados.length} de {usuariosFiltrados.length} usuario(s)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para Crear / Editar */}
      <UsuarioModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        usuario={usuarioAEditar}
      />
    </>
  )
}