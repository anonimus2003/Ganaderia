"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

// Utilidad para unir clases de Tailwind si usas clsx/tailwind-merge
import { cn } from "@/lib/utils" 

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, { label: string; color?: string }>
  }
>(({ className, config, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={
        {
          ...Object.entries(config).reduce((acc, [key, value]) => {
            if (value.color) {
              acc[`--color-${key}`] = value.color
            }
            return acc
          }, {} as Record<string, string>),
        } as React.CSSProperties
      }
      className={cn("w-full h-[300px]", className)}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

export { ChartContainer, ChartTooltip }