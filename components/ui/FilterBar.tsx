'use client';
import React from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  id: string;
  placeholder?: string;
  options?: FilterOption[]; // Si es un select
  type?: 'text' | 'select';
}

interface FilterBarProps {
  filters: FilterField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onReset?: () => void;
}

export default function FilterBar({ filters, values, onChange, onReset }: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-5 flex flex-wrap gap-3 items-center">
      {filters.map((filter) => {
        if (filter.type === 'select') {
          return (
            <select
              key={filter.id}
              value={values[filter.id] || ''}
              onChange={(e) => onChange(filter.id, e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">{filter.placeholder || 'Seleccionar...'}</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        return (
          <input
            key={filter.id}
            type="text"
            placeholder={filter.placeholder || 'Buscar...'}
            value={values[filter.id] || ''}
            onChange={(e) => onChange(filter.id, e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
          />
        );
      })}

      {onReset && (
        <button
          onClick={onReset}
          className="text-sm text-slate-500 hover:text-slate-700 underline px-2 py-1 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}