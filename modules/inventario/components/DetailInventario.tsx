'use client';

import React from "react";
import DetailModal from "@/components/ui/DetailModal"; 
import { Tag, Hash, Award, Weight, Calendar, Activity, UserCheck, FileText, Users } from "lucide-react";

interface DetailInventarioProps {
  isOpen: boolean;
  onClose: () => void;
  bovino: any | null;
}

export default function DetailInventario({ isOpen, onClose, bovino }: DetailInventarioProps) {
  
  // Función precisa para calcular años y meses
  const calcularEdadCompleta = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return "No especificada";
    
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let anos = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();

    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
      anos--;
      meses += 12;
    }

    if (hoy.getDate() < nacimiento.getDate()) {
      meses--;
      if (meses < 0) {
        meses = 11;
      }
    }

    if (anos < 0) return "Fecha futura / Inválida";
    
    if (anos === 0 && meses === 0) return "Menos de un mes";
    
    if (anos === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    
    if (meses === 0) {
      return `${anos} ${anos === 1 ? 'año' : 'años'}`;
    }

    return `${anos} ${anos === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  };

  const getBovinoDetails = () => {
    if (!bovino) return [];
    
    return [
      { label: "Número de Arete", value: bovino.arete, icon: <Hash className="w-3.5 h-3.5" /> },
      { label: "Nombre", value: bovino.nombre || "Sin nombre", icon: <Tag className="w-3.5 h-3.5" /> },
      { label: "Raza", value: bovino.raza, icon: <Award className="w-3.5 h-3.5" /> },
      { label: "Género", value: bovino.genero, icon: <Users className="w-3.5 h-3.5" /> },
      { label: "Peso Inicial", value: bovino.peso_inicial ? `${bovino.peso_inicial} kg` : "No registrado", icon: <Weight className="w-3.5 h-3.5" /> },
      { label: "Fecha de Nacimiento", value: bovino.fecha_nacimiento || "No especificada", icon: <Calendar className="w-3.5 h-3.5" /> },
      { label: "Edad Actual", value: calcularEdadCompleta(bovino.fecha_nacimiento), icon: <Calendar className="w-3.5 h-3.5" /> },
      { label: "Estado Productivo", value: bovino.estado || "No asignado", icon: <Activity className="w-3.5 h-3.5" /> },
      { label: "Condición", value: bovino.condicion, icon: <UserCheck className="w-3.5 h-3.5" /> },
      // Si está inactivo o dado de baja, mostramos los motivos en ancho completo
      ...(bovino.motivo_baja ? [
        { label: "Motivo de Baja", value: bovino.motivo_baja, icon: <FileText className="w-3.5 h-3.5" />, fullWidth: true },
        { label: "Observación de Baja", value: bovino.observacion_baja, icon: <FileText className="w-3.5 h-3.5" />, fullWidth: true }
      ] : []),
      { label: "Observaciones Generales", value: bovino.observaciones || "Sin observaciones registradas", icon: <FileText className="w-3.5 h-3.5" />, fullWidth: true },
    ];
  };

  return (
    <DetailModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Expediente del Bovino"
      subtitle={`Detalles completos del animal con Arete #${bovino?.arete || ''}`}
      items={getBovinoDetails()} 
    />
  );
}