"use client";

interface EncabezadoDashboardProps {
  titulo: string;
  subtitulo: string;
  nombreUsuario?: string;
}

export default function EncabezadoDashboard({
  titulo,
  subtitulo,
  nombreUsuario
}: EncabezadoDashboardProps) {

  return (
    <div className="mb-6">

      <h1 className="text-2xl font-black text-gray-900">
        {titulo}
      </h1>

      <p className="text-sm text-gray-500 mt-1">
        {subtitulo}
      </p>

      {nombreUsuario && (
        <p className="text-sm text-emerald-600 mt-2 font-semibold">
          Bienvenido, {nombreUsuario}
        </p>
      )}

    </div>
  );
}