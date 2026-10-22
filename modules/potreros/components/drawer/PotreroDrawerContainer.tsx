'use client';

import React from 'react';
import { BovinoOption, Potrero } from '../../types/potrero.types';
import { ModoDrawer } from '../../hooks/usePotreros';
import { FormGanado } from './FormGanado';
import { FormAbono } from './FormAbono';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface PotreroDrawerContainerProps {
  isOpen: boolean;
  modo: ModoDrawer;
  potrero: Potrero | null;
  onClose: () => void;
  onSuccess: () => void;
  bovinosDisponibles?: BovinoOption[];
}

export const PotreroDrawerContainer: React.FC<PotreroDrawerContainerProps> = ({
  isOpen,
  modo,
  potrero,
  bovinosDisponibles = [],
  onClose,
  onSuccess,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-md !bg-white text-zinc-900 border-l border-zinc-200 shadow-2xl flex flex-col justify-between overflow-y-auto p-6">
        <div>
          {/* Cabecera limpia con Shadcn SheetHeader */}
          <SheetHeader className="pb-4 border-b border-zinc-200 text-left space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Gestión de Potrero
            </span>
            <SheetTitle className="text-base font-bold text-zinc-900">
              {modo === 'CREAR_POTRERO' && 'Crear Nuevo Potrero'}
              {modo === 'EDITAR_POTRERO' && 'Editar Potrero'}
              {modo === 'REGISTRAR_OCUPACION' && 'Movimiento de Ganado'}
              {modo === 'REGISTRAR_ABONO' && 'Registrar Abono / Mantenimiento'}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Panel lateral para la gestión de potreros y registros productivos.
            </SheetDescription>
          </SheetHeader>

          {/* Nombre del Potrero Seleccionado */}
          {potrero && (
            <div className="mt-4 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">Potrero:</span>
              <span className="text-xs font-bold text-zinc-900"> {potrero.nombre}</span>
            </div>
          )}

          {/* Formulario Renderizado Dinámicamente */}
          <div className="pt-4">
            {modo === 'REGISTRAR_OCUPACION' && potrero && (
              <FormGanado
                potrero={potrero}
                bovinosDisponibles={bovinosDisponibles}
                onSuccess={onSuccess}
              />
            )}

            {modo === 'REGISTRAR_ABONO' && potrero && (
              <FormAbono
                potrero={potrero}
                onSuccess={onSuccess}
              />
            )}
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
};