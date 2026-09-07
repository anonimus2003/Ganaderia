'use client';

import React from "react";
import { Wrench } from "lucide-react";

export default function MantenimientoPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-pulse">
        <Wrench className="w-10 h-10" />
      </div>
      
      <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
        Módulo en construcción nnn
      </span>

      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
        Módulo sin mantenimiento
      </h1>
      
      <p className="text-slate-500 max-w-md text-sm leading-relaxed mb-8">
        Esta sección se encuentra temporalmente deshabilitada o en proceso de actualización. Vuelve a intentarlo más tarde.
      </p>

      <button
        onClick={() => window.history.back()}
        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
      >
        Regresar
      </button>
    </div>
  );
}