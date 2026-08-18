'use client';

import React from "react";
import DetailModal from "@/components/ui/DetailModal"; 
import { Calendar, Hash, Pill, Syringe, Activity, User, FileText, Clock, ShieldAlert } from "lucide-react";
import { Tratamiento } from "../schemas"; 

interface DetailTratamientoProps {
  isOpen: boolean;
  onClose: () => void;
  // Permitimos que el objeto pueda traer opcionalmente los datos del bovino relacionado
  tratamiento: (Tratamiento & { bovinos?: { arete?: string; nombre?: string | null } }) | null;
}

export default function DetailTratamiento({ isOpen, onClose, tratamiento }: DetailTratamientoProps) {
  
  const getDetalles = () => {
    if (!tratamiento) return [];

    const bovinoInfo = tratamiento.bovinos 
      ? `${tratamiento.bovinos.arete || "Sin arete"} ${tratamiento.bovinos.nombre ? `- ${tratamiento.bovinos.nombre}` : ""}`
      : "No asignado";
    
    return [
      { 
        label: "Fecha de Aplicación", 
        value: tratamiento.fecha_aplicacion || "No especificada", 
        icon: <Calendar className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Arete - Animal", 
        value: bovinoInfo, 
        icon: <Hash className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Medicamento", 
        value: tratamiento.medicamento || "N/A", 
        icon: <Pill className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Dosis", 
        value: tratamiento.dosis || "No especificada", 
        icon: <Syringe className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Vía de Administración", 
        value: tratamiento.via || "No especificada", 
        icon: <Activity className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Tiempo de Retiro (General)", 
        value: `${tratamiento.tiempo_retiro ?? 0} días`, 
        icon: <Clock className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Retiro en Leche", 
        value: `${tratamiento.retiro_leche ?? 0} días`, 
        icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> 
      },
      { 
        label: "Retiro en Carne", 
        value: `${tratamiento.retiro_carne ?? 0} días`, 
        icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> 
      },
      { 
        label: "Veterinario / Responsable", 
        value: tratamiento.veterinario || "N/A", 
        icon: <User className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Motivo / Diagnóstico", 
        value: tratamiento.motivo || "Sin motivo registrado", 
        icon: <FileText className="w-3.5 h-3.5" />, 
        fullWidth: true 
      },
    ];
  };

  return (
    <DetailModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles del Tratamiento"
      subtitle="Información detallada del control clínico y sanitario"
      items={getDetalles()} 
    />
  );
}