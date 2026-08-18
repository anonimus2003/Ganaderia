'use client';

import React from "react";
import { X, Save, Loader2 } from "lucide-react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitText?: string;
}

export default function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  isSubmitting = false,
  submitText = "Guardar Registro"
}: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-100 animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Header más limpio y moderno */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-zinc-100">
          <h3 className="text-base font-bold text-zinc-900 tracking-tight">{title}</h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body con scroll optimizado y padding cómodo para móvil */}
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer estándar reutilizable con los botones de Cancelar y Guardar con su respectivo icono */}
          <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-zinc-600 font-semibold text-sm hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#01684c] text-white rounded-xl font-bold text-sm hover:bg-[#01563f] shadow-lg shadow-[#01684c]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? "Guardando..." : submitText}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}