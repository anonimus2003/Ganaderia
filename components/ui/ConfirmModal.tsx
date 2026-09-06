// components/ui/ConfirmModal.tsx
"use client";

import React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Sí, eliminar",
  cancelText = "Cancelar",
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100 my-auto p-6 space-y-5">
        
        {/* Cabecera con Icono de Advertencia */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl ${isDestructive ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <p className="text-xs font-medium text-zinc-600 leading-relaxed">
          {message}
        </p>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-zinc-600 font-semibold text-xs hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                : "bg-[#01684c] hover:bg-[#01563f] shadow-[#01684c]/20"
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}