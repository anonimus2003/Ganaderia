export interface Bovino {
  id: string;
  arete: string;
  nombre: string | null;
  raza: string;
  genero: string;
  peso_inicial: number;
  fecha_nacimiento: string | null;
  observaciones: string | null;
  estado: string | null;
  created_at: string;
}

export const ESTADOS_BOVINOS = [
  "Ternera en lactancia",
  "Destete",
  "Ternera en crecimiento",
  "Levante",
  "Novilla en desarrollo",
  "Novilla de vientre",
  "En producción",
  "Seca",
];

export const getEstadoBadgeStyle = (estado: string | null) => {
  switch (estado) {
    case "Ternera en lactancia":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "Destete":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Ternera en crecimiento":
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
    case "Levante":
      return "bg-lime-50 text-lime-800 border-lime-200";
    case "Novilla en desarrollo":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Novilla de vientre":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Producción":
    case "En producción":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Seca":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "Macho":
      return "bg-sky-50 text-sky-700 border-sky-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};