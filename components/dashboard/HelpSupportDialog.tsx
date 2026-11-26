"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  HelpCircleIcon,
  MessageSquarePlusIcon,
  ChevronDownIcon,
  SendIcon,
} from "lucide-react"

interface HelpSupportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: "¿Cómo registro un nuevo animal en el inventario?",
    respuesta:
      "Ingresa al módulo de Inventario Bovino, haz clic en 'Registrar animal' y completa el número de chapeta/arete, raza, sexo, fecha de nacimiento y potrero inicial.",
  },
  {
    pregunta: "¿Dónde cargo los registros diarios de ordeño y pesaje?",
    respuesta:
      "En el módulo de Producción selecciona la jornada (mañana o tarde) o el control de peso, busca el animal por chapeta y guarda los litros o kilogramos obtenidos.",
  },
  {
    pregunta: "¿Cómo funcionan las alertas de retiro de medicamentos?",
    respuesta:
      "Al registrar un tratamiento veterinario con días de retiro, el sistema marca automáticamente al animal en cuarentena de leche/carne hasta que se cumpla la fecha segura.",
  },
  {
    pregunta: "¿Por qué no puedo cambiar mi rol o eliminar registros?",
    respuesta:
      "Por seguridad de la información productiva, los permisos de edición crítica y asignación de roles los gestiona únicamente el Administrador del sistema.",
  },
  {
    pregunta: "¿Qué hago si un dato quedó mal digitado?",
    respuesta:
      "Si tu rol no permite editar ese registro, envía una solicitud en la pestaña 'Enviar recomendación o ajuste' indicando la chapeta del animal y el dato correcto.",
  },
]

const TIPOS_SOLICITUD = [
  "Recomendación de mejora",
  "Solicitar ajuste en el sistema",
  "Reportar un problema o error",
]

export function HelpSupportDialog({
  open,
  onOpenChange,
}: HelpSupportDialogProps) {
  const supabase = createClient()

  const [tab, setTab] = useState<"faq" | "soporte">("faq")
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const [tipo, setTipo] = useState(TIPOS_SOLICITUD[0])
  const [asunto, setAsunto] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSendTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanAsunto = asunto.trim()
    const cleanMensaje = mensaje.trim()

    if (!cleanAsunto || !cleanMensaje) {
      toast.error("Completa el asunto y el detalle de tu solicitud")
      return
    }

    setSending(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSending(false)
      toast.error("Debes tener una sesión activa para enviar mensajes")
      return
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("nombre, apellidos")
      .eq("id", user.id)
      .maybeSingle()

    const nombreCompleto =
      [perfil?.nombre, perfil?.apellidos].filter(Boolean).join(" ") ||
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email?.split("@")[0] || "Usuario")

    const { error } = await supabase.from("soporte_tickets").insert({
      user_id: user.id,
      nombre_usuario: nombreCompleto,
      email_usuario: user.email ?? null,
      tipo,
      asunto: cleanAsunto,
      mensaje: cleanMensaje,
    })

    setSending(false)

    if (error) {
      console.error("Error enviando soporte:", error)
      toast.error(`No se pudo enviar: ${error.message}`)
      return
    }

    toast.success("Tu recomendación o solicitud fue enviada al administrador")
    setAsunto("")
    setMensaje("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Centro de Ayuda y Soporte</DialogTitle>
          <DialogDescription>
            Consulta dudas frecuentes sobre el manejo ganadero o envíanos tus
            recomendaciones y ajustes para mejorar la plataforma.
          </DialogDescription>
        </DialogHeader>

        {/* Selector de pestañas */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("faq")}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "faq"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HelpCircleIcon className="size-4" />
            Preguntas frecuentes
          </button>

          <button
            type="button"
            onClick={() => setTab("soporte")}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "soporte"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquarePlusIcon className="size-4" />
            Soporte y ajustes
          </button>
        </div>

        {tab === "faq" ? (
          <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
            {PREGUNTAS_FRECUENTES.map((item, idx) => {
              const isOpen = openIndex === idx
              return (
                <div
                  key={item.pregunta}
                  className="rounded-lg border border-border/70 bg-card"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm font-medium"
                  >
                    <span>{item.pregunta}</span>
                    <ChevronDownIcon
                      className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border/50 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
                      {item.respuesta}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTab("soporte")}
              >
                ¿No encontraste tu duda? Envíanos una solicitud
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendTicket} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="soporte-tipo">¿Qué deseas enviar?</Label>
              <select
                id="soporte-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={sending}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {TIPOS_SOLICITUD.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="soporte-asunto">Asunto o módulo</Label>
              <Input
                id="soporte-asunto"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Ej. Agregar filtro por potrero en ordeño"
                disabled={sending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="soporte-mensaje">
                Cuéntanos tu recomendación o el ajuste que necesitas
              </Label>
              <textarea
                id="soporte-mensaje"
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Describe qué te gustaría mejorar, qué ajuste necesitas en tus registros o si encontraste algún error..."
                disabled={sending}
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sending}
              >
                Cerrar
              </Button>
              <Button type="submit" disabled={sending} className="gap-2">
                <SendIcon className="size-4" />
                {sending ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}