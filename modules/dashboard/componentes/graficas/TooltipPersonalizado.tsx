import React from "react";

export default function TooltipPersonalizado({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121816] border border-emerald-500/30 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-white">{payload[0].value} Lts</p>
        <p className="text-gray-400">{label}</p>
      </div>
    );
  }
  return null;
}