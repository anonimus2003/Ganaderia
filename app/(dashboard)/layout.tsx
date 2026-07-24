import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClientLayout from './DashboardClientLayout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // 1. Obtener los datos de autenticación del usuario actual
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Consultar el perfil público del usuario
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user.id)
    .single()

  // Función para cerrar sesión (Server Action)
  async function logout() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <DashboardClientLayout perfil={perfil} logoutAction={logout}>
      {children}
    </DashboardClientLayout>
  )
}