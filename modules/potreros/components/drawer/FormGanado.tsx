'use client';

import React, { useState, useEffect } from 'react';
import { Potrero, BovinoOption } from '@/modules/potreros/types/potrero.types';
import { registrarIngresoGanado, registrarSalidaGanado } from '@/modules/potreros/actions/potreros.actions';

interface FormGanadoProps {
  potrero: Potrero;
  bovinosDisponibles: BovinoOption[];
  onSuccess: () => void;
}

export const FormGanado: React.FC<FormGanadoProps> = ({
  potrero,
  bovinosDisponibles,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Evaluación flexible de ocupación
  const p = potrero as any;
  const estadoNormalizado = String(p?.estado || p?.estatus || '').toLowerCase();
  const animalesActualesCount = p?.animales_actuales || p?.bovinos_actuales || p?.cantidad_bovinos || 0;
  
  const estaOcupado = estadoNormalizado === 'ocupado' || animalesActualesCount > 0;

  // Estados del formulario
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
  const [aforo, setAforo] = useState<string>('');
  const [animalesSeleccionados, setAnimalesSeleccionados] = useState<string[]>([]);

  // Preselección automática si está ocupado
  useEffect(() => {
    if (estaOcupado && bovinosDisponibles.length > 0) {
      const todosLosIds = bovinosDisponibles.map((b) => String(b.id));
      setAnimalesSeleccionados(todosLosIds);
    } else if (!estaOcupado) {
      setAnimalesSeleccionados([]);
    }
  }, [estaOcupado, bovinosDisponibles]);

  const handleCheckboxChange = (id: string) => {
    if (estaOcupado) return;

    setAnimalesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!estaOcupado) {
        // Modo Ingreso
        await registrarIngresoGanado({
          potreroId: potrero.id,
          animalesIds: animalesSeleccionados,
          fecha,
          aforo: aforo ? parseFloat(aforo) : undefined,
          cantidad: animalesSeleccionados.length || 1,
          tipoAnimal: 'Vaca',
        });
      } else {
        // Modo Salida Masiva
        await registrarSalidaGanado({
          potreroId: potrero.id,
          animalesIds: animalesSeleccionados,
          fecha,
          cantidad: animalesSeleccionados.length || bovinosDisponibles.length || 1,
          tipoAnimal: 'Vaca',
        });
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-1 rounded-xl">
      
      {errorMsg && (
        <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* FECHA Y HORA DE MOVIMIENTO */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1.5">
          Fecha y Hora del Movimiento
        </label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="w-full text-xs p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 transition-all font-medium"
        />
      </div>

      {/* AFORO (Solo en potrero vacío) */}
      {!estaOcupado && (
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5">
            Aforo Inicial (kg/m² - Opcional)
          </label>
          <input
            type="number"
            step="0.01"
            value={aforo}
            placeholder="Ej: 1.5"
            onChange={(e) => setAforo(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-400 font-medium"
          />
        </div>
      )}

      {/* LISTADO DE ANIMALES EN CONTENEDOR BLANCO LIMPIO */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-bold text-zinc-700">
            {!estaOcupado ? 'Seleccionar animales que ingresan' : 'Animales a retirar de este potrero'}
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            {animalesSeleccionados.length} 
          </span>
        </div>

        <div className="max-h-52 overflow-y-auto border border-zinc-200 rounded-xl p-2 space-y-1 bg-white shadow-2xs">
          {bovinosDisponibles.length === 0 ? (
            <p className="text-xs text-zinc-400 italic text-center py-6">
              {!estaOcupado ? 'No hay bovinos disponibles en la finca' : 'No hay animales registrados actualmente en este potrero'}
            </p>
          ) : (
            bovinosDisponibles.map((b) => (
              <label 
                key={b.id} 
                className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                  estaOcupado 
                    ? 'bg-zinc-50 border border-zinc-100 text-zinc-500 cursor-not-allowed' 
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100 cursor-pointer text-zinc-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={animalesSeleccionados.includes(String(b.id))}
                  disabled={estaOcupado}
                  onChange={() => handleCheckboxChange(String(b.id))}
                  className="rounded border-zinc-300 w-4 h-4 text-zinc-900 focus:ring-zinc-400 accent-zinc-900 cursor-pointer"
                />
                <span className="font-medium text-zinc-900">{b.nombre}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* BOTÓN DE CONFIRMACIÓN */}
      <button
        type="submit"
        disabled={loading || animalesSeleccionados.length === 0}
        className={`w-full py-3 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
          !estaOcupado
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-zinc-100 disabled:text-zinc-400'
            : 'bg-zinc-900 hover:bg-zinc-800 text-white disabled:bg-zinc-100 disabled:text-zinc-400'
        } disabled:cursor-not-allowed`}
      >
        {loading 
          ? 'Procesando...' 
          : !estaOcupado 
            ? `Confirmar Ingreso` 
            : `Confirmar Salida de Todos`
        }
      </button>

    </form>
  );
};