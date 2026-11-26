"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "cn" // o "@/lib/utils" según tu alias
import { createClient } from "@/lib/client" // Ajusta a tu ruta en lib/

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

interface ForgotPasswordFormProps extends React.ComponentProps<"div"> {
  onBackToLogin?: () => void
}

export function ForgotPasswordForm({
  className,
  onBackToLogin,
  ...props
}: ForgotPasswordFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message || "No se pudo enviar el enlace de recuperación")
      return
    }

    setEnviado(true)
    toast.success("Revisa tu correo para restablecer tu contraseña")
  }

  function handleBack(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    if (onBackToLogin) {
      onBackToLogin()
    } else {
      router.push("/login")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-col items-center space-y-2 text-center">
          {/* Mismo logo y tamaño */}
          <img
            src="/logo.svg"
            alt="Logo"
            className="mb-2 h-24 w-auto object-contain"
          />

          {/* Título con el mismo tono oscuro y tipografía */}
          <CardTitle className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            ¿Olvidaste tu contraseña?
          </CardTitle>

          {/* Instrucción clara para el usuario */}
          <CardDescription className="text-center text-stone-500">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla
          </CardDescription>
        </CardHeader>

        <CardContent>
          {enviado ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Te enviamos un enlace de recuperación a{" "}
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {email}
                </span>
                .
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEnviado(false)
                  setEmail("")
                }}
              >
                Enviar a otro correo
              </Button>
              <FieldDescription className="text-center">
                <a
                  href="/login"
                  onClick={handleBack}
                  className="font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
                >
                  Volver al inicio de sesión
                </a>
              </FieldDescription>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
                  </Button>

                  <FieldDescription className="text-center">
                    ¿Recordaste tu contraseña?{" "}
                    <a
                      href="/login"
                      onClick={handleBack}
                      className="font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
                    >
                      Volver al inicio de sesión
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}