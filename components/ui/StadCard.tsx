// components/ui/StatCard.tsx
import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

export default function StatCard({ label, value, icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4">
      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}