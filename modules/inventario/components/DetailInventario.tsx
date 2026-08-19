'use client';

import React from "react";
import DetailModal from "@/components/ui/DetailModal"; 
import { Tag, Hash, Award, Weight, Calendar, Activity, UserCheck, FileText, Users, ShieldAlert, Dna, Sparkles } from "lucide-react";

interface DetailInventarioProps {
  isOpen: boolean;
  onClose: () => void;
  bovino: any | null;
  bovinosDisponibles?: any[];
}

export default function DetailInventario({ isOpen, onClose, bovino, bovinosDisponibles = [] }: DetailInventarioProps) {
  
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
    if (anos === 0) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    if (meses === 0) return `${anos} ${anos === 1 ? 'año' : 'años'}`;

    return `${anos} ${anos === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  };

  // Buscar el Arete y Nombre real usando el UUID
  const obtenerProgenitorPorId = (idProgenitor: string | null) => {
    if (!idProgenitor) return "No registrado / Sin datos";

    const encontrado = bovinosDisponibles.find((b) => b.id === idProgenitor);
    if (encontrado) {
      const arete = encontrado.arete || "S/A";
      const nombre = encontrado.nombre ? `• ${encontrado.nombre}` : "";
      return `${arete} ${nombre}`;
    }

    return "No registrado en el hato";
  };

  const getBovinoDetails = () => {
    if (!bovino) return [];

    const infoMadre = obtenerProgenitorPorId(bovino.madre_id);
    const infoPadre = obtenerProgenitorPorId(bovino.padre_id);
    const estaActivo = bovino.condicion !== 'Inactivo';
    
    return [
      // 1. Identificación Principal
      { label: "Número de Arete", value: bovino.arete, icon: <Hash className="w-4 h-4 text-[#01684c]" /> },
      { label: "Nombre Oficial", value: bovino.nombre || "Sin nombre registrado", icon: <Tag className="w-4 h-4 text-[#01684c]" /> },
      { label: "Raza Predominante", value: bovino.raza, icon: <Award className="w-4 h-4 text-[#01684c]" /> },
      { label: "Género", value: bovino.genero, icon: <Users className="w-4 h-4 text-[#01684c]" /> },
      
      // 2. Ciclo Vital y Zootecnia
      { label: "Fecha de Nacimiento", value: bovino.fecha_nacimiento || "No especificada", icon: <Calendar className="w-4 h-4 text-[#01684c]" /> },
      { label: "Edad Actual", value: calcularEdadCompleta(bovino.fecha_nacimiento), icon: <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> },
      { label: "Peso Inicial", value: bovino.peso_inicial ? `${bovino.peso_inicial} kg` : "No registrado", icon: <Weight className="w-4 h-4 text-[#01684c]" /> },
      { label: "Estado Productivo", value: bovino.estado || "No asignado", icon: <Activity className="w-4 h-4 text-[#01684c]" /> },
      { label: "Propósito Zootécnico", value: bovino.proposito || "Doble Propósito", icon: <Activity className="w-4 h-4 text-[#01684c]" />, fullWidth: true },

      // 3. Genealogía
      { label: "Madre (Vaca Registrada)", value: infoMadre, icon: <Dna className="w-4 h-4 text-[#01684c]" />, fullWidth: true },
      { label: "Padre (Toro Registrado)", value: infoPadre, icon: <Dna className="w-4 h-4 text-[#01684c]" />, fullWidth: true },

      // 4. Condición Operativa
      { 
        label: "Condición en el Hato", 
        value: (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            !estaActivo 
              ? 'bg-rose-100 text-rose-700 border border-rose-300' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${!estaActivo ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            {estaActivo ? 'Activo en Producción' : 'Inactivo (Dado de baja)'}
          </span>
        ), 
        icon: <UserCheck className="w-4 h-4 text-slate-500" />,
        fullWidth: true 
      },

      // Motivos de baja (si está inactivo)
      ...(bovino.motivo_baja ? [
        { label: "Motivo de Baja", value: bovino.motivo_baja, icon: <ShieldAlert className="w-4 h-4 text-rose-600" />, fullWidth: true },
        { label: "Observación de Baja", value: bovino.observacion_baja, icon: <FileText className="w-4 h-4 text-rose-600" />, fullWidth: true }
      ] : []),

      // 5. Observaciones
      { label: "Observaciones Generales", value: bovino.observaciones || "Sin observaciones adicionales registradas.", icon: <FileText className="w-4 h-4 text-slate-500" />, fullWidth: true },
    ];
  };

  return (
    <DetailModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Expediente Zootécnico del Bovino"
      subtitle={`Ficha técnica y trazabilidad integral del ejemplar #${bovino?.arete || ''}`}
      items={getBovinoDetails()} 
    />
  );
}