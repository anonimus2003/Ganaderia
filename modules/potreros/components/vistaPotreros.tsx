'use client';

import React from 'react';
import {
  ShieldCheck,
  Edit3,
  Sliders,
  Calendar,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function VistaPotreros({
  potreroSeleccionado,
  selectedId,
  setSelectedId,
  setMostrarModalEdicion,
  setMostrarModalControl,
  diasDescansoActuales = 0,
  progresoCrecimiento = 0
}: any) {

  // =========================================================
  // ESTILO DEL ESTADO
  // =========================================================
  const obtenerEstiloEstado = (estado: string) => {
    const estadoLower = estado?.toLowerCase().trim() || '';

    if (estadoLower === 'ocupado') {
      return 'bg-rose-100 text-rose-700 border border-rose-200';
    }

    if (
      estadoLower === 'en descanso' ||
      estadoLower === 'descanso'
    ) {
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    }

    return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  };

  // =========================================================
  // DÍAS DE DESCANSO
  // =========================================================
  //
  // Primero usamos el valor que viene directamente
  // desde la tabla: potreroSeleccionado.dias_descanso
  //
  // Si no existe, utilizamos diasDescansoActuales como respaldo.
  //
  const obtenerDiasDescanso = () => {
    if (!potreroSeleccionado) {
      return 0;
    }

    const valorBD = potreroSeleccionado.dias_descanso;

    if (
      valorBD !== null &&
      valorBD !== undefined &&
      valorBD !== ''
    ) {
      const dias = Number(valorBD);

      if (!Number.isNaN(dias)) {
        return Math.max(0, Math.floor(dias));
      }
    }

    const valorProp = Number(diasDescansoActuales);

    if (!Number.isNaN(valorProp)) {
      return Math.max(0, Math.floor(valorProp));
    }

    return 0;
  };

  const diasDescanso = obtenerDiasDescanso();

  // =========================================================
  // PROGRESO
  // =========================================================
  const progreso = Math.min(
    100,
    Math.max(0, Number(progresoCrecimiento) || 0)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between relative">

      <div>

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">

          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-emerald-600"
            />

            Vista de Consulta
          </h3>

          {potreroSeleccionado && (
            <div className="flex items-center gap-1.5">

              {/* EDITAR */}
              <button
                onClick={() => {
                  setMostrarModalEdicion(true);
                  setMostrarModalControl(false);
                }}
                className="
                  flex items-center gap-1
                  px-3 py-1.5
                  rounded-xl
                  text-[11px]
                  font-bold
                  shadow-sm
                  transition-all
                  bg-emerald-50
                  text-emerald-700
                  hover:bg-emerald-100
                  border border-emerald-200
                "
                title="Editar Potrero o Mapa"
              >
                <Edit3 size={13} />
                Editar
              </button>

              {/* CONTROL */}
              <button
                onClick={() => {
                  setMostrarModalControl(true);
                  setMostrarModalEdicion(false);
                }}
                className="
                  flex items-center gap-1
                  px-3 py-1.5
                  rounded-xl
                  text-[11px]
                  font-bold
                  shadow-sm
                  transition-all
                  bg-slate-100
                  text-slate-700
                  hover:bg-slate-200
                  border border-slate-200
                "
                title="Panel de Control de Ganado y Abonos"
              >
                <Sliders size={13} />
                Control
              </button>

            </div>
          )}
        </div>


        {/* =====================================================
            POTRERO SELECCIONADO
        ===================================================== */}
        {potreroSeleccionado ? (

          <div className="space-y-4">

            <div className="
              bg-gradient-to-br
              from-slate-50
              to-emerald-50/40
              p-4
              rounded-2xl
              border border-slate-200/80
              space-y-3
            ">

              {/* ESTADO */}
              <div className="flex justify-between items-center">

                <span className="
                  text-[11px]
                  font-bold
                  text-slate-400
                  uppercase
                ">
                  Estado Actual:
                </span>

                <span
                  className={`
                    px-2.5
                    py-0.5
                    rounded-full
                    text-[10px]
                    font-black
                    tracking-wide
                    ${obtenerEstiloEstado(
                      potreroSeleccionado.estado
                    )}
                  `}
                >
                  {potreroSeleccionado.estado || 'Sin estado'}
                </span>

              </div>


              {/* NOMBRE */}
              <h4 className="
                text-xl
                font-black
                text-slate-800
              ">
                {potreroSeleccionado.nombre}
              </h4>


              {/* =================================================
                  ÁREA / BOVINOS
              ================================================= */}
              <div className="
                grid
                grid-cols-2
                gap-2
                pt-2
                border-t
                border-slate-200/60
                text-xs
              ">

                {/* ÁREA */}
                <div className="
                  bg-white/80
                  p-2
                  rounded-xl
                  border border-slate-100
                ">

                  <span className="
                    block
                    text-[10px]
                    font-bold
                    text-slate-400
                    uppercase
                  ">
                    Área:
                  </span>

                  <span className="
                    font-bold
                    text-slate-700
                  ">
                    {potreroSeleccionado.area_m2
                      ? `${potreroSeleccionado.area_m2} m²`
                      : 'No registrada'}
                  </span>

                </div>


                {/* BOVINOS */}
                <div className="
                  bg-white/80
                  p-2
                  rounded-xl
                  border border-slate-100
                ">

                  <span className="
                    block
                    text-[10px]
                    font-bold
                    text-slate-400
                    uppercase
                  ">
                    Bovinos:
                  </span>

                  <span className="
                    font-bold
                    text-slate-700
                  ">
                    {potreroSeleccionado.bovinos_actuales || 0} reses
                  </span>

                </div>

              </div>


              {/* =================================================
                  ABONO / DÍAS DE DESCANSO
              ================================================= */}
              <div className="
                grid
                grid-cols-2
                gap-2
                text-xs
              ">

                {/* ÚLTIMO ABONO */}
                <div className="
                  bg-white/80
                  p-2
                  rounded-xl
                  border border-slate-100
                ">

                  <span className="
                    block
                    text-[10px]
                    font-bold
                    text-slate-400
                    uppercase
                  ">
                    Último Abono:
                  </span>

                  <span className="
                    font-bold
                    text-slate-700
                    truncate
                    block
                  ">
                    {potreroSeleccionado.ultimo_abono || 'Ninguno'}
                  </span>

                </div>


                {/* =================================================
                    DÍAS DE DESCANSO
                ================================================= */}
                <div className="
                  bg-white/80
                  p-2
                  rounded-xl
                  border border-slate-100
                ">

                  <span className="
                    block
                    text-[10px]
                    font-bold
                    text-slate-400
                    uppercase
                  ">
                    Días en Reposo:
                  </span>

                  <span className="
                    font-bold
                    text-emerald-700
                    flex
                    items-center
                    gap-1
                  ">

                    <Calendar size={12} />

                    {diasDescanso}

                    {diasDescanso === 1
                      ? ' día'
                      : ' días'}

                  </span>

                </div>

              </div>


              {/* =================================================
                  INFORMACIÓN EXTRA DEL DESCANSO
              ================================================= */}
              {diasDescanso > 0 && (
                <div className="
                  bg-amber-50
                  border
                  border-amber-200
                  rounded-xl
                  px-3
                  py-2
                  flex
                  items-center
                  justify-between
                  gap-3
                ">

                  <div className="flex items-center gap-2">

                    <Calendar
                      size={15}
                      className="text-amber-600"
                    />

                    <div>

                      <p className="
                        text-[10px]
                        font-black
                        uppercase
                        text-amber-700
                      ">
                        Periodo de reposo
                      </p>

                      <p className="
                        text-[11px]
                        text-amber-600
                        font-medium
                      ">
                        Este potrero lleva {diasDescanso}{' '}
                        {diasDescanso === 1
                          ? 'día'
                          : 'días'} en descanso.
                      </p>

                    </div>

                  </div>

                </div>
              )}


              {/* =================================================
                  CRECIMIENTO DEL PASTO
              ================================================= */}
              <div className="
                bg-white
                p-3
                rounded-xl
                border border-slate-200
                space-y-1
              ">

                <div className="
                  flex
                  justify-between
                  items-center
                  text-xs
                ">

                  <span className="
                    font-bold
                    text-slate-600
                    flex
                    items-center
                    gap-1
                  ">

                    <TrendingUp
                      size={13}
                      className="text-emerald-600"
                    />

                    Crecimiento del Pasto

                  </span>

                  <span className="
                    font-black
                    text-emerald-600
                  ">
                    {progreso}%
                  </span>

                </div>


                <div className="
                  w-full
                  h-2
                  bg-slate-100
                  rounded-full
                  overflow-hidden
                ">

                  <div
                    className="
                      h-full
                      bg-emerald-600
                      rounded-full
                      transition-all
                      duration-300
                    "
                    style={{
                      width: `${progreso}%`
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

        ) : (

          /* =====================================================
             SIN POTRERO SELECCIONADO
          ===================================================== */
          <div className="
            text-center
            py-20
            text-slate-400
            text-xs
            px-4
            space-y-3
          ">

            <div className="
              w-12
              h-12
              bg-slate-100
              rounded-full
              flex
              items-center
              justify-center
              mx-auto
              text-slate-400
            ">
              <Layers size={22} />
            </div>

            <p>
              Haz clic en cualquier círculo del mapa para
              consultar la información del potrero.
            </p>

          </div>

        )}

      </div>


      {/* =======================================================
          DESELECCIONAR
      ======================================================= */}
      {potreroSeleccionado && (

        <button
          onClick={() => setSelectedId(null)}
          className="
            mt-4
            w-full
            bg-slate-100
            hover:bg-slate-200
            text-slate-600
            font-bold
            py-2.5
            rounded-2xl
            text-xs
            transition-colors
          "
        >
          Deseleccionar Potrero
        </button>

      )}

    </div>
  );
}