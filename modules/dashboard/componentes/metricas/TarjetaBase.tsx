// componentes/metricas/TarjetaBase.tsx
import React from "react";

export interface BotonAccion {
  label: string;
  onClick: () => void;
  className?: string;
}

interface TarjetaBaseProps {
  titulo: string;
  valorPrincipal: string | React.ReactNode;
  cambioTexto?: string;
  esCambioPositivo?: boolean;
  datosSecundarios?: string;
  botones?: BotonAccion[];
  destacada?: boolean;
}

export default function TarjetaBase({
  titulo,
  valorPrincipal,
  cambioTexto,
  esCambioPositivo = true,
  datosSecundarios,
  botones = [],
  destacada = false,
}: TarjetaBaseProps) {
  const cambioColor = esCambioPositivo ? "text-emerald-600" : "text-rose-600";

  return (
    <div
      className={`relative p-6 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
        destacada
          ? "bg-gradient-to-br from-white via-lime-50/30 to-lime-100/40 border-lime-300"
          : "bg-white border-gray-100"
      }`}
    >
      <div>
        {/* Título */}
        <div className="mb-3">
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            {titulo}
          </h3>
        </div>

        {/* Valor Principal y Cambio */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-extrabold text-gray-900">
            {valorPrincipal}
          </span>
          {cambioTexto && (
            <span className={`text-sm font-semibold ${cambioColor}`}>
              {cambioTexto}
            </span>
          )}
        </div>

        {/* Datos Secundarios */}
        {datosSecundarios && (
          <p className="text-sm text-gray-500 font-medium mb-2">
            {datosSecundarios}
          </p>
        )}
      </div>

      {/* Botones de Acción */}
      {botones.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-gray-100">
          {botones.map((boton, index) => {
            const defaultBtnClass =
              index === 0
                ? "bg-emerald-900 hover:bg-emerald-950 text-white shadow-sm"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200";

            const finalClassName =
              boton.className ||
              `text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${defaultBtnClass}`;

            return (
              <button key={index} onClick={boton.onClick} className={finalClassName}>
                {boton.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}