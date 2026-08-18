'use client';

import React, { useEffect, useState } from 'react';
import { Potrero } from '../schemas';
import {
  Trash2,
  Edit3,
  PlusCircle,
  Maximize2,
  Sprout,
  X,
  Loader2,
} from 'lucide-react';

interface EditarPotreroModalProps {
  potrero: Potrero | null;
  isOpen: boolean;
  onClose: () => void;

  onSave: (datos: {
    nombre: string;
    area_m2?: number;
    tipo_pasto?: string;
  }) => Promise<void>;

  onDelete?: () => Promise<void>;
}

export default function EditarPotreroModal({
  potrero,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditarPotreroModalProps) {
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState('');
  const [tipoPasto, setTipoPasto] = useState('');

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /*
   * ============================================================
   * CARGAR DATOS DEL POTRERO
   * ============================================================
   */

  useEffect(() => {
    if (potrero) {
      setNombre(potrero.nombre || '');

      setArea(
        potrero.area_m2 !== undefined &&
          potrero.area_m2 !== null
          ? potrero.area_m2.toString()
          : ''
      );

      setTipoPasto(potrero.tipo_pasto || '');
    } else {
      setNombre('');
      setArea('');
      setTipoPasto('');
    }
  }, [potrero]);

  /*
   * Si el modal está cerrado no renderizamos nada.
   */

  if (!isOpen) {
    return null;
  }

  /*
   * ============================================================
   * GUARDAR CAMBIOS
   * ============================================================
   */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!potrero) {
      return;
    }

    /*
     * Validar nombre
     */

    if (!nombre.trim()) {
      alert('El nombre del potrero es obligatorio.');
      return;
    }

    /*
     * Validar área
     */

    if (area.trim() !== '') {
      const areaNumerica = Number(area);

      if (
        !Number.isFinite(areaNumerica) ||
        areaNumerica <= 0
      ) {
        alert('El área debe ser un número mayor que 0.');
        return;
      }
    }

    setLoading(true);

    try {
      await onSave({
        nombre: nombre.trim(),

        area_m2:
          area.trim() !== ''
            ? Number(area)
            : undefined,

        tipo_pasto:
          tipoPasto.trim() !== ''
            ? tipoPasto.trim()
            : undefined,
      });

      onClose();
    } catch (error) {
      console.error(
        'Error al guardar el potrero:',
        error
      );

      alert(
        'No se pudieron guardar los cambios del potrero.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * ELIMINAR POTRERO
   * ============================================================
   */

  const handleDelete = async () => {
    if (!onDelete || !potrero) {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar el potrero "${potrero.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    setDeleting(true);

    try {
      await onDelete();

      onClose();
    } catch (error) {
      console.error(
        'Error al eliminar el potrero:',
        error
      );

      alert(
        'No se pudo eliminar el potrero.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const isEditing = Boolean(potrero);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-900/60
        backdrop-blur-sm
        p-4
      "
    >
      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          max-w-lg
          w-full
          max-h-[90vh]
          flex
          flex-col
          overflow-hidden
          border
          border-slate-100
        "
      >

        {/* ===================================================== */}
        {/* CABECERA */}
        {/* ===================================================== */}

        <div
          className="
            bg-slate-50
            px-6
            py-4
            border-b
            border-slate-200/60
            flex
            justify-between
            items-center
            shrink-0
          "
        >
          <div className="flex items-center gap-3">

            <div
              className={`
                p-2
                rounded-xl
                text-white
                shadow-sm
                ${
                  isEditing
                    ? 'bg-emerald-600 shadow-emerald-600/20'
                    : 'bg-blue-600 shadow-blue-600/20'
                }
              `}
            >
              {isEditing ? (
                <Edit3 size={18} />
              ) : (
                <PlusCircle size={18} />
              )}
            </div>

            <div>
              <h3
                className="
                  font-extrabold
                  text-slate-800
                  text-sm
                  uppercase
                  tracking-wider
                "
              >
                {isEditing
                  ? `Editar Potrero: ${potrero?.nombre}`
                  : 'Registrar Nuevo Potrero'}
              </h3>

              <p
                className="
                  text-[11px]
                  text-slate-500
                  mt-0.5
                "
              >
                {isEditing
                  ? 'Actualiza la información básica del potrero'
                  : 'Registra la información básica del potrero'}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading || deleting}
            className="
              text-slate-400
              hover:text-slate-700
              bg-white
              border
              border-slate-200
              hover:bg-slate-100
              p-2
              rounded-xl
              transition-all
              disabled:opacity-50
            "
          >
            <X size={16} />
          </button>

        </div>

        {/* ===================================================== */}
        {/* FORMULARIO */}
        {/* ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            p-6
            space-y-5
            overflow-y-auto
            flex-1
          "
        >

          {/* ================================================= */}
          {/* NOMBRE */}
          {/* ================================================= */}

          <div className="space-y-1.5">

            <label
              className="
                block
                text-xs
                font-bold
                text-slate-700
                flex
                items-center
                gap-1.5
              "
            >
              <Edit3
                size={14}
                className="text-emerald-600"
              />

              Nombre del Potrero *
            </label>

            <input
              type="text"
              placeholder="Ej. Potrero La Loma"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              required
              disabled={loading || deleting}
              className="
                w-full
                bg-slate-50/50
                border
                border-slate-200
                rounded-xl
                px-3.5
                py-2.5
                text-xs
                font-semibold
                text-slate-800
                shadow-sm
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-500/20
                focus:border-emerald-600
                transition-all
                disabled:opacity-50
              "
            />

          </div>

          {/* ================================================= */}
          {/* ÁREA */}
          {/* ================================================= */}

          <div className="space-y-1.5">

            <label
              className="
                block
                text-xs
                font-bold
                text-slate-700
                flex
                items-center
                gap-1.5
              "
            >
              <Maximize2
                size={14}
                className="text-emerald-600"
              />

              Área del Potrero (m²)
            </label>

            <input
              type="number"
              step="any"
              min="0"
              placeholder="Ej. 2500"
              value={area}
              onChange={(e) =>
                setArea(e.target.value)
              }
              disabled={loading || deleting}
              className="
                w-full
                bg-slate-50/50
                border
                border-slate-200
                rounded-xl
                px-3.5
                py-2.5
                text-xs
                font-semibold
                text-slate-800
                shadow-sm
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-500/20
                focus:border-emerald-600
                transition-all
                disabled:opacity-50
              "
            />

            <p className="
              text-[10px]
              text-slate-400
            ">
              Ingresa el área total disponible para el potrero.
            </p>

          </div>

          {/* ================================================= */}
          {/* TIPO DE PASTO */}
          {/* ================================================= */}

          <div className="space-y-1.5">

            <label
              className="
                block
                text-xs
                font-bold
                text-slate-700
                flex
                items-center
                gap-1.5
              "
            >
              <Sprout
                size={14}
                className="text-emerald-600"
              />

              Tipo de Pasto
            </label>

            <input
              type="text"
              placeholder="Ej. Brachiaria, Kikuyo..."
              value={tipoPasto}
              onChange={(e) =>
                setTipoPasto(e.target.value)
              }
              disabled={loading || deleting}
              className="
                w-full
                bg-slate-50/50
                border
                border-slate-200
                rounded-xl
                px-3.5
                py-2.5
                text-xs
                font-semibold
                text-slate-800
                shadow-sm
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-500/20
                focus:border-emerald-600
                transition-all
                disabled:opacity-50
              "
            />

            <p className="
              text-[10px]
              text-slate-400
            ">
              Ejemplo: Brachiaria, Kikuyo, Estrella,
              Guinea, etc.
            </p>

          </div>

          {/* ================================================= */}
          {/* INFORMACIÓN */}
          {/* ================================================= */}

          <div
            className="
              flex
              gap-3
              p-3.5
              rounded-xl
              bg-slate-50
              border
              border-slate-200
            "
          >
            <div
              className="
                w-8
                h-8
                rounded-lg
                bg-emerald-100
                text-emerald-700
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Sprout size={16} />
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-slate-700
                "
              >
                Gestión independiente
              </p>

              <p
                className="
                  text-[10px]
                  text-slate-500
                  mt-0.5
                  leading-relaxed
                "
              >
                El crecimiento del pasto, el estado,
                el aforo y el control del ganado se
                administran desde sus respectivos
                módulos.
              </p>
            </div>

          </div>

          {/* ================================================= */}
          {/* BOTONES */}
          {/* ================================================= */}

          <div
            className="
              flex
              justify-between
              items-center
              pt-4
              border-t
              border-slate-100
            "
          >

            {/* ELIMINAR */}

            {potrero && onDelete ? (

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3.5
                  py-2.5
                  text-xs
                  font-bold
                  text-red-600
                  bg-red-50
                  hover:bg-red-100
                  rounded-xl
                  transition-colors
                  disabled:opacity-50
                "
              >
                {deleting ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={15} />
                )}

                <span>
                  {deleting
                    ? 'Eliminando...'
                    : 'Eliminar Potrero'}
                </span>

              </button>

            ) : (
              <div />
            )}

            {/* ACCIONES */}

            <div
              className="
                flex
                gap-2.5
                ml-auto
              "
            >

              <button
                type="button"
                onClick={onClose}
                disabled={loading || deleting}
                className="
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-slate-600
                  bg-slate-100
                  hover:bg-slate-200
                  rounded-xl
                  transition-all
                  disabled:opacity-50
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || deleting}
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  text-xs
                  font-bold
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  rounded-xl
                  shadow-md
                  shadow-emerald-600/20
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}

              </button>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
}