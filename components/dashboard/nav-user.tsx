"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import {
  AccountDialog,
  type AccountProfilePayload,
} from "@/components/dashboard/AccountDialog"
import { HelpSupportDialog } from "@/components/dashboard/HelpSupportDialog"
import { NotificationsDialog } from "@/components/dashboard/NotificationsDialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  HelpCircleIcon,
  BellIcon,
  LogOutIcon,
} from "lucide-react"

interface NavUserData {
  id: string
  name: string
  nombre: string
  apellidos: string
  telefono: string
  email: string
  avatar: string
  rol: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "US"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function NavUser({
  user,
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const supabase = createClient()

  const [accountOpen, setAccountOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const [currentUser, setCurrentUser] = useState<NavUserData>({
    id: "",
    name: user?.name || "Cargando...",
    nombre: "",
    apellidos: "",
    telefono: "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    rol: "Trabajador",
  })

  const syncUserProfile = useCallback(
    async (
      authUser: {
        id: string
        email?: string | null
        user_metadata?: Record<string, unknown>
      } | null
    ) => {
      if (!authUser) return

      const meta = authUser.user_metadata ?? {}
      let nombre = typeof meta.nombre === "string" ? meta.nombre.trim() : ""
      let apellidos =
        typeof meta.apellidos === "string" ? meta.apellidos.trim() : ""
      let telefono =
        typeof meta.telefono === "string" ? meta.telefono.trim() : ""
      const fullNameMeta =
        typeof meta.full_name === "string"
          ? meta.full_name.trim()
          : typeof meta.name === "string"
            ? meta.name.trim()
            : ""
      const avatar =
        typeof meta.avatar_url === "string"
          ? meta.avatar_url
          : typeof meta.picture === "string"
            ? meta.picture
            : ""
      let rol =
        typeof meta.rol === "string" && meta.rol.trim()
          ? meta.rol.trim()
          : "Trabajador"

      const { data: perfil, error } = await supabase
        .from("perfiles")
        .select("nombre, apellidos, telefono, rol, email")
        .eq("id", authUser.id)
        .maybeSingle()

      if (error) {
        console.error("Error leyendo perfil:", error.message)
      }

      if (perfil) {
        nombre = perfil.nombre?.trim() || nombre
        apellidos = perfil.apellidos?.trim() || apellidos
        telefono = perfil.telefono?.trim() || telefono
        rol = perfil.rol?.trim() || rol
      }

      const email = authUser.email ?? ""
      const fallbackName = email ? email.split("@")[0] : "Usuario"
      const combinedName =
        [nombre, apellidos].filter(Boolean).join(" ") ||
        fullNameMeta ||
        fallbackName

      setCurrentUser({
        id: authUser.id,
        name: combinedName,
        nombre,
        apellidos,
        telefono,
        email,
        avatar,
        rol,
      })
    },
    [supabase]
  )

  useEffect(() => {
    let active = true

    async function init() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (active) {
        await syncUserProfile(authUser)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        void syncUserProfile(session?.user ?? null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, syncUserProfile])

  function handleAccountSaved(updated: AccountProfilePayload) {
    setCurrentUser((prev) => ({
      ...prev,
      id: updated.id,
      nombre: updated.nombre,
      apellidos: updated.apellidos,
      telefono: updated.telefono,
      rol: updated.rol,
      email: updated.email || prev.email,
      name: updated.fullName || prev.name,
    }))
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message || "No se pudo cerrar sesión")
      return
    }
    window.location.href = "/auth"
  }

  const initials = getInitials(currentUser.name)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="aria-expanded:bg-muted"
                />
              }
            >
              <Avatar className="size-8 rounded-lg grayscale">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentUser.name}
                </span>
                <span className="truncate text-xs text-foreground/70">
                  {currentUser.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={currentUser.avatar}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {currentUser.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setAccountOpen(true)}>
                  <CircleUserRoundIcon />
                  Cuenta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNotificationsOpen(true)}>
                  <BellIcon />
                  Alertas y avisos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHelpOpen(true)}>
                  <HelpCircleIcon />
                  Ayuda y soporte
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        initialData={{
          id: currentUser.id,
          nombre: currentUser.nombre,
          apellidos: currentUser.apellidos,
          telefono: currentUser.telefono,
          rol: currentUser.rol,
          email: currentUser.email,
        }}
        onSaved={handleAccountSaved}
      />

      <NotificationsDialog
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />

      <HelpSupportDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}