import { ReactNode } from "react";

interface Props {
  icono: ReactNode;
  etiqueta: string;
  valor: string;
}

export default function ItemResumen({
  icono,
  etiqueta,
  valor,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          {icono}
        </div>

        <span className="text-slate-600">
          {etiqueta}
        </span>

      </div>

      <span className="font-semibold text-slate-800">
        {valor}
      </span>

    </div>
  );
}