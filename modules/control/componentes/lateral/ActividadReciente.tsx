import React from "react";

interface ActividadItem {
  id: string;
  detalle: string;
  created_at: string;
}

interface Props {
  actividad: ActividadItem[];
}

export default function ActividadReciente({ actividad }: Props) {
  return (
    <div className="border border-gray-100 bg-white p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          Actividad reciente
        </h3>
        <a href="#" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
          Ver todo
        </a>
      </div>

      <div className="space-y-3 text-xs">
        {actividad && actividad.length > 0 ? (
          actividad.slice(0, 3).map((act) => (
            <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <div className="space-y-0.5">
                <p className="font-semibold text-gray-900">{act.detalle}</p>
                <p className="text-[10px] text-gray-400">{new Date(act.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs py-2">Sin actividad registrada aún.</p>
        )}
      </div>
    </div>
  );
}