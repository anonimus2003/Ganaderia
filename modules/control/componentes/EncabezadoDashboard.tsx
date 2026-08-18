"use client";

import React, { useState, useEffect } from "react";

interface EncabezadoDashboardProps {
  nombreUsuario?: string;
}

export default function EncabezadoDashboard({
  nombreUsuario
}: EncabezadoDashboardProps) {
  const [saludo, setSaludo] = useState("Bienvenido");

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
      setSaludo("Buenos días");
    } else if (hora >= 12 && hora < 18) {
      setSaludo("Buenas tardes");
    } else {
      setSaludo("Buenas noches");
    }
  }, []);

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">
        {saludo}, {nombreUsuario || "Ganadero"} 👋
      </h1>
    </div>
  );
}