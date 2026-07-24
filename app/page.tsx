// app/page.tsx
import { redirect } from 'next/navigation';

export default function Page() {
  // Esto asegura que si alguien entra a tu dominio.com, 
  // sea enviado directamente al dashboard
  redirect('/inventario');
}