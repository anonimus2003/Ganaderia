import React from "react";

interface Alerta {
  id: string;
  titulo: string;
  descripcion: string;
}

interface Props {
  alertas?: Alerta[];
}

export default function AlertasImportantes({
  alertas = [
    { id: "1", titulo: "3 vacas en observación", descripcion: "Requieren revisión veterinaria" },
    { id: "2", titulo: "2 ordeños pendientes", descripcion: "Programados para hoy" },
    { id: "3", titulo: "1 vacuna por aplicar", descripcion: "Vence en 2 días" },
  ],
}: Props) {
  return (
    <div className="border border-gray-100 bg-white p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
        Alertas importantes
      </h3>

      <div className="space-y-3">
        {alertas.map((alerta) => (
          <div
            key={alerta.id}
            className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between hover:bg-gray-100/70 hover:border-gray-200 transition-all cursor-pointer"
          >
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-gray-900">{alerta.titulo}</p>
              <p className="text-gray-500 font-medium">{alerta.descripcion}</p>
            </div>
            <span className="text-gray-400 font-bold">&gt;</span>
          </div>
        ))}
      </div>

      <div className="pt-2 text-right">
        <a href="#" className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline">
          Ver todas las alertas &gt;
        </a>
      </div>
    </div>
  );
}