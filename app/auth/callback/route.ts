import { NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/server"

function sanitizarRuta(ruta: string | null, fallback: string): string {
  if (!ruta || !ruta.startsWith("/") || ruta.startsWith("//")) {
    return fallback
  }
  return ruta
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  // Si viene type=recovery, por defecto mandamos a la pantalla de cambio de contraseña
  const destinoPorDefecto =
    type === "recovery" ? "/auth/actualizar-password" : "/dashboard"
  const next = sanitizarRuta(searchParams.get("next"), destinoPorDefecto)

  const supabase = await createClient()

  // 1. Flujo PKCE (?code=...)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error.message)}`
    )
  }

  // 2. Flujo OTP / token_hash (?token_hash=...&type=recovery)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (!error) {
      const destinoFinal =
        type === "recovery"
          ? sanitizarRuta(searchParams.get("next"), "/auth/actualizar-password")
          : next
      return NextResponse.redirect(`${origin}${destinoFinal}`)
    }
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error.message)}`
    )
  }

  // 3. Si llega sin query params (por ejemplo con hash #access_token=...&type=recovery),
  // redirigimos a la página de cambio de contraseña para que el cliente procese el hash
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/auth/actualizar-password`)
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`)
}