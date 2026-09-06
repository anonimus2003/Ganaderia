import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner"; // 👈 1. Importas el Toaster de sonner
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Control de Inventario Bovino",
  description: "Sistema de gestión y trazabilidad para el hato",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" // 👈 Cambiado a español opcionalmente
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        {children}
        
        {/* 👈 2. Colocas el Toaster aquí para que sea global */}
        <Toaster 
          richColors 
          position="top-right" 
          closeButton 
        />
      </body>
    </html>
  );
}