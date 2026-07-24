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
      router.push('/') // Redirige al dashboard principal
      router.refresh()
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw',
      // Recuerda subir tu imagen de fondo a la carpeta /public con este nombre
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("/background-cow.jpg")', 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '420px', 
        width: '100%',
        padding: '40px 30px', 
        backgroundColor: '#ffffff',
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        boxSizing: 'border-box'
      }}>
        
        {/* CONTENEDOR DEL LOGO (CENTRADÍSIMO Y GRANDE) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          
          {/* Tu SVG adaptado, centrado y ampliado a un tamaño ideal */}
          <div style={{ width: '130px', height: '145px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
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
              <g>
                <path 
                  fill="#fefefe" 
                  stroke="#fefefe" 
                  strokeWidth="0.5" 
                  d="M 0,0 c 26,0 52,0 78,0 c 0,29 0,58 0,87 c -26,0 -52,0 -78,0 c 0,-29 0,-58 0,-87 Z M 26.32,30 c -0.14,0.2 -0.28,0.4 -0.42,0.6 c -6.09,-3.79 -11.7,-3.21 -17.85,-0.02 c -0.71,0.71 -0.87,1.53 -0.47,2.44 c 2.19,4.11 5.57,6.61 10.14,7.5 c 1.54,0.91 11.55,-0.77 8.66,-3.39 c -1.62,0.31 -3.24,0.69 -4.87,1.13 c -3.52,1.63 -14.95,-5.03 -10.12,-6.73 c 7.64,-3.55 12.9,0.35 18.75,4.92 c 6.22,2 11.14,5.72 14.76,11.17 c 4.57,7.45 1.65,10.51 -1.52,17.02 c -1.44,-1.1 -2.89,-2.22 -4.34,-3.38 c -8.94,-4.73 -12.19,-5.27 -12.44,-16.41 c -0.69,-0.57 -1.33,-0.51 -1.94,0.16 c -1.11,5.85 0.68,10.59 5.39,14.24 c 3.41,1.55 6.66,3.36 9.76,5.4 c -1.54,0.7 -3.07,1.47 -4.6,2.33 c -4.51,3.17 -5.18,5.61 -7.64,10.2 c -0.4,1.81 1.21,2.93 2.21,1.21 c 1.57,-5.08 6.56,-11.76 12.56,-11.04 c 5.69,4.15 16.11,6.48 20.15,-1.3 c 4.06,-7.15 -6.52,-14.48 -3.95,-24.88 c 0.2,-0.53 0.59,-0.83 1.16,-0.89 c 3.71,0.27 6.86,-0.91 9.45,-3.56 c 3.18,-3.08 -0.27,-4.12 -2.88,-5.32 c -2,-0.66 -4.03,-1.04 -6.1,-1.15 c 1.55,-2.04 2.78,-4.29 3.7,-6.75 c 0.67,-2.2 0.89,-4.45 0.67,-6.74 c -0.36,-1.29 -1.09,-1.55 -2.17,-0.8 c -1.66,3.89 -6.69,9.28 -11.34,8.48 c -8.26,-3.7 -19.83,1.66 -24.49,-8.46 c -0.73,-2.17 -1.48,-4.3 -2.23,-6.38 c -0.55,0.08 -1.01,0.33 -1.38,0.75 c -3.88,7.81 -2.21,13.58 3.39,19.65 Z"
                />
              </g>
              <g>
                <path 
                  fill="#161616" 
                  d="M 25.9,30.6 c 3.22,2.35 6.69,4.24 10.42,5.67 c 7.76,5.03 12.78,10.57 13.31,20.2 c 0.24,4.01 -6.15,7.49 -2.67,11.01 c 6.45,3.51 17.99,-0.16 13.22,-9.12 c -4.03,-5.76 -5.19,-12.42 -3.6,-19.3 c -3.83,-22.05 -19.39,-8.23 -29.78,-18.43 c -1.18,-1.46 -2.28,-2.97 -3.29,-4.54 c -1.64,2.96 1.16,8.45 3.26,10.71 c 1.31,1.04 2.63,2.06 3.95,3.07 c 0.14,0.89 -0.26,1.33 -1.18,1.3 c -1.08,-0.39 -2.15,-0.78 -3.22,-1.17 c -5.6,-6.07 -7.27,-11.84 -3.39,-19.65 c 0.37,-0.42 0.83,-0.67 1.38,-0.75 c 0.75,2.08 1.5,4.21 2.23,6.38 c 4.66,10.12 16.23,4.76 24.49,8.46 c 4.65,0.8 9.68,-4.59 11.34,-8.48 c 1.08,-0.75 1.81,-0.49 2.17,0.8 c 0.22,2.29 0,4.54 -0.67,6.74 c -0.92,2.46 -2.15,4.71 -3.7,6.75 c 2.07,0.11 4.1,0.49 6.1,1.15 c 2.61,1.2 6.06,2.24 2.88,5.32 c -2.59,2.65 -5.74,3.83 -9.45,3.56 c -0.57,0.06 -0.96,0.36 -1.16,0.89 c -2.57,10.4 8.01,17.73 3.95,24.88 c -4.04,7.78 -14.46,5.45 -20.15,1.3 c -6,-0.72 -10.99,5.96 -12.56,11.04 c -1,1.72 -2.61,0.6 -2.21,-1.21 c 2.46,-4.59 3.13,-7.03 7.64,-10.2 c 1.53,-0.86 3.06,-1.63 4.6,-2.33 c -3.1,-2.04 -6.35,-3.85 -9.76,-5.4 c -4.71,-3.65 -6.5,-8.39 -5.39,-14.24 c 0.61,-0.67 1.25,-0.73 1.94,-0.16 c 0.25,11.14 3.5,11.68 12.44,16.41 c 1.45,1.16 2.9,2.28 4.34,3.38 c 3.17,-6.51 6.09,-9.57 1.52,-17.02 c -3.62,-5.45 -8.54,-9.17 -14.76,-11.17 c -5.85,-4.57 -11.11,-8.47 -18.75,-4.92 c -4.83,1.7 6.6,8.36 10.12,6.73 c 1.63,-0.44 3.25,-0.82 4.87,-1.13 c 2.89,2.62 -7.12,4.3 -8.66,3.39 c -4.57,-0.89 -7.95,-3.39 -10.14,-7.5 c -0.4,-0.91 -0.24,-1.73 0.47,-2.44 c 6.15,-3.19 11.76,-3.77 17.85,0.02 Z M 53.69,27.02 c 3.22,10.55 9.13,-7.32 7.73,-4.72 c -2.46,1.76 -5.04,3.33 -7.73,4.72 Z M 57.26,33.03 c 0.86,7.01 5.38,5.93 9.7,2.32 c 0.68,-2.78 -9.71,-3.22 -9.7,-2.32 Z"
                />
              </g>
              <g>
                <path 
                  fill="#f9f9f9" 
                  d="M 57.26,33.03 c -0.01,-0.9 10.38,-0.46 9.7,2.32 c -4.32,3.61 -8.84,4.69 -9.7,-2.32 Z"
                />
              </g>
              <g>
                <path 
                  fill="#f3f2f2" 
                  d="M 53.69,27.02 c 2.69,-1.39 5.27,-2.96 7.73,-4.72 c 1.4,-2.6 -4.51,15.27 -7.73,4.72 Z"
                />
              </g>
              <g>
                <path 
                  fill="#fdfdfd" 
                  stroke="#fdfdfd" 
                  strokeWidth="0.5" 
                  d="M 25.9,30.6 c 0.14,-0.2 0.28,-0.4 0.42,-0.6 c 1.07,0.39 2.14,0.78 3.22,1.17 c 0.92,0.03 1.32,-0.41 1.18,-1.3 c -1.32,-1.01 -2.64,-2.03 -3.95,-3.07 c -2.1,-2.26 -4.9,-7.75 -3.26,-10.71 c 1.01,1.57 2.11,3.08 3.29,4.54 c 10.39,10.2 25.95,-3.62 29.78,18.43 c -1.59,6.88 -0.43,13.54 3.6,19.3 c 4.77,8.96 -6.77,12.63 -13.22,9.12 c -3.48,-3.52 2.91,-7 2.67,-11.01 c -0.53,-9.63 -5.55,-15.17 -13.31,-20.2 c -3.73,-1.43 -7.2,-3.32 -10.42,-5.67 Z"
                />
              </g>
            </svg>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Ganadería</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, textAlign: 'center' }}>
            Ingresa al sistema de control
          </p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleLogin}>
          {/* Campo de Correo */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
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
                padding: '12px 16px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                fontSize: '15px',
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
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                Contraseña
              </label>
              <a href="#" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                fontSize: '15px',
                color: '#111827',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#000000'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fca5a5', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0, textAlign: 'center', fontWeight: '500' }}>
                ❌ {error === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error}
              </p>
            </div>
          )}

          {/* Botón de Entrada Negro Puro */}
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: '#000000', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#222222' }}
            onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#000000' }}
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}