import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"

async function HomeRedirect() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/auth")
  }

  return null
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Cargando...
        </div>
      }
    >
      <HomeRedirect />
    </Suspense>
  )
}