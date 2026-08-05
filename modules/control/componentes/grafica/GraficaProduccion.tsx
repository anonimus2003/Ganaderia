"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import TooltipPersonalizado from "./TooltipPersonalizado";

interface GraficaProduccionProps {
  data: any[];
}

export default function GraficaProduccion({
  data,
}: GraficaProduccionProps) {
  return (
    <div className="w-full h-[320px] rounded-2xl bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 15,
            left: -15,
            bottom: 5,
          }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="fecha"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "#6B7280",
              fontSize: 12,
            }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "#6B7280",
              fontSize: 12,
            }}
          />

          <Tooltip
            cursor={{
              stroke: "#10B981",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            content={<TooltipPersonalizado />}
          />

          <Line
            type="natural"
            dataKey="litros"
            stroke="#10B981"
            strokeWidth={3.5}
            dot={false}
            activeDot={{
              r: 6,
              fill: "#10B981",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}