"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Trash2,
  Pencil,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PuntoPct {
  x: number;
  y: number;
}

export interface PotreroImagen {
  id: number;
  numero: number;
  nombre: string;
  estado: string;
  pastura: string;
  area_m2: number;
  puntos: PuntoPct[];
  cantidadBovinos: number;
  diasOcupacion: number | null;
  diasDescanso: number | null;
}

interface HistorialOcupacionRow {
  potrero_id: number;
  bovino_id: string;
  fecha_entrada: string;
  fecha_salida: string | null;
}

type HerramientaTrazo = "lapiz" | "puntos";

const IMAGEN_SRC = "/potreros.png";

function parsearPuntosJson(
  raw: unknown,
  anchoReferencia = 1000,
  altoReferencia = 1000
): PuntoPct[] {
  let valor: unknown = raw;

  if (typeof valor === "string") {
    try {
      valor = JSON.parse(valor);
    } catch {
      return [];
    }
  }

  if (valor && typeof valor === "object" && !Array.isArray(valor)) {
    const obj = valor as Record<string, unknown>;
    if (Array.isArray(obj.puntos)) valor = obj.puntos;
    else if (Array.isArray(obj.points)) valor = obj.points;
  }

  if (!Array.isArray(valor)) return [];

  return valor
    .map((pt) => {
      if (!pt || typeof pt !== "object") return null;
      const item = pt as Record<string, unknown>;
      let x = Number(item.x);
      let y = Number(item.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

      if (Math.abs(x) > 100 || Math.abs(y) > 100) {
        x = Number(((x / anchoReferencia) * 100).toFixed(2));
        y = Number(((y / altoReferencia) * 100).toFixed(2));
      }

      return { x, y };
    })
    .filter((pt): pt is PuntoPct => pt !== null);
}

function parsearFechaLocalBogota(
  fechaStr: string | null | undefined
): Date | null {
  if (!fechaStr) return null;
  const limpio = fechaStr.trim();
  if (!limpio) return null;

  const tieneZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(limpio);
  const isoNormalizado = limpio.includes("T") ? limpio : limpio.replace(" ", "T");
  const fecha = new Date(
    tieneZona ? isoNormalizado : `${isoNormalizado}-05:00`
  );

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function calcularDiasDesde(fechaStr: string | null | undefined): number | null {
  const fecha = parsearFechaLocalBogota(fechaStr);
  if (!fecha) return null;
  const diffMs = Date.now() - fecha.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function esPotreroOcupado(potrero: PotreroImagen): boolean {
  const estadoNormalizado = potrero.estado.trim().toLowerCase();
  return (
    potrero.cantidadBovinos > 0 ||
    estadoNormalizado.includes("ocupad") ||
    estadoNormalizado.includes("pastoreo")
  );
}

function normalizarRolAdmin(rolRaw: unknown): boolean {
  if (typeof rolRaw !== "string") return false;
  const limpio = rolRaw.trim().toLowerCase();
  return limpio === "admin" || limpio === "administrador";
}

function calcularCentroide(puntos: PuntoPct[]): PuntoPct {
  if (puntos.length === 0) return { x: 50, y: 50 };
  const suma = puntos.reduce(
    (acc, pt) => ({ x: acc.x + pt.x, y: acc.y + pt.y }),
    { x: 0, y: 0 }
  );
  return {
    x: Number((suma.x / puntos.length).toFixed(2)),
    y: Number((suma.y / puntos.length).toFixed(2)),
  };
}

function calcularAreaPorcentaje(puntos: PuntoPct[]): number {
  if (puntos.length < 3) return 0;
  let area2 = 0;
  for (let i = 0; i < puntos.length; i++) {
    const actual = puntos[i];
    const siguiente = puntos[(i + 1) % puntos.length];
    area2 += actual.x * siguiente.y - siguiente.x * actual.y;
  }
  return Number((Math.abs(area2) / 2).toFixed(2));
}

function simplificarTrazo(
  puntos: PuntoPct[],
  distanciaMinima = 0.65
): PuntoPct[] {
  if (puntos.length <= 2) return puntos;
  const resultado: PuntoPct[] = [puntos[0]];

  for (let i = 1; i < puntos.length; i++) {
    const ultimo = resultado[resultado.length - 1];
    const actual = puntos[i];
    const dist = Math.hypot(actual.x - ultimo.x, actual.y - ultimo.y);
    if (dist >= distanciaMinima) {
      resultado.push(actual);
    }
  }

  return resultado;
}

function ControlesNavegacionMapa({
  onMover,
  onZoomIn,
  onZoomOut,
}: {
  onMover: (dx: number, dy: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const paso = 24;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex flex-col items-center gap-3 select-none"
    >
      <div className="grid h-15 w-15 grid-cols-3 grid-rows-3 place-items-center rounded-full border bg-background/95 p-1 shadow-md backdrop-blur">
        <div />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mover arriba"
          className="h-7 w-7 rounded-full"
          onClick={() => onMover(0, paso)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mover izquierda"
          className="h-7 w-7 rounded-full"
          onClick={() => onMover(paso, 0)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mover derecha"
          className="h-7 w-7 rounded-full"
          onClick={() => onMover(-paso, 0)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mover abajo"
          className="h-7 w-7 rounded-full"
          onClick={() => onMover(0, -paso)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <div />
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border bg-background/95 shadow-md backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Acercar zoom"
          className="h-8 w-8 rounded-none border-b"
          onClick={onZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Alejar zoom"
          className="h-8 w-8 rounded-none"
          onClick={onZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function PotrerosMapClient() {
  const supabase = createClient();

  const containerRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLDivElement>(null);

  const [esAdmin, setEsAdmin] = useState(false);

  const [tamanoImagen, setTamanoImagen] = useState({ ancho: 16, alto: 9 });
  const [rectLienzo, setRectLienzo] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [arrastrandoMapa, setArrastrandoMapa] = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });
  const movioEnArrastre = useRef(false);

  const [panelTrazoAbierto, setPanelTrazoAbierto] = useState(false);
  const [modoDibujo, setModoDibujo] = useState(false);
  const [herramienta, setHerramienta] = useState<HerramientaTrazo>("lapiz");
  const [dibujandoLapiz, setDibujandoLapiz] = useState(false);
  const [cursorPct, setCursorPct] = useState<PuntoPct | null>(null);

  const [puntosActuales, setPuntosActuales] = useState<PuntoPct[]>([]);
  const [potreros, setPotreros] = useState<PotreroImagen[]>([]);
  const [potreroSeleccionado, setPotreroSeleccionado] =
    useState<PotreroImagen | null>(null);
  const [potreroEnRedibujo, setPotreroEnRedibujo] =
    useState<PotreroImagen | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombrePotrero, setNombrePotrero] = useState("");
  const [tipoPastura, setTipoPastura] = useState("");
  const [estadoPotrero, setEstadoPotrero] = useState("En Descanso");
  const [areaM2Input, setAreaM2Input] = useState("0");
  const [guardando, setGuardando] = useState(false);

  const siguienteNumero =
    potreros.length > 0
      ? Math.max(...potreros.map((p) => p.numero)) + 1
      : 1;

  useEffect(() => {
    let activo = true;

    async function verificarRolAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!activo || !user) {
        if (activo) setEsAdmin(false);
        return;
      }

      const rolMeta =
        user.app_metadata?.rol ??
        user.app_metadata?.role ??
        user.user_metadata?.rol ??
        user.user_metadata?.role;

      if (normalizarRolAdmin(rolMeta)) {
        setEsAdmin(true);
        return;
      }

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!activo) return;

      const perfilRecord = (perfil ?? {}) as Record<string, unknown>;
      const rolPerfil = perfilRecord.rol ?? perfilRecord.role;
      setEsAdmin(normalizarRolAdmin(rolPerfil));
    }

    void verificarRolAdmin();
    return () => {
      activo = false;
    };
  }, [supabase]);

  useEffect(() => {
    let activo = true;

    async function cargarPotrerosYHistorial() {
      const [
        { data: potrerosData, error: potrerosError },
        { data: historialData, error: historialError },
      ] = await Promise.all([
        supabase
          .from("potreros")
          .select("id, nombre, estado, tipo_pasto, area_m2, puntos")
          .order("id", { ascending: true }),
        supabase
          .from("historial_ocupacion_potreros")
          .select("potrero_id, bovino_id, fecha_entrada, fecha_salida"),
      ]);

      if (!activo) return;

      if (potrerosError) {
        toast.error(`Error al cargar potreros: ${potrerosError.message}`);
        return;
      }

      if (historialError) {
        toast.error(
          `Error al cargar historial de ocupación: ${historialError.message}`
        );
      }

      const bovinosActivosPorPotrero = new Map<number, Set<string>>();
      const entradaMasAntiguaActiva = new Map<number, string>();
      const ultimaSalidaPorPotrero = new Map<number, string>();

      for (const fila of (historialData ?? []) as HistorialOcupacionRow[]) {
        const potreroId = Number(fila.potrero_id);
        if (!Number.isFinite(potreroId) || potreroId <= 0) continue;

        if (fila.fecha_salida === null || fila.fecha_salida === undefined) {
          if (fila.bovino_id) {
            const setActual =
              bovinosActivosPorPotrero.get(potreroId) ?? new Set<string>();
            setActual.add(String(fila.bovino_id));
            bovinosActivosPorPotrero.set(potreroId, setActual);
          }

          const fechaEntrada = parsearFechaLocalBogota(fila.fecha_entrada);
          const fechaPrev = parsearFechaLocalBogota(
            entradaMasAntiguaActiva.get(potreroId)
          );
          if (
            fechaEntrada &&
            (!fechaPrev || fechaEntrada.getTime() < fechaPrev.getTime())
          ) {
            entradaMasAntiguaActiva.set(potreroId, fila.fecha_entrada);
          }
        } else {
          const fechaSalida = parsearFechaLocalBogota(fila.fecha_salida);
          const fechaPrev = parsearFechaLocalBogota(
            ultimaSalidaPorPotrero.get(potreroId)
          );
          if (
            fechaSalida &&
            (!fechaPrev || fechaSalida.getTime() > fechaPrev.getTime())
          ) {
            ultimaSalidaPorPotrero.set(potreroId, fila.fecha_salida);
          }
        }
      }

      const cargados: PotreroImagen[] = (potrerosData ?? []).map((row, idx) => {
        const id = Number(row.id);
        const activosSet = bovinosActivosPorPotrero.get(id);
        const cantidadBovinos = activosSet ? activosSet.size : 0;

        const fechaEntradaActiva = entradaMasAntiguaActiva.get(id) ?? null;
        const fechaUltimaSalida = ultimaSalidaPorPotrero.get(id) ?? null;

        return {
          id,
          numero: idx + 1,
          nombre: String(row.nombre ?? `Potrero ${idx + 1}`),
          estado: String(row.estado ?? "En Descanso"),
          pastura: String(row.tipo_pasto ?? "Sin especificar"),
          area_m2: Number(row.area_m2 ?? 0),
          puntos: parsearPuntosJson(row.puntos),
          cantidadBovinos,
          diasOcupacion:
            cantidadBovinos > 0
              ? calcularDiasDesde(fechaEntradaActiva)
              : null,
          diasDescanso:
            cantidadBovinos === 0
              ? calcularDiasDesde(fechaUltimaSalida)
              : null,
        };
      });

      setPotreros(cargados);
    }

    void cargarPotrerosYHistorial();
    return () => {
      activo = false;
    };
  }, [supabase]);

  useEffect(() => {
    const calcularAjuste = () => {
      const visor = containerRef.current;
      if (!visor) return;

      const contW = visor.clientWidth;
      const contH = visor.clientHeight;
      if (contW <= 0 || contH <= 0) return;

      const ratioImg = tamanoImagen.ancho / tamanoImagen.alto;
      const ratioCont = contW / contH;

      let width = contW;
      let height = contH;

      if (ratioImg > ratioCont) {
        width = contW;
        height = contW / ratioImg;
      } else {
        height = contH;
        width = contH * ratioImg;
      }

      setRectLienzo({ width, height });
    };

    calcularAjuste();
    const observer = new ResizeObserver(calcularAjuste);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener("resize", calcularAjuste);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", calcularAjuste);
    };
  }, [tamanoImagen]);

  const limitarOffset = (
    nuevoX: number,
    nuevoY: number,
    escalaActual: number
  ) => {
    const el = lienzoRef.current;
    if (!el || escalaActual <= 1) return { x: 0, y: 0 };

    const ancho = el.clientWidth;
    const alto = el.clientHeight;
    const maxX = ((escalaActual - 1) * ancho) / 2;
    const maxY = ((escalaActual - 1) * alto) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, nuevoX)),
      y: Math.max(-maxY, Math.min(maxY, nuevoY)),
    };
  };

  useEffect(() => {
    setOffset((prev) => limitarOffset(prev.x, prev.y, zoom));
  }, [rectLienzo, zoom]);

  const clienteAPorcentaje = (
    clientX: number,
    clientY: number
  ): PuntoPct | null => {
    const el = lienzoRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const pctX = Number(
      (((clientX - rect.left) / rect.width) * 100).toFixed(4)
    );
    const pctY = Number((((clientY - rect.top) / rect.height) * 100).toFixed(4));

    if (pctX < 0 || pctX > 100 || pctY < 0 || pctY > 100) return null;

    return { x: pctX, y: pctY };
  };

  const cambiarZoom = (delta: number) => {
    setZoom((prevZoom) => {
      const siguiente = Number(
        Math.max(1, Math.min(5, prevZoom + delta)).toFixed(2)
      );
      setOffset((prevOffset) =>
        limitarOffset(prevOffset.x, prevOffset.y, siguiente)
      );
      return siguiente;
    });
  };

  const moverConFlechas = (dx: number, dy: number) => {
    setOffset((prev) => limitarOffset(prev.x + dx, prev.y + dy, zoom));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cambiarZoom(e.deltaY < 0 ? 0.15 : -0.15);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    if (esAdmin && modoDibujo && herramienta === "lapiz") {
      const pt = clienteAPorcentaje(e.clientX, e.clientY);
      if (!pt) return;
      setDibujandoLapiz(true);
      setPuntosActuales([pt]);
      return;
    }

    setArrastrandoMapa(true);
    movioEnArrastre.current = false;
    setInicioArrastre({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const ptActual = clienteAPorcentaje(e.clientX, e.clientY);
    if (esAdmin && modoDibujo) {
      setCursorPct(ptActual);
    }

    if (esAdmin && dibujandoLapiz && ptActual) {
      setPuntosActuales((prev) => {
        const ultimo = prev[prev.length - 1];
        if (!ultimo) return [ptActual];
        const dist = Math.hypot(ptActual.x - ultimo.x, ptActual.y - ultimo.y);
        if (dist < 0.35) return prev;
        return [...prev, ptActual];
      });
      return;
    }

    if (!arrastrandoMapa) return;
    const dx = Math.abs(e.clientX - inicioArrastre.x - offset.x);
    const dy = Math.abs(e.clientY - inicioArrastre.y - offset.y);
    if (dx > 3 || dy > 3) {
      movioEnArrastre.current = true;
    }

    const limitado = limitarOffset(
      e.clientX - inicioArrastre.x,
      e.clientY - inicioArrastre.y,
      zoom
    );
    setOffset(limitado);
  };

  const handleMouseUp = () => {
    if (dibujandoLapiz) {
      setDibujandoLapiz(false);
      setPuntosActuales((prev) => simplificarTrazo(prev));
      return;
    }
    setArrastrandoMapa(false);
  };

  const handleClickLienzo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (movioEnArrastre.current) return;

    if (!esAdmin || !modoDibujo) {
      setPotreroSeleccionado(null);
      return;
    }

    if (herramienta === "puntos") {
      const pt = clienteAPorcentaje(e.clientX, e.clientY);
      if (!pt) return;
      setPuntosActuales((prev) => [...prev, pt]);
    }
  };

  const iniciarRedibujoPotrero = (potrero: PotreroImagen) => {
    if (!esAdmin) {
      toast.error("Solo un administrador puede actualizar las coordenadas");
      return;
    }
    setPotreroEnRedibujo(potrero);
    setPotreroSeleccionado(null);
    setPuntosActuales([]);
    setPanelTrazoAbierto(true);
    setModoDibujo(true);
    toast.info(`Traza las nuevas coordenadas para "${potrero.nombre}"`);
  };

  const cancelarRedibujo = () => {
    setPotreroEnRedibujo(null);
    setPuntosActuales([]);
    setDibujandoLapiz(false);
  };

  const puntosToSvg = (pts: PuntoPct[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(" ");

  const guardarPotrero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!esAdmin) {
      toast.error("Solo un administrador puede crear o actualizar potreros");
      return;
    }
    if (!nombrePotrero.trim() || puntosActuales.length < 3 || guardando) return;

    setGuardando(true);
    try {
      const areaNum = Math.max(0, Number(areaM2Input) || 0);
      const pasturaLimpia = tipoPastura.trim() || null;

      if (potreroEnRedibujo) {
        const { data, error } = await supabase
          .from("potreros")
          .update({
            nombre: nombrePotrero.trim(),
            estado: estadoPotrero,
            tipo_pasto: pasturaLimpia,
            area_m2: areaNum,
            puntos: puntosActuales,
          })
          .eq("id", potreroEnRedibujo.id)
          .select("id, nombre, estado, tipo_pasto, area_m2, puntos")
          .single();

        if (error || !data) {
          toast.error(
            `Error al actualizar coordenadas: ${
              error?.message ?? "Error desconocido"
            }`
          );
          return;
        }

        const actualizado: PotreroImagen = {
          ...potreroEnRedibujo,
          nombre: String(data.nombre),
          estado: String(data.estado ?? "En Descanso"),
          pastura: String(data.tipo_pasto ?? "Sin especificar"),
          area_m2: Number(data.area_m2 ?? 0),
          puntos: parsearPuntosJson(data.puntos),
        };

        setPotreros((prev) =>
          prev.map((item) => (item.id === actualizado.id ? actualizado : item))
        );
        setPotreroSeleccionado(actualizado);
        setPotreroEnRedibujo(null);
        setPuntosActuales([]);
        setModalAbierto(false);
        toast.success(
          `Nuevas coordenadas guardadas para "${actualizado.nombre}"`
        );
        return;
      }

      const { data, error } = await supabase
        .from("potreros")
        .insert({
          nombre: nombrePotrero.trim(),
          estado: estadoPotrero,
          tipo_pasto: pasturaLimpia,
          area_m2: areaNum,
          puntos: puntosActuales,
        })
        .select("id, nombre, estado, tipo_pasto, area_m2, puntos")
        .single();

      if (error || !data) {
        toast.error(
          `Error al guardar el potrero: ${error?.message ?? "Error desconocido"}`
        );
        return;
      }

      const nuevo: PotreroImagen = {
        id: Number(data.id),
        numero: siguienteNumero,
        nombre: String(data.nombre),
        estado: String(data.estado ?? "En Descanso"),
        pastura: String(data.tipo_pasto ?? "Sin especificar"),
        area_m2: Number(data.area_m2 ?? 0),
        puntos: parsearPuntosJson(data.puntos),
        cantidadBovinos: 0,
        diasOcupacion: null,
        diasDescanso: null,
      };

      setPotreros((prev) => [...prev, nuevo]);
      setPotreroSeleccionado(nuevo);
      setPuntosActuales([]);
      setNombrePotrero("");
      setTipoPastura("");
      setEstadoPotrero("En Descanso");
      setAreaM2Input("0");
      setModalAbierto(false);
      toast.success(`Potrero "${nuevo.nombre}" guardado en Supabase`);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPotrero = async (id: number) => {
    if (!esAdmin) {
      toast.error("Solo un administrador puede eliminar potreros");
      return;
    }

    const { error } = await supabase.from("potreros").delete().eq("id", id);
    if (error) {
      toast.error(`No se pudo eliminar el potrero: ${error.message}`);
      return;
    }

    setPotreros((prev) => prev.filter((p) => p.id !== id));
    if (potreroSeleccionado?.id === id) {
      setPotreroSeleccionado(null);
    }
    if (potreroEnRedibujo?.id === id) {
      setPotreroEnRedibujo(null);
    }
    toast.success("Potrero eliminado");
  };

  const grosorLineaGuardado = Number((0.24 / Math.sqrt(zoom)).toFixed(3));
  const grosorLineaActual = Number((0.26 / Math.sqrt(zoom)).toFixed(3));
  const radioPunto = Number((0.42 / Math.sqrt(zoom)).toFixed(3));
  const bordePunto = Number((0.14 / Math.sqrt(zoom)).toFixed(3));
  const tamanoNumero = Number((2.2 / Math.sqrt(zoom)).toFixed(2));
  const centroActual = calcularCentroide(puntosActuales);
  const ultimoPunto = puntosActuales[puntosActuales.length - 1];
  const numeroEtiquetaActual = potreroEnRedibujo
    ? potreroEnRedibujo.numero
    : siguienteNumero;
  const trazoActivo = esAdmin && modoDibujo;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setCursorPct(null);
      }}
      onClick={handleClickLienzo}
      className="relative flex h-[460px] w-full items-center justify-center select-none overflow-hidden rounded-xl border bg-neutral-950"
    >
      <img
        src={IMAGEN_SRC}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-65 blur-xl"
      />
      <div className="pointer-events-none absolute inset-0 bg-neutral-950/35" />

      <div
        ref={lienzoRef}
        style={{
          width: rectLienzo ? `${rectLienzo.width}px` : "100%",
          height: rectLienzo ? `${rectLienzo.height}px` : "100%",
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
        className={`relative z-10 shrink-0 shadow-2xl transition-transform duration-75 ${
          arrastrandoMapa || dibujandoLapiz
            ? "cursor-grabbing"
            : trazoActivo
            ? "cursor-crosshair"
            : "cursor-grab"
        }`}
      >
        <img
          src={IMAGEN_SRC}
          alt="Vista satelital de potreros"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              setTamanoImagen({
                ancho: img.naturalWidth,
                alto: img.naturalHeight,
              });
            }
          }}
          className="pointer-events-none h-full w-full object-fill"
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {potreros.map((p) => {
            if (p.puntos.length < 3) return null;
            const centro = calcularCentroide(p.puntos);
            const estaSeleccionado = potreroSeleccionado?.id === p.id;
            const estaSiendoRedibujado = potreroEnRedibujo?.id === p.id;
            const ocupado = esPotreroOcupado(p);

            const colorBase = ocupado ? "#ef4444" : "#22c55e";
            const colorRelleno = estaSeleccionado
              ? ocupado
                ? "#f87171"
                : "#D1F843"
              : colorBase;
            const colorBorde = estaSeleccionado
              ? ocupado
                ? "#fca5a5"
                : "#D1F843"
              : colorBase;

            return (
              <g key={p.id}>
                <polygon
                  points={puntosToSvg(p.puntos)}
                  fill={colorRelleno}
                  fillOpacity={
                    estaSiendoRedibujado
                      ? 0.08
                      : estaSeleccionado
                      ? 0.36
                      : ocupado
                      ? 0.28
                      : 0.2
                  }
                  stroke={colorBorde}
                  strokeDasharray={estaSiendoRedibujado ? "1.2 0.8" : undefined}
                  strokeWidth={
                    estaSeleccionado
                      ? Number((grosorLineaGuardado * 1.25).toFixed(3))
                      : grosorLineaGuardado
                  }
                  strokeLinejoin="round"
                  onClick={(e) => {
                    if (trazoActivo || movioEnArrastre.current) return;
                    e.stopPropagation();
                    setPotreroSeleccionado(p);
                  }}
                  className={
                    trazoActivo
                      ? "pointer-events-none"
                      : "pointer-events-auto cursor-pointer"
                  }
                />

                <text
                  x={centro.x}
                  y={centro.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={tamanoNumero}
                  fontWeight="700"
                  fill="#ffffff"
                  stroke="#09090b"
                  strokeWidth={Number((tamanoNumero * 0.18).toFixed(3))}
                  paintOrder="stroke"
                  className="pointer-events-none select-none"
                >
                  {p.nombre}
                </text>
              </g>
            );
          })}

          {trazoActivo &&
            herramienta === "puntos" &&
            ultimoPunto &&
            cursorPct && (
              <line
                x1={ultimoPunto.x}
                y1={ultimoPunto.y}
                x2={cursorPct.x}
                y2={cursorPct.y}
                stroke="#D1F843"
                strokeWidth={Number((grosorLineaActual * 0.75).toFixed(3))}
                strokeDasharray="0.8 0.8"
              />
            )}

          {puntosActuales.length >= 2 && (
            <polyline
              points={puntosToSvg(puntosActuales)}
              fill={puntosActuales.length >= 3 ? "#D1F843" : "none"}
              fillOpacity={0.16}
              stroke="#D1F843"
              strokeWidth={grosorLineaActual}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {puntosActuales.length >= 3 && (
            <text
              x={centroActual.x}
              y={centroActual.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={tamanoNumero}
              fontWeight="700"
              fill="#D1F843"
              stroke="#09090b"
              strokeWidth={Number((tamanoNumero * 0.18).toFixed(3))}
              paintOrder="stroke"
              className="pointer-events-none select-none"
            >
              #{numeroEtiquetaActual}
            </text>
          )}

          {trazoActivo &&
            herramienta === "puntos" &&
            puntosActuales.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={radioPunto}
                fill="#D1F843"
                stroke="#09090b"
                strokeWidth={bordePunto}
              />
            ))}
        </svg>
      </div>

      <div className="absolute bottom-3 left-3 z-20">
        <ControlesNavegacionMapa
          onMover={moverConFlechas}
          onZoomIn={() => cambiarZoom(0.2)}
          onZoomOut={() => cambiarZoom(-0.2)}
        />
      </div>

      {potreroSeleccionado && !trazoActivo && (
        <Card
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute right-3 bottom-3 z-20 w-72 border-primary/40 shadow-xl"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">
              Potrero #{potreroSeleccionado.numero} ·{" "}
              {potreroSeleccionado.nombre}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar detalle"
              className="h-6 w-6"
              onClick={() => setPotreroSeleccionado(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between rounded-md bg-muted/60 px-2.5 py-1.5">
              <span className="text-muted-foreground">Ocupación:</span>
              <span
                className={
                  esPotreroOcupado(potreroSeleccionado)
                    ? "font-semibold text-red-500"
                    : "font-semibold text-emerald-500"
                }
              >
                {esPotreroOcupado(potreroSeleccionado) ? "Ocupado" : "Libre"}
              </span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/60 px-2.5 py-1.5">
              <span className="text-muted-foreground">Bovinos actuales:</span>
              <span className="font-semibold text-foreground">
                {potreroSeleccionado.cantidadBovinos > 0
                  ? `${potreroSeleccionado.cantidadBovinos} ${
                      potreroSeleccionado.cantidadBovinos === 1
                        ? "bovino"
                        : "bovinos"
                    }`
                  : "0 bovinos"}
              </span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/60 px-2.5 py-1.5">
              <span className="text-muted-foreground">
                {potreroSeleccionado.cantidadBovinos > 0
                  ? "Días en ocupación:"
                  : "Días libre / descanso:"}
              </span>
              <span className="font-semibold text-foreground">
                {potreroSeleccionado.cantidadBovinos > 0
                  ? potreroSeleccionado.diasOcupacion !== null
                    ? `${potreroSeleccionado.diasOcupacion} ${
                        potreroSeleccionado.diasOcupacion === 1
                          ? "día"
                          : "días"
                      }`
                    : "Sin fecha"
                  : potreroSeleccionado.diasDescanso !== null
                  ? `${potreroSeleccionado.diasDescanso} ${
                      potreroSeleccionado.diasDescanso === 1 ? "día" : "días"
                    }`
                  : "Sin salida previa"}
              </span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/60 px-2.5 py-1.5">
              <span className="text-muted-foreground">Estado:</span>
              <span className="font-semibold text-foreground">
                {potreroSeleccionado.estado}
              </span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/60 px-2.5 py-1.5">
              <span className="text-muted-foreground">Área (m²):</span>
              <span className="font-semibold text-foreground">
                {potreroSeleccionado.area_m2} m²
              </span>
            </div>
            <div className="flex justify-between rounded-md bg-muted/60 px-2.5 py-1.5">
              <span className="text-muted-foreground">Pastura:</span>
              <span className="font-medium text-foreground">
                {potreroSeleccionado.pastura}
              </span>
            </div>

            {esAdmin && (
              <div className="flex flex-col gap-1.5 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={() => iniciarRedibujoPotrero(potreroSeleccionado)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Redibujar coordenadas
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="w-full gap-1.5"
                  onClick={() => void eliminarPotrero(potreroSeleccionado.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar potrero
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {esAdmin && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2"
        >
          <Button
            type="button"
            size="icon"
            variant={
              modoDibujo || panelTrazoAbierto ? "default" : "secondary"
            }
            aria-label="Herramienta para trazar potrero"
            title="Trazar potrero"
            className="h-10 w-10 rounded-full shadow-md"
            onClick={() => {
              setPotreroSeleccionado(null);
              const siguienteAbierto = !panelTrazoAbierto;
              setPanelTrazoAbierto(siguienteAbierto);
              setModoDibujo(siguienteAbierto);
              if (!siguienteAbierto) {
                cancelarRedibujo();
              }
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {panelTrazoAbierto && (
            <Card className="w-72 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">
                  {potreroEnRedibujo
                    ? `Redibujar #${potreroEnRedibujo.numero} · ${potreroEnRedibujo.nombre}`
                    : "Trazar potrero"}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar panel de trazo"
                  className="h-6 w-6"
                  onClick={() => {
                    setPanelTrazoAbierto(false);
                    setModoDibujo(false);
                    setDibujandoLapiz(false);
                    cancelarRedibujo();
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {potreroEnRedibujo && (
                  <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px]">
                    <span>Editando coordenadas actuales</span>
                    <button
                      type="button"
                      onClick={cancelarRedibujo}
                      className="font-semibold underline"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={herramienta === "lapiz" ? "default" : "outline"}
                    className="gap-1.5"
                    onClick={() => setHerramienta("lapiz")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Lápiz
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={herramienta === "puntos" ? "default" : "outline"}
                    className="gap-1.5"
                    onClick={() => setHerramienta("puntos")}
                  >
                    <MousePointerClick className="h-3.5 w-3.5" />
                    Puntos
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={modoDibujo ? "default" : "secondary"}
                    onClick={() => setModoDibujo((prev) => !prev)}
                  >
                    {modoDibujo ? "Pausar" : "Activar trazo"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={puntosActuales.length === 0}
                    onClick={() =>
                      setPuntosActuales((prev) => prev.slice(0, -1))
                    }
                  >
                    Deshacer
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={puntosActuales.length === 0}
                    onClick={() => setPuntosActuales([])}
                  >
                    Limpiar
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {herramienta === "lapiz"
                    ? "Mantén clic y arrastra para bordear el potrero."
                    : "Haz clic en cada esquina para cerrar el potrero."}
                </p>

                <p className="text-xs text-muted-foreground">
                  Vértices: <strong>{puntosActuales.length}</strong> |
                  Guardados: <strong>{potreros.length}</strong>
                </p>

                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  disabled={puntosActuales.length < 3}
                  onClick={() => {
                    setModoDibujo(false);
                    setDibujandoLapiz(false);
                    if (potreroEnRedibujo) {
                      setNombrePotrero(potreroEnRedibujo.nombre);
                      setEstadoPotrero(potreroEnRedibujo.estado);
                      setTipoPastura(
                        potreroEnRedibujo.pastura === "Sin especificar"
                          ? ""
                          : potreroEnRedibujo.pastura
                      );
                      setAreaM2Input(
                        String(calcularAreaPorcentaje(puntosActuales))
                      );
                    } else {
                      setNombrePotrero(`Potrero ${siguienteNumero}`);
                      setEstadoPotrero("En Descanso");
                      setTipoPastura("");
                      setAreaM2Input(
                        String(calcularAreaPorcentaje(puntosActuales))
                      );
                    }
                    setModalAbierto(true);
                  }}
                >
                  {potreroEnRedibujo
                    ? `Guardar nuevas coordenadas #${potreroEnRedibujo.numero}`
                    : `Guardar potrero #${siguienteNumero}`}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {esAdmin && (
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                {potreroEnRedibujo
                  ? `Actualizar coordenadas · Potrero #${potreroEnRedibujo.numero}`
                  : `Guardar potrero #${siguienteNumero}`}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => void guardarPotrero(e)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del potrero</Label>
                <Input
                  id="nombre"
                  value={nombrePotrero}
                  onChange={(e) => setNombrePotrero(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={estadoPotrero}
                  onValueChange={(val) => {
                    if (val !== null) {
                      setEstadoPotrero(val);
                    }
                  }}
                >
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En Descanso">En Descanso</SelectItem>
                    <SelectItem value="En Pastoreo">En Pastoreo</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_m2">Área (m²)</Label>
                <Input
                  id="area_m2"
                  type="number"
                  min={0}
                  step="any"
                  value={areaM2Input}
                  onChange={(e) => setAreaM2Input(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastura">Tipo de pastura</Label>
                <Input
                  id="pastura"
                  value={tipoPastura}
                  onChange={(e) => setTipoPastura(e.target.value)}
                  placeholder="Ej. Kikuyo, Estrella"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={guardando}
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}