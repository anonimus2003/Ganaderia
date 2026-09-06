'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Menu, X, Settings, LogOut, Users 
} from 'lucide-react'

interface DashboardClientLayoutProps {
  children: React.ReactNode
  perfil: { nombre: string; rol: string } | null
  logoutAction: () => Promise<void>
}

function CowLogo({ variant = 'white' }: { variant?: 'white' | 'black' }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <Image src="/logo.svg" alt="Logo Ganaderia" width={36} height={36} className={`w-full h-full object-contain ${variant === 'black' ? 'brightness-0' : 'brightness-0 invert'}`} />
    </div>
  )
}

export default function DashboardClientLayout({
  children,
  perfil,
  logoutAction,
}: DashboardClientLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: '/inventario', label: 'Inventario', iconSrc: '/inventario.png' },
    { href: '/ordeno', label: 'Ordeño', iconSrc: '/leche.png' },
    { href: '/potreros', label: 'Potreros', iconSrc: '/ubicacion.png' },
    { href: '/pesaje', label: 'Pesaje', iconSrc: '/bascula.png' },
    { href: '/reproduccion', label: 'Reproducción', iconSrc: '/adn.png' },
    { href: '/medicamentos', label: 'Medicamentos', iconSrc: '/pildora.png' },
  ]

  return (
    <div className="flex min-h-screen bg-[#f4f6f3] text-zinc-900 font-sans relative">
      
      {/* 📱 NAVBAR MÓVIL */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4 z-35">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center">
            <CowLogo variant="black" />
          </div>
          <span className="text-zinc-900 font-semibold text-base tracking-tight">Ganadería</span>
        </div>
        
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="text-zinc-700 p-2 rounded-lg hover:bg-zinc-100 active:scale-95 transition-all cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
      </div>

      {/* 🌑 OVERLAY MÓVIL SUAVE */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-zinc-900/30 z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🧭 SIDEBAR RESPONSIVO FLUIDO */}
      <aside className={`
        fixed md:sticky top-0 inset-y-0 left-0 z-50 flex flex-col justify-between 
        bg-[#01684c] border-r border-[#01523b] transition-transform duration-200 ease-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${isCollapsed ? 'md:w-20' : 'w-64'} 
        h-screen shadow-lg md:shadow-none
      `}>
        
        {/* PARTE SUPERIOR */}
        <div className="flex flex-col gap-4 p-4 md:pt-6 overflow-y-auto overflow-x-hidden">
          
          {/* LOGO Y CONTROLES */}
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : 'justify-between'} mb-2`}>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                <CowLogo variant="white" />
              </div>
              <span className={`text-white font-bold text-lg tracking-tight whitespace-nowrap transition-all ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                Ganadería
              </span>
            </button>

            {/* Minimizar Desktop */}
            {!isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex text-white/80 hover:text-[#D1F843] transition-colors p-1.5 rounded-lg hover:bg-black/10 cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}

            {/* Cerrar Móvil */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-white p-1.5 hover:bg-black/10 rounded-lg cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {!isCollapsed && (
              <span className="text-[11px] font-semibold text-emerald-200/70 uppercase tracking-wider px-2 mb-1">
                Operaciones
              </span>
            )}
            
            {menuItems.map((item) => {
              const active = isActive(item.href)
              
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150
                    ${active 
                      ? 'bg-[#D1F843] text-zinc-950 font-semibold shadow-xs' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }
                    ${isCollapsed ? 'md:justify-center' : 'justify-start'}
                  `}
                >
                  {item.iconSrc ? (
                    <div className="w-[18px] h-[18px] relative flex-shrink-0 flex items-center justify-center">
                      <Image 
                        src={item.iconSrc} 
                        alt={item.label} 
                        fill
                        sizes="18px"
                        className={`object-contain transition-all ${
                          active ? 'brightness-0' : 'brightness-0 invert'
                        }`} 
                      />
                    </div>
                  ) : null}

                  <span className={`whitespace-nowrap transition-all ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* Panel Admin */}
            {perfil?.rol === 'Administrador' && (
              <div className="mt-4 flex flex-col gap-1.5">
                {!isCollapsed && (
                  <span className="text-[11px] font-semibold text-emerald-200/70 uppercase tracking-wider px-2 mb-1 block">
                    Administración
                  </span>
                )}
                
                <Link 
                  href="/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150
                    ${isActive('/dashboard') 
                      ? 'bg-[#D1F843] text-zinc-950 font-semibold shadow-xs' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }
                    ${isCollapsed ? 'md:justify-center' : 'justify-start'}
                  `}
                >
                  <Settings size={18} className="flex-shrink-0" strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                  <span className={`whitespace-nowrap transition-all ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                    Panel Control
                  </span>
                </Link>

                <Link 
                  href="/usuarios"
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150
                    ${isActive('/usuarios') 
                      ? 'bg-[#D1F843] text-zinc-950 font-semibold shadow-xs' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }
                    ${isCollapsed ? 'md:justify-center' : 'justify-start'}
                  `}
                >
                  <Users size={18} className="flex-shrink-0" strokeWidth={isActive('/usuarios') ? 2.5 : 2} />
                  <span className={`whitespace-nowrap transition-all ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                    Usuarios
                  </span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* PARTE INFERIOR */}
        <div className="p-4 border-t border-[#01523b] bg-[#01523b]/50">
          <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}>
            <div className="w-8 h-8 rounded-full bg-[#D1F843] text-zinc-950 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {perfil?.nombre?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className={`flex flex-col overflow-hidden transition-all ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
              <span className="text-sm font-semibold text-white truncate">{perfil?.nombre || 'Usuario'}</span>
              <span className="text-xs text-emerald-200/80 truncate">{perfil?.rol}</span>
            </div>
          </div>
          
          <form action={logoutAction}>
            <button 
              type="submit" 
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors duration-150 cursor-pointer
                ${isCollapsed ? 'md:justify-center' : 'justify-start'}
              `}
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span className={`font-semibold whitespace-nowrap transition-all ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                Cerrar Sesión
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* 📝 CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-14">
        <main className="flex-1 p-0 bg-white min-h-screen">
          {children}
        </main>
      </div>

    </div>
  )
}