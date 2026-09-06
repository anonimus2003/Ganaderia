export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  gridSpan?: 'full' | 'half';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export const reproduccionFormFields: FormFieldConfig[] = [
  { name: 'toroPajilla', label: 'Toro - Pajilla', type: 'text', placeholder: 'Ej. Apolo / Pajilla 45' },
  { name: 'razaToro', label: 'Raza Toro', type: 'text', placeholder: 'Ej. Brahman, Holstein' },
  { name: 'numeroServicios', label: 'Nº Servicios', type: 'number' },
  { name: 'tecnico', label: 'Técnico / Responsable', type: 'text', placeholder: 'Nombre del técnico' },
  { 
    name: 'estado', 
    label: 'Estado', 
    type: 'select', 
    options: [
      { label: 'Pendiente', value: 'Pendiente' },
      { label: 'Confirmada', value: 'Confirmada' },
      { label: 'Fallida', value: 'Fallida' },
      { label: 'Gestante', value: 'Gestante' }
    ] 
  },
  { name: 'fechaChequeo', label: 'Fecha Chequeo', type: 'date' },
  { name: 'fechaProbableParto', label: 'Fecha Probable Parto', type: 'date' },
  { name: 'fechaParto', label: 'Fecha Parto (Real)', type: 'date' },
  { name: 'fechaSecado', label: 'Fecha Secado', type: 'date' },
];