'use client';

import React from 'react';
import PesajeTable from './components/PesajeTable';

export default function PesajeIndex() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Contenedor de la Tabla que ya incluye la cabecera, filtros, métricas y registros */}
      <PesajeTable />
    </div>
  );
}