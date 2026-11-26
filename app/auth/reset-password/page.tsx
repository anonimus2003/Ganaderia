"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/client"

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

function ResetPasswordFormContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function initRecoverySession() {
      const code = searchParams.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setErrorMsg(
            "El enlace de recuperación expiró o ya fue utilizado. Solicita uno nuevo."
          )
        }
        setVerifying(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setErrorMsg(
          "No se detectó una sesión válida de recuperación. Abre el enlace directamente desde tu correo."
        )
      }
      setVerifying(false)
    }

    initRecoverySession()
  }, [searchParams, supabase])

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      const msg = error.message || "No se pudo actualizar la contraseña."
      setErrorMsg(msg)
      toast.error(msg)
      return
    }

    toast.success("Contraseña actualizada. Inicia sesión con tu nueva clave.")
    await supabase.auth.signOut()
    window.location.href = "/auth"
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-col items-center space-y-2 text-center">
              <img
                src="/logo.svg"
                alt="Logo"
                className="mb-2 h-24 w-auto object-contain"
              />

              <CardTitle className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Restablecer contraseña
              </CardTitle>

              <CardDescription className="text-center text-stone-500">
                Escribe y confirma tu nueva contraseña para acceder a tu cuenta
              </CardDescription>
            </CardHeader>

            <CardContent>
              {verifying ? (
                <p className="text-center text-sm text-stone-500">
                  Verificando enlace de recuperación...
                </p>
              ) : (
                <form onSubmit={handleUpdatePassword}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirmar contraseña
                      </FieldLabel>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? "Guardando..." : "Guardar nueva contraseña"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6">
          <p className="text-sm text-stone-500">Cargando...</p>
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  )
}