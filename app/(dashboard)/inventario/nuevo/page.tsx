// Archivo: src/app/(dashboard)/inventario/nuevo/page.tsx
'use client';

import { registrarBovino } from './actions';
import { Save, PlusCircle, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react'; // 1. Importamos useRef
import { useFormStatus } from 'react-dom';
import toast, { Toaster } from 'react-hot-toast';

// Componente auxiliar para el botón de guardar
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md shadow-green-100 font-semibold transition-all text-sm disabled:bg-green-400 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Guardar Bovino
        </>
      )}
    </button>
  );
}

export default function NuevoBovinoPage() {
  // Estado para errores globales ajenos a la validación de Zod/Supabase
  const [formError, setFormError] = useState<string | null>(null);
  
  // 2. Creamos una referencia para el elemento formulario
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    setFormError(null);
    
    // Llamamos a la acción del servidor
    const result = await registrarBovino(formData);
    
    if (result?.error) {
      // Manejo de error
      setFormError(result.error);
      toast.error(result.error);
    } else if (result?.success) {
      // 3. ÉXITO: Limpiamos el formulario usando la referencia
      formRef.current?.reset();
      
      // Mostramos notificación de éxito
      toast.success('¡Bovino registrado correctamente!', {
        duration: 4000, 
        position: 'top-right', 
      });
      // Al no llamar a redirect(), el usuario se queda aquí.
      // Opcional: Enfocar el primer input de nuevo
      formRef.current?.arete.focus(); 
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans text-gray-900">
      <Toaster />

      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Registrar Nuevo Bovino
            </h1>
            <p className="mt-1 text-base text-gray-600">
              Complete la información del nuevo animal para el sistema de trazabilidad.
            </p>
          </div>
        </header>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium text-sm">
            {formError}
          </div>
        )}

        {/* 4. Asignamos la referencia y usamos nuestra action cliente */}
        <form ref={formRef} action={clientAction} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- Sección 1: Identificación --- */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-800 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                Identificación
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="arete" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Número de Arete <span className="text-red-500">*</span>
                  </label>
                  <input type="text" id="arete" name="arete" required placeholder="Ej. 001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm" />
                </div>
                <div>
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Nombre o Alias (Opcional)
                  </label>
                  <input type="text" id="nombre" name="nombre" placeholder="Ej. La Vaca Loca"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm" />
                </div>
              </div>
            </section>

            {/* --- Sección 2: Características Biológicas --- */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-800 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                Datos Biológicos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="raza" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Raza <span className="text-red-500">*</span>
                  </label>
                  <input type="text" id="raza" name="raza" required placeholder="Ej. Brahman"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm" />
                </div>
                <div>
                  <label htmlFor="genero" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Género <span className="text-red-500">*</span>
                  </label>
                  <select id="genero" name="genero" required defaultValue="Hembra"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm bg-white appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}>
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="peso_inicial" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Peso Inicial (kg) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" id="peso_inicial" step="0.01" name="peso_inicial" required placeholder="Ej. 150"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="fecha_nacimiento" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Fecha de Nacimiento (Opcional)
                  </label>
                  <input type="date" id="fecha_nacimiento" name="fecha_nacimiento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm" />
                </div>
              </div>
            </section>

            {/* --- Sección 3: Estado --- */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-800 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                Estado y Notas
              </h2>
              <div className="flex-grow space-y-4 flex flex-col">
                <div>
                  <label htmlFor="estado" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Estado Productivo <span className="text-red-500">*</span>
                  </label>
                  <select id="estado" name="estado" required defaultValue="En producción"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm bg-white appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}>
                    <option value="Ternera en lactancia">Ternera en lactancia</option>
                    <option value="Destete">Destete</option>
                    <option value="Ternera en crecimiento">Ternera en crecimiento</option>
                    <option value="Levante">Levante</option>
                    <option value="Novilla en desarrollo">Novilla en desarrollo</option>
                    <option value="Novilla de vientre">Novilla de vientre</option>
                    <option value="En producción">En producción</option>
                    <option value="Seca">Seca</option>
   
                    
                  </select>
                </div>
                <div className="flex-grow flex flex-col">
                  <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-900 mb-0.5">
                    Observaciones (Opcional)
                  </label>
                  <textarea id="observaciones" name="observaciones" rows={0} placeholder="Ej. Animal dócil..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm resize-none flex-grow" />
                </div>
              </div>
            </section>

          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-3 pt-4 border-t border-gray-200 mt-6">
            <a href="/inventario" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 font-semibold transition-colors text-sm">
              Ir al Inventario
            </a>
            <SubmitButton />
          </div>

        </form>
      </div>
    </div>
  );
}