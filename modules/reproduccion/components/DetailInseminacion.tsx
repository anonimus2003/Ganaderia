'use client';

import React from "react";
import DetailModal from "@/components/ui/DetailModal"; 
import { Calendar, Hash, Activity, Award, User, FileText, CheckCircle2, Stethoscope, Clock } from "lucide-react";
import { Inseminacion } from "../schemas"; 

interface DetailInseminacionProps {
  isOpen: boolean;
  onClose: () => void;
  registro: Inseminacion | null;
}

export default function DetailInseminacion({ isOpen, onClose, registro }: DetailInseminacionProps) {
  
  const getDetalles = () => {
    if (!registro) return [];

    const bovinoInfo = registro.bovinos 
      ? `${registro.bovinos.arete} ${registro.bovinos.nombre ? `- ${registro.bovinos.nombre}` : ""}`
      : "No asignado";
    
    return [
      { 
        label: "Fecha de Inseminación", 
        value: registro.fecha_inseminacion || "No especificada", 
        icon: <Calendar className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Arete - Animal", 
        value: bovinoInfo, 
        icon: <Hash className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Tipo", 
        value: registro.tipo || "I.Artificial", 
        icon: <Activity className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Toro / Pajilla", 
        value: registro.toro_pajilla || "No especificado", 
        icon: <Award className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Raza del Toro", 
        value: registro.raza_toro || "No especificada", 
        icon: <Award className="w-3.5 h-3.5" /> 
      },
      { 
        label: "N° de Servicios", 
        value: registro.numero_servicios !== undefined ? String(registro.numero_servicios) : "1", 
        icon: <Clock className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Estado", 
        value: registro.estado || "Pendiente", 
        icon: <CheckCircle2 className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Fecha de Chequeo", 
        value: registro.fecha_chequeo || "Pendiente de chequeo", 
        icon: <Stethoscope className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Parto Probable", 
        value: registro.fecha_probable_parto || "No calculada", 
        icon: <Calendar className="w-3.5 h-3.5" /> 
      },
      { 
        label: "Técnico Responsable", 
        value: registro.tecnico || "N/A", 
        icon: <User className="w-3.5 h-3.5" /> 
      },
    ];
  };

  return (
    <DetailModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles de la Inseminación"
      subtitle="Información detallada del control reproductivo"
      items={getDetalles()} 
    />
  );
}