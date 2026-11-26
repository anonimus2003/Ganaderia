"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/client"
import { ForgotPasswordForm } from "./ForgotPasswordForm"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const supabase = createClient()

  const [mostrarOlvidePassword, setMostrarOlvidePassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (error) {
      const mensaje =
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message || "No se pudo iniciar sesión."

      setErrorMsg(mensaje)
      toast.error(mensaje)
      return
    }

    toast.success("Sesión iniciada correctamente")
    router.push("/dashboard")
    router.refresh()
  }

  async function handleGoogleLogin() {
    setErrorMsg(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setLoading(false)
      const mensaje = "No se pudo iniciar sesión con Google."
      setErrorMsg(mensaje)
      toast.error(mensaje)
    }
  }

  if (mostrarOlvidePassword) {
    return (
      <ForgotPasswordForm
        className={className}
        onBackToLogin={() => {
          setErrorMsg(null)
          setMostrarOlvidePassword(false)
        }}
      />
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-col items-center space-y-2 text-center">
          <img
            src="/logo.svg"
            alt="Logo"
            className="mb-2 h-24 w-auto object-contain"
          />

          <CardTitle className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Bienvenido de Nuevo
          </CardTitle>

          <CardDescription className="text-center text-stone-500">
            Ingresa tu correo electrónico abajo para iniciar sesión en tu cuenta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null)
                      setMostrarOlvidePassword(true)
                    }}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </Field>

              {errorMsg && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {errorMsg}
                </p>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Ingresando..." : "Login"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}