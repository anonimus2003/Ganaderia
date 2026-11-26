"use client"

import * as React from "react"
import Image from "next/image"

import { NavDocuments } from "@/components/dashboard/nav-documents"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import { SettingsDialog } from "@/components/dashboard/SettingsDialog"
import { HelpSupportDialog } from "@/components/dashboard/HelpSupportDialog"
import { SearchDialog } from "@/components/dashboard/SearchDialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  Package,
  Milk,
  MapPinned,
  Pill,
  Dna,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  Wallet,
  FileChartColumnIcon,
  ShieldCheck
} from "lucide-react"

const data = {
  user: {
    name: "Cargando...",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Inventario",
      url: "/dashboard/inventario",
      icon: <Package />,
    },
    {
      title: "Ordeño",
      url: "/dashboard/ordeno",
      icon: <Milk />,
    },
    {
      title: "Potreros",
      url: "/dashboard/potreros",
      icon: <MapPinned />,
    },
    {
      title: "Medicamentos",
      url: "/dashboard/medicamentos",
      icon: <Pill />,
    },
    {
      title: "Reproducción",
      url: "/dashboard/reproduccion",
      icon: <Dna />,
    },
  ],
  finanzas: [
    {
      name: "Ingresos y Egresos",
      url: "/dashboard/finanzas/ingresos",
      icon: <Wallet />,
    },
    {
      name: "Reportes",
      url: "/dashboard/finanzas/reportes",
      icon: <FileChartColumnIcon />,
    },
    {
      name: "Permisos",
      url: "/dashboard/admin/permisos",
      icon: <ShieldCheck />,
      
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  const navSecondary = [
    {
      title: "Ajustes",
      url: "#",
      icon: <Settings2Icon />,
      onClick: () => setSettingsOpen(true),
    },
    {
      title: "Ayuda y Soporte",
      url: "#",
      icon: <CircleHelpIcon />,
      onClick: () => setHelpOpen(true),
    },
    {
      title: "Buscar",
      url: "#",
      icon: <SearchIcon />,
      onClick: () => setSearchOpen(true),
    },
  ]

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="data-[slot=sidebar-menu-button]:p-1.5!"
                render={<a href="/dashboard" />}
              >
                <Image
                  src="/logo.svg"
                  alt="AGRONOVA"
                  width={32}
                  height={32}
                  className="size-8 object-contain"
                />
                <span className="text-base font-semibold">RUMINAX</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavDocuments items={data.finanzas} />
          <NavSecondary items={navSecondary} className="mt-auto" />
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpSupportDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}