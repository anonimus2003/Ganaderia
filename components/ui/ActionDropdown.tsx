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
  const [coords, setCoords] = useState({ top: 0, left: 0, dropUp: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 140; 
      const dropUp = spaceBelow < menuHeight;

      setCoords({
        top: dropUp ? rect.top - 6 : rect.bottom + 6,
        left: rect.right - 130, 
        dropUp,
      });
    }

    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // 👈 Cierra el menú automáticamente si el usuario hace scroll en cualquier parte
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true); // true para capturar scroll en contenedores internos
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button 
        ref={buttonRef}
        onClick={handleToggle} 
        className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
          isOpen ? 'bg-slate-100 text-slate-700' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: coords.dropUp ? 'auto' : `${coords.top}px`,
            bottom: coords.dropUp ? `${window.innerHeight - coords.top}px` : 'auto',
            left: `${coords.left}px`,
          }}
          className="min-w-[130px] bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-300/30 rounded-xl p-1.5 z-[99999] animate-in fade-in zoom-in-95 duration-100"
        >
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
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 whitespace-nowrap transition-all duration-150 ${
                action.disabled 
                  ? 'opacity-40 cursor-not-allowed bg-transparent text-slate-400' 
                  : action.danger 
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer' 
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer'
              }`}
            >
              <span className="shrink-0">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}