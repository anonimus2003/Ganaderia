import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { Toaster } from "sonner"
import { createClient } from "@/lib/server"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

async function AuthGuard({ children }: { children: React.ReactNode }) {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return <>{children}</>
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Suspense
            fallback={
              <div className="px-4 text-sm text-muted-foreground lg:px-6">
                Cargando...
              </div>
            }
          >
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </div>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}