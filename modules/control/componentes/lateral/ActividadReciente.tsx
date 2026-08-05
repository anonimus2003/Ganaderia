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
    <div className="border border-gray-800 bg-[#0d1110] p-6 rounded-2xl space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Actividad reciente
        </h3>
        <a href="#" className="text-xs text-emerald-400 hover:underline">Ver todo</a>
      </div>

      <div className="space-y-3 text-xs">
        {actividad && actividad.length > 0 ? (
          actividad.slice(0, 3).map((act) => (
            <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
              <div className="space-y-0.5">
                <p className="font-medium text-white">{act.detalle}</p>
                <p className="text-[10px] text-gray-500">{new Date(act.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs">Sin actividad registrada aún.</p>
        )}
      </div>
    </div>
  );
}