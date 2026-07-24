'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      minHeight: '100vh', 
      backgroundColor: '#f4f6f3', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1b3b1b',
      boxSizing: 'border-box'
    }}>
      
      {/* ⚡ ESTILOS DINÁMICOS Y FILTRO BLANCO ⚡ */}
      <style jsx global>{`
        .sidebar-text {
          opacity: ${isCollapsed ? '0' : '1'};
          width: ${isCollapsed ? '0' : 'auto'};
          overflow: hidden;
          transition: opacity 0.2s ease, width 0.2s ease;
          white-space: nowrap;
        }

        /* Filtro CSS para convertir cualquier PNG completamente a BLANCO puro (#ffffff) */
        .icon-white {
          filter: brightness(0) invert(1);
        }

        /* Filtro CSS para convertir el icono a verde oscuro cuando el botón/enlace está activo */
        .icon-dark {
          filter: brightness(0) saturate(100%) invert(14%) sepia(23%) saturate(855%) hue-rotate(77deg) brightness(96%) contrast(97%);
        }
      `}</style>
      
      {/* 1. SIDEBAR IZQUIERDO */}
      <aside style={{
        width: isCollapsed ? '80px' : '240px',
        borderRight: '1px solid #2d4a2d',
        backgroundColor: '#132A13', // Verde bosque oscuro profundo de la referencia
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* PARTE SUPERIOR (Logo + Botón + Links) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', overflowX: 'hidden' }}>
          
          {/* LOGO, VACA Y BOTÓN DE COLAPSO */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'space-between', 
            paddingLeft: isCollapsed ? '0px' : '4px',
            position: 'relative',
            gap: isCollapsed ? '4px' : '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              
              {/* 🐄 LOGO DE VACA (SVG / Ícono Blanco) 🐄 */}
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0', backgroundColor: '#1f3a1f', borderRadius: '10px' }}>
              <svg 
  viewBox="0 0 78 87" 
  style={{ 
    width: '100%', 
    height: '100%',
    shapeRendering: 'geometricPrecision', 
    textRendering: 'geometricPrecision', 
    fillRule: 'evenodd', 
    clipRule: 'evenodd' 
  }}
>
  {/* Contorno general de la figura con trazo blanco y fondo transparente */}
  <path 
    fill="none" 
    stroke="#ffffff" 
    strokeWidth="2" 
    d="M 0,0 c 26,0 52,0 78,0 c 0,29 0,58 0,87 c -26,0 -52,0 -78,0 c 0,-29 0,-58 0,-87 Z"
  />

  {/* Trazos internos y detalles de la figura en blanco con fondo transparente */}
  <g fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 26.32,30 c -0.14,0.2 -0.28,0.4 -0.42,0.6 c -6.09,-3.79 -11.7,-3.21 -17.85,-0.02 c -0.71,0.71 -0.87,1.53 -0.47,2.44 c 2.19,4.11 5.57,6.61 10.14,7.5 c 1.54,0.91 11.55,-0.77 8.66,-3.39 c -1.62,0.31 -3.24,0.69 -4.87,1.13 c -3.52,1.63 -14.95,-5.03 -10.12,-6.73 c 7.64,-3.55 12.9,0.35 18.75,4.92 c 6.22,2 11.14,5.72 14.76,11.17 c 4.57,7.45 1.65,10.51 -1.52,17.02 c -1.44,-1.1 -2.89,-2.22 -4.34,-3.38 c -8.94,-4.73 -12.19,-5.27 -12.44,-16.41 c -0.69,-0.57 -1.33,-0.51 -1.94,0.16 c -1.11,5.85 0.68,10.59 5.39,14.24 c 3.41,1.55 6.66,3.36 9.76,5.4 c -1.54,0.7 -3.07,1.47 -4.6,2.33 c -4.51,3.17 -5.18,5.61 -7.64,10.2 c -0.4,1.81 1.21,2.93 2.21,1.21 c 1.57,-5.08 6.56,-11.76 12.56,-11.04 c 5.69,4.15 16.11,6.48 20.15,-1.3 c 4.06,-7.15 -6.52,-14.48 -3.95,-24.88 c 0.2,-0.53 0.59,-0.83 1.16,-0.89 c 3.71,0.27 6.86,-0.91 9.45,-3.56 c 3.18,-3.08 -0.27,-4.12 -2.88,-5.32 c -2,-0.66 -4.03,-1.04 -6.1,-1.15 c 1.55,-2.04 2.78,-4.29 3.7,-6.75 c 0.67,-2.2 0.89,-4.45 0.67,-6.74 c -0.36,-1.29 -1.09,-1.55 -2.17,-0.8 c -1.66,3.89 -6.69,9.28 -11.34,8.48 c -8.26,-3.7 -19.83,1.66 -24.49,-8.46 c -0.73,-2.17 -1.48,-4.3 -2.23,-6.38 c -0.55,0.08 -1.01,0.33 -1.38,0.75 c -3.88,7.81 -2.21,13.58 3.39,19.65 Z" />
    <path d="M 53.69,27.02 c 3.22,10.55 9.13,-7.32 7.73,-4.72 c -2.46,1.76 -5.04,3.33 -7.73,4.72 Z" />
    <path d="M 57.26,33.03 c 0.86,7.01 5.38,5.93 9.7,2.32 c 0.68,-2.78 -9.71,-3.22 -9.7,-2.32 Z" />
  </g>
</svg>
              </div>

              <span className="sidebar-text" style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px', color: '#ffffff' }}>
                Ganaderia
              </span>
            </div>

            {/* Botón para esconder / mostrar el menú */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expandir menú" : "Minimizar menú"}
              style={{
                border: 'none',
                background: 'transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <img 
                src={isCollapsed ? "/rigth.png" : "/left.png"} 
                alt="Toggle Menu" 
                className="icon-white"
                style={{ width: isCollapsed ? '14px' : '18px', height: isCollapsed ? '14px' : '18px', objectFit: 'contain' }} 
              />
            </button>
          </div>

          {/* Botón Acción Rápida (Verde lima brillante con texto oscuro) */}
          <Link href="/inventario/nuevo" style={{ textDecoration: 'none', width: '100%' }}>
            <button style={{
              width: '100%',
              backgroundColor: '#B5E846',
              color: '#132A13',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
              <span className="sidebar-text">Registrar Ganado</span>
            </button>
          </Link>

          {/* Grupo de Links de Navegación (Letras Blancas / Activo en Lima) */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!isCollapsed && (
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#7a9a7a', padding: '4px 8px 4px 8px', textTransform: 'uppercase' }}>
                Ganadería
              </span>
            )}
            
            {[
              { href: '/inventario', label: 'Inventario', icon: '/inventario-disponible.png' },
              { href: '/leche', label: 'Ordeño', icon: '/leche (1).png' },
              { href: '/potreros', label: 'Potreros', icon: '/ubicacion.png' },
              { href: '/pesaje', label: 'Pesaje', icon: '/bascula.png' },
              { href: '/inseminacion', label: 'Reproducción', icon: '/adn.png' },
              { href: '/medicamentos', label: 'Medicamentos', icon: '/pildora.png' },
            ].map((item) => {
              const active = isActive(item.href)
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  title={item.label}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 10px', 
                    borderRadius: '6px', 
                    fontSize: '14px', 
                    color: active ? '#132A13' : '#ffffff', // Letra blanca por defecto, oscura si está activo
                    backgroundColor: active ? '#B5E846' : 'transparent', 
                    fontWeight: active ? '600' : '400',
                    textDecoration: 'none',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                  }}
                >
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className={active ? "icon-dark" : "icon-white"} // Ícono blanco por defecto, oscuro si está activo
                    style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }} 
                  />
                  <span className="sidebar-text">{item.label}</span>
                </Link>
              )
            })}

            {/* Configuración (Solo admin) */}
            {perfil?.rol === 'Administrador' && (
              <>
                {!isCollapsed && (
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#7a9a7a', padding: '12px 8px 4px 8px', textTransform: 'uppercase' }}>
                    Administración
                  </span>
                )}
                <Link 
                  href="/control" 
                  title="Panel Control"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 10px', 
                    borderRadius: '6px', 
                    fontSize: '14px', 
                    color: isActive('/control') ? '#132A13' : '#ffffff', 
                    backgroundColor: isActive('/control') ? '#B5E846' : 'transparent',
                    textDecoration: 'none', 
                    fontWeight: '500',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                  }}
                >
                  <img 
                    src="/panel.png" 
                    alt="Panel Control" 
                    className={isActive('/control') ? "icon-dark" : "icon-white"}
                    style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }} 
                  />
                  <span className="sidebar-text">Panel Control</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* PARTE INFERIOR (Footer: Usuario + Cerrar Sesión) */}
        <div style={{ borderTop: '1px solid #2d4a2d', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2d4a2d', color: '#B5E846', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px', flexShrink: 0 }}>
              {perfil?.nombre?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="sidebar-text" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', color: '#ffffff' }}>{perfil?.nombre || 'Usuario'}</span>
              <span style={{ fontSize: '11px', color: '#9aca9a' }}>{perfil?.rol}</span>
            </div>
          </div>
          
          <form action={logoutAction}>
            <button 
              type="submit" 
              title="Cerrar Sesión" 
              style={{ 
                width: '100%',
                padding: '8px', 
                backgroundColor: 'transparent', 
                color: '#f87171', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                alignItems: 'center',
                gap: '10px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f3a1f'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span className="sidebar-text">Cerrar Sesión</span>
              <img 
                src="/cerrar-sesion.png" 
                alt="Cerrar Sesión" 
                className="icon-white"
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  objectFit: 'contain',
                  display: isCollapsed ? 'block' : 'none'
                }} 
              />
            </button>
          </form>
        </div>
      </aside>

      {/* 2. CONTENEDOR PRINCIPAL */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>
        
        {/* Barra superior */}
        <header style={{
          height: '56px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
            <span>Panel principal</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Gestión Pecuaria</div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <main style={{ padding: '24px', boxSizing: 'border-box', flexGrow: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

    </div>
  )
}