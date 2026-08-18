'use client'

import { useState, useEffect } from 'react'
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

export default function DashboardClientLayout({
  children,
  perfil,
  logoutAction,
}: DashboardClientLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  // Cierra el menú móvil si la ruta cambia
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const menuItems = [
    { href: '/inventario', label: 'Inventario', iconSrc: '/inventario.png' },
    { href: '/leche', label: 'Ordeño', iconSrc: '/leche.png' },
    { href: '/potreros', label: 'Potreros', iconSrc: '/ubicacion.png' },
    { href: '/pesaje', label: 'Pesaje', iconSrc: '/bascula.png' },
    { href: '/reproduccion', label: 'Reproducción', iconSrc: '/adn.png' },
    { href: '/medicamentos', label: 'Medicamentos', iconSrc: '/pildora.png' },
  ]

  // LOGO VACA SVG Componentizado con control de color independiente (Blanco para fondo verde, Negro para fondo blanco)
  const CowLogo = ({ variant = 'white' }: { variant?: 'white' | 'black' }) => (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <img 
        src="/logo.svg" 
        alt="Logo Vaca" 
        className={`w-full h-full object-contain ${
          variant === 'black' ? 'brightness-0' : 'brightness-0 invert'
        }`} 
      />
    </div>
  )

  return (
    <div className="flex h-screen bg-[#f4f6f3] text-zinc-900 font-sans overflow-hidden relative">
      
      {/* 📱 NAVBAR MÓVIL MODERNO */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-4 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex items-center justify-center">
            {/* Aquí usamos variant='black' porque la barra superior móvil es blanca */}
            <CowLogo variant="black" />
          </div>
          <span className="text-zinc-900 font-semibold text-base tracking-tight">Ganadería</span>
        </div>
        
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="text-zinc-700 p-2 rounded-xl hover:bg-zinc-100 active:scale-95 transition-all"
          aria-label="Abrir menú"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
      </div>

      {/* 🌑 OVERLAY MÓVIL */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🧭 SIDEBAR FLOTANTE EN MÓVIL Y ADAPTABLE EN DESKTOP */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 flex flex-col justify-between 
        bg-[#01684c] border-r border-[#01523b] transition-all duration-300 ease-in-out
        ${isMobileOpen 
          ? 'translate-x-0 m-2 h-[calc(100vh-1rem)] rounded-2xl shadow-2xl border border-white/10' 
          : '-translate-x-full md:translate-x-0'} 
        ${isCollapsed ? 'md:w-20' : 'w-64'} 
        h-full md:h-screen md:rounded-none md:m-0
      `}>
        
        {/* PARTE SUPERIOR */}
        <div className="flex flex-col gap-4 p-4 md:pt-6 overflow-y-auto overflow-x-hidden">
          
          {/* LOGO Y BOTONES DE CONTROL */}
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : 'justify-between'} mb-2`}>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                {/* Aquí usamos variant='white' porque el fondo del sidebar es verde y requerimos el logo blanco */}
                <CowLogo variant="white" />
              </div>
              <span className={`text-white font-bold text-lg tracking-tight whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                Ganadería
              </span>
            </button>

            {/* Botón Cerrar "X" en Desktop cuando está expandido */}
            {!isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex text-white/80 hover:text-[#D1F843] transition-colors p-1.5 rounded-lg hover:bg-black/10"
                title="Minimizar menú"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}

            {/* Botón Cerrar "X" en Móvil (Siempre visible en el panel flotante móvil) */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-white p-1.5 hover:bg-black/10 rounded-lg"
            >
              <X size={24} />
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
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                    ${active 
                      ? 'bg-[#D1F843] text-zinc-950 font-semibold shadow-sm' 
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

                  <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* Panel Admin (Solo visible para rol Administrador) */}
            {perfil?.rol === 'Administrador' && (
              <div className="mt-4 flex flex-col gap-1.5">
                {!isCollapsed && (
                  <span className="text-[11px] font-semibold text-emerald-200/70 uppercase tracking-wider px-2 mb-1 block">
                    Administración
                  </span>
                )}
                
                {/* Enlace Panel Control */}
                <Link 
                  href="/control" 
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                    ${isActive('/control') 
                      ? 'bg-[#D1F843] text-zinc-950 font-semibold shadow-sm' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }
                    ${isCollapsed ? 'md:justify-center' : 'justify-start'}
                  `}
                >
                  <Settings size={18} className="flex-shrink-0" strokeWidth={isActive('/control') ? 2.5 : 2} />
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                    Panel Control
                  </span>
                </Link>

                {/* Enlace Usuarios */}
                <Link 
                  href="/usuarios" 
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                    ${isActive('/usuarios') 
                      ? 'bg-[#D1F843] text-zinc-950 font-semibold shadow-sm' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }
                    ${isCollapsed ? 'md:justify-center' : 'justify-start'}
                  `}
                >
                  <Users size={18} className="flex-shrink-0" strokeWidth={isActive('/usuarios') ? 2.5 : 2} />
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                    Usuarios
                  </span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* PARTE INFERIOR (Footer Usuario) */}
        <div className="p-4 border-t border-[#01523b] bg-[#01523b]/50">
          <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}>
            <div className="w-8 h-8 rounded-full bg-[#D1F843] text-zinc-950 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {perfil?.nombre?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className={`flex flex-col overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
              <span className="text-sm font-semibold text-white truncate">{perfil?.nombre || 'Usuario'}</span>
              <span className="text-xs text-emerald-200/80 truncate">{perfil?.rol}</span>
            </div>
          </div>
          
          <form action={logoutAction}>
            <button 
              type="submit" 
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors duration-200
                ${isCollapsed ? 'md:justify-center' : 'justify-start'}
              `}
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span className={`font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100'}`}>
                Cerrar Sesión
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* 📝 CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16 h-screen">
        <main className="flex-1 overflow-y-auto p-0 bg-white">
          {children}
        </main>
      </div>

    </div>
  )
}