'use client';

import React from "react";
import { ArrowLeft, Sparkles, Activity, Wheat, Tractor, Milk } from "lucide-react";

export default function MantenimientoPage() {
  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden bg-white text-slate-900 font-sans select-none">
      
      {/* ☀️ Resplandor ambiental suave sobre fondo blanco */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/80 rounded-full blur-[120px] pointer-events-none" />

      {/* 🏷️ TÍTULO SUPERIOR INTEGRADOR */}
      <div className="relative z-10 pt-2 text-center">
        
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
          Mantenimiento
        </h1>
        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
          Estamos adecuando este modulo para ofrecerte una mejor gestión de tu ganado.
        </p>
      </div>

      {/* 🖥️ ESCENOGRAFÍA GANADERA (Sin marcos externos, directo al fondo blanco) */}
      <div className="relative z-10 my-auto py-8 flex items-center justify-center w-full max-w-4xl scale-90 sm:scale-100">
        
        {/* 1. Anillo Orbital Flotante */}
        <div className="absolute w-[340px] sm:w-[580px] h-[180px] sm:h-[260px] border-[3px] border-emerald-400/50 rounded-[100%] rotate-[-18deg] pointer-events-none shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-[spin_35s_linear_infinite]" />

        {/* 2. Sombra suave en el suelo blanco */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[300px] sm:w-[480px] h-8 bg-slate-900/10 rounded-[100%] blur-xl pointer-events-none" />

        {/* 3. MONITOR ESTILO iMac CON EL DASHBOARD GANADERO */}
        <div className="relative w-[300px] sm:w-[480px] bg-slate-900 rounded-2xl p-2 sm:p-3 shadow-2xl shadow-slate-900/20 border border-slate-800">
          
          {/* Cámara superior */}
          <div className="w-2 h-2 bg-slate-700 rounded-full mx-auto mb-1.5" />
          
          {/* Pantalla del Dashboard Ganadero */}
          <div className="relative w-full h-[180px] sm:h-[270px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col p-3 sm:p-4 text-left">
            
            {/* Header Mockup App */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Tractor className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-100">AgroControl</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* Contenido Mockup */}
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold text-slate-100">
                Módulo de Ganado & Potreros
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold">
                    <Activity className="w-3 h-3" /> Producción
                  </div>
                  <p className="text-xs font-bold text-white mt-1">248 L / día</p>
                </div>
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-semibold">
                    <Wheat className="w-3 h-3" /> Rotación
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Lote #4 Activo</p>
                </div>
              </div>

              <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg mt-2 flex items-center gap-2">
                <Milk className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-medium">Actualizando sincronización de ordeño...</span>
              </div>
            </div>

          </div>

          {/* Pie de la Pantalla */}
          <div className="w-full h-5 sm:h-7 bg-slate-800/60 rounded-b-lg mt-1 flex items-center justify-center">
            <div className="w-8 h-1 bg-slate-600 rounded-full" />
          </div>
          {/* Base del Monitor */}
          <div className="w-24 sm:w-36 h-6 sm:h-9 bg-gradient-to-b from-slate-700 to-slate-800 mx-auto rounded-b-xl border-x border-b border-slate-600 shadow-md" />
        </div>

        {/* 4. CINTA DIAGONAL DE PRECAUCIÓN GANADERA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-10 sm:h-12 -rotate-6 shadow-xl z-20 flex items-center justify-center overflow-hidden border-y-2 border-slate-900 bg-[repeating-linear-gradient(135deg,#f59e0b,#f59e0b_24px,#1e293b_24px,#1e293b_48px)]">
          <div className="bg-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-widest px-4 py-0.5 rounded shadow-md uppercase flex items-center gap-2 border border-slate-900">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MANTENIMIENTO GANADERO</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 5. ELEMENTO IZQUIERDA: Cono de Precaución 3D */}
        <div className="absolute -bottom-4 -left-4 sm:left-4 z-30 transform -rotate-6 transition-transform hover:scale-105">
          <svg className="w-24 h-28 sm:w-36 sm:h-44 filter drop-shadow-xl" viewBox="0 0 120 140" fill="none">
            <ellipse cx="60" cy="130" rx="50" ry="8" fill="#0f172a" opacity="0.15" />
            <path d="M15 120 L105 120 L95 130 L25 130 Z" fill="#c2410c" />
            <rect x="20" y="122" width="80" height="6" rx="2" fill="#ea580c" />
            <path d="M60 10 L25 122 L95 122 Z" fill="#f97316" />
            <path d="M48 45 L72 45 L78 68 L42 68 Z" fill="#FFFFFF" opacity="0.9" />
            <path d="M37 82 L83 82 L88 102 L32 102 Z" fill="#FFFFFF" opacity="0.9" />
          </svg>
        </div>

        {/* 6. ELEMENTO DERECHA: Tractor Hidráulico Elevador 3D */}
        <div className="absolute -bottom-6 -right-4 sm:right-2 z-30 transform rotate-2 transition-transform hover:scale-105">
          <svg className="w-32 h-32 sm:w-48 sm:h-48 filter drop-shadow-xl" viewBox="0 0 160 160" fill="none">
            <ellipse cx="80" cy="148" rx="60" ry="8" fill="#0f172a" opacity="0.15" />
            
            {/* Brazo de tijera levantado */}
            <path d="M100 130 L125 75 L135 80 L110 135 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <path d="M125 75 L100 25 L110 20 L135 80 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
            
            {/* Cesta elevadora del tractor */}
            <rect x="85" y="10" width="45" height="22" rx="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="85" y1="18" x2="130" y2="18" stroke="#0f172a" strokeWidth="2" />

            {/* Operador / Vaca con casco */}
            <circle cx="108" cy="4" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M101 2 C101 -4, 115 -4, 115 2 Z" fill="#f59e0b" />

            {/* Cuerpo del Tractor */}
            <rect x="25" y="90" width="75" height="38" rx="8" fill="#16a34a" stroke="#0f172a" strokeWidth="3" />
            <rect x="55" y="65" width="40" height="30" rx="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" opacity="0.8" />
            <path d="M30 90 L50 65 L95 65 L100 90 Z" fill="#15803d" stroke="#0f172a" strokeWidth="3" />

            {/* Ruedas */}
            <circle cx="45" cy="132" r="18" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
            <circle cx="45" cy="132" r="8" fill="#94a3b8" />
            <circle cx="95" cy="135" r="14" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
            <circle cx="95" cy="135" r="6" fill="#94a3b8" />
          </svg>
        </div>

      </div>

     

    </div>
  );
}