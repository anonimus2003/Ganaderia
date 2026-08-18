'use client';

import React from "react";
import DetailModal from "@/components/ui/DetailModal"; 
import { Calendar, Hash, Droplet, Clock, User, FileText, Package } from "lucide-react";
import { ProduccionLeche } from "../schemas";

interface DetailOrdeneProps {
  isOpen: boolean;
  onClose: () => void;
  ordene: ProduccionLeche | null;
}

export default function DetailOrdene({ isOpen, onClose, ordene }: DetailOrdeneProps) {
  
  const getOrdeneDetails = () => {
    if (!ordene) return [];

    // Formatear la etiqueta del bovino (Arete - Nombre)
    const bovinoInfo = ordene.bovinos 
      ? `${ordene.bovinos.arete} ${ordene.bovinos.nombre ? `- ${ordene.bovinos.nombre}` : ""}`
      : "No asignado";
    
    return [
      { 
        label: "Fecha del Ordeño", 
        value: ordene.fecha || "No especificada", 
        icon: <Calendar className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Jornada", 
        value: ordene.jornada || "No especificada", 
        icon: <Clock className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Arete - Animal", 
        value: bovinoInfo, 
        icon: <Hash className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Litros Producidos", 
        value: ordene.litros !== undefined ? `${ordene.litros} L` : "0 L", 
        icon: <Droplet className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Concentrado", 
        value: `${ordene.concentrado_kg || 0} kg`, 
        icon: <Package className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Registrado por", 
        value: ordene.registrado_por || "N/A", 
        icon: <User className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Observaciones", 
        value: ordene.observaciones ? String(ordene.observaciones) : "Sin observaciones registradas", 
        icon: <FileText className="w-3.5 h-3.5" />, 
        fullWidth: true 
      },
    ];
  };

  return (
    <DetailModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles del Ordeño"
      subtitle="Información detallada del registro de producción"
      items={getOrdeneDetails()} 
    />
  );
}