'use client';

import React from "react";
import DetailModal from "@/components/ui/DetailModal"; 
import { Calendar, Hash, Scale, User, FileText, Activity, HeartPulse } from "lucide-react";
import { Pesaje } from "../schemas"; 

interface DetailPesajeProps {
  isOpen: boolean;
  onClose: () => void;
  pesaje: Pesaje | null;
}

export default function DetailPesaje({ isOpen, onClose, pesaje }: DetailPesajeProps) {
  
  const getPesajeDetails = () => {
    if (!pesaje) return [];

    const bovinoInfo = pesaje.bovinos 
      ? `${pesaje.bovinos.arete} ${pesaje.bovinos.nombre ? `- ${pesaje.bovinos.nombre}` : ""}`
      : "No asignado";
    
    return [
      { 
        label: "Fecha del Pesaje", 
        value: pesaje.fecha || "No especificada", 
        icon: <Calendar className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Arete - Animal", 
        value: bovinoInfo, 
        icon: <Hash className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Peso (kg)", 
        value: pesaje.peso_kgs !== undefined ? `${pesaje.peso_kgs} kg` : "0 kg", 
        icon: <Scale className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Condición Corporal", 
        value: pesaje.condicion_corporal ? `${pesaje.condicion_corporal} / 5` : "N/A", 
        icon: <Activity className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Estado Fisiológico", 
        value: pesaje.estado_fisiologico ? String(pesaje.estado_fisiologico) : "No especificado", 
        icon: <HeartPulse className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Registrado por", 
        value: pesaje.user_id || "N/A", 
        icon: <User className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Observaciones", 
        value: pesaje.observaciones ? String(pesaje.observaciones) : "Sin observaciones registradas", 
        icon: <FileText className="w-3.5 h-3.5" />, 
        fullWidth: true 
      },
    ];
  };

  return (
    <DetailModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles del Pesaje"
      subtitle="Información detallada del control de peso y condición corporal"
      items={getPesajeDetails()} 
    />
  );
}