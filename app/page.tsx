import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"

export default async function HomePage() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    }
  } catch {
    // Si no hay sesión o falla la lectura inicial, enviamos a /auth
  }

  redirect("/auth")
}