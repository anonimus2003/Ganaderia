'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/') 
      router.refresh()
    }
  }

  // Función para manejar el acceso como invitado
  const handleGuestLogin = () => {
    router.push('/') 
    router.refresh()
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      width: '100vw',
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("fondo.png")', 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        padding: '30px 24px', 
        backgroundColor: '#ffffff',
        borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        boxSizing: 'border-box'
      }}>
        
{/* CONTENEDOR DEL LOGO (TAMAÑO NORMAL) */}
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
  <div style={{ width: '110px', height: '110px', marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <img 
      src="logo.svg" 
      alt="Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
    />
  </div>
  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0', textAlign: 'center' }}>Bienvenido</h2>
</div>

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          
          {/* Campo de Correo */}
          <div style={{ width: '100%', marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
              Correo Electrónico
            </label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="correo@ejemplo.com"
              style={{ 
                width: '100%', 
                padding: '11px 14px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '16px', 
                fontSize: '14px',
                color: '#111827',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#000000'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Campo de Contraseña */}
          <div style={{ width: '100%', marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                padding: '11px 14px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '16px', 
                fontSize: '14px',
                color: '#111827',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#000000'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <p style={{ color: '#dc2626', fontSize: '13px', margin: 0, fontWeight: '600' }}>
                Email o contraseña invalida
              </p>
            </div>
          )}

          {/* Botón de Entrada */}
          <div style={{ width: '100%', marginBottom: '16px' }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                width: '100%', 
                padding: '13px', 
                backgroundColor: '#000000', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '16px', 
                fontWeight: '600',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#222222' }}
              onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#000000' }}
            >
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </div>

          {/* Texto de Invitado */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <span 
              onClick={handleGuestLogin}
              style={{ 
                fontSize: '13px', 
                color: '#6b7280', 
                textDecoration: 'none', 
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#111827'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              Ingresar como invitado
            </span>
          </div>

        </form>

      </div>
    </div>
  )
}