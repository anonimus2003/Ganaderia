'use client';

import React from "react";
import { X } from "lucide-react";

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
  icon?: React.ReactNode; // Nuevo: Soporte para iconos opcionales por campo
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: DetailItem[];
  maxWidth?: string;
  isLoading?: boolean; // Nuevo: Estado de carga interno
  footerActions?: React.ReactNode; // Nuevo: Botones de acción extra (Editar, etc.)
}

export default function DetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  maxWidth = "max-w-xl",
  isLoading = false,
  footerActions
}: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`}>
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/80">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Cuerpo */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            // Estado de carga elegante (Skeleton loader simple)
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-4 bg-slate-100 rounded-xl h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors rounded-xl border border-slate-100/90 flex flex-col justify-between ${item.fullWidth ? 'sm:col-span-2' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {item.icon && <span className="text-slate-400">{item.icon}</span>}
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800 break-words">
                    {item.value !== undefined && item.value !== null && item.value !== "" ? (
                      item.value
                    ) : (
                      <span className="text-slate-400 font-normal italic">No especificado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie del Modal (Acciones) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center">
          <div>
            {footerActions}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}