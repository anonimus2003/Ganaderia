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
    <div className="border border-gray-800 bg-[#0d1110] p-6 rounded-2xl space-y-4 shadow-sm">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        Alertas importantes
      </h3>

      <div className="space-y-3">
        {alertas.map((alerta) => (
          <div key={alerta.id} className="p-3 rounded-xl bg-[#141a18] border border-gray-800 flex items-center justify-between hover:border-gray-700 transition cursor-pointer">
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-white">{alerta.titulo}</p>
              <p className="text-gray-400">{alerta.descripcion}</p>
            </div>
            <span className="text-gray-500">&gt;</span>
          </div>
        ))}
      </div>

      <div className="pt-1 text-right">
        <a href="#" className="text-xs text-red-400 hover:underline">Ver todas las alertas</a>
      </div>
    </div>
  );
}