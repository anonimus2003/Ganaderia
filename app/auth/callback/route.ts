import { NextResponse } from "next/server"
// Revisa dentro de tu carpeta `lib/` cómo se llama el archivo de servidor y ajusta este import:
import { createClient } from "@/lib/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const rawNext = searchParams.get("next") ?? "/dashboard"
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error.message)}`
    )
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`)
}