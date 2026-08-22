"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Props for the StatsCard component.
 * @property {string} title - The title of the metric.
 * @property {string | number} value - The main value to display.
 * @property {string} [description] - Optional descriptive text below the value.
 * @property {number[]} [data] - Optional data for the sparkline.
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  data?: number[];
}

/**
 * Inline SVG sparkline - no external dependencies.
 * @param {number[]} data - Array of data points
 * @param {string} color - Stroke color (default: indigo)
 * @returns JSX.Element
 */
function Sparkline({ data, color = "rgb(99 102 241)" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80; // 20 * 4 = 80 (w-20 = 80px)
  const height = 32; // 8 * 4 = 32 (h-8 = 32px)
  const padding = 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-20 h-8">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={`M${padding},${height - padding} L${points} L${width - padding},${height - padding} Z`}
        fill="url(#sparkline-gradient)"
      />
      {/* Stroke line */}
      <path
        d={`M${padding},${height - padding} L${points}`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Renders a single statistics card with an optional sparkline.
 * @param {StatsCardProps} props - The component props.
 * @returns The rendered stats card.
 */
export default function StatsCard({ title, value, description, data }: StatsCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {data && (
          <div className="h-8 w-20">
            <Sparkline data={data} color="rgb(99 102 241)" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
