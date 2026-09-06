'use client';

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
}

export default function ActionDropdown({ actions }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Si hay menos de 180 píxeles libres abajo, se abre hacia arriba automáticamente
      if (spaceBelow < 180) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }

    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={handleToggle} 
        className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4 text-slate-400" />
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 ${dropUp ? 'bottom-full mb-1' : 'mt-1'} w-28 bg-white border border-slate-100 shadow-lg rounded-lg z-50 overflow-hidden`}>
          {actions.map((action, i) => (
            <button
              key={i}
              disabled={action.disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!action.disabled) {
                  action.onClick(); 
                  setIsOpen(false); 
                }
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-2 whitespace-nowrap transition-colors ${
                action.disabled 
                  ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' 
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