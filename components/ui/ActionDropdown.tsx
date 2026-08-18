'use client';

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean; // 👈 1. Añadimos esta propiedad opcional
}

interface ActionDropdownProps {
  actions: ActionItem[];
}

export default function ActionDropdown({ actions }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }} 
        className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
      >
        <MoreVertical className="w-5 h-5 text-slate-400" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl z-50 overflow-hidden">
          {actions.map((action, i) => (
            <button
              key={i}
              disabled={action.disabled} // 👈 2. Deshabilitamos el botón nativamente si está en true
              onClick={(e) => {
                e.stopPropagation();
                if (!action.disabled) {
                  action.onClick(); 
                  setIsOpen(false); 
                }
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                action.disabled 
                  ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' // 👈 3. Estilo visual cuando está bloqueado
                  : action.danger 
                    ? 'text-red-600 hover:bg-slate-50 cursor-pointer' 
                    : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}