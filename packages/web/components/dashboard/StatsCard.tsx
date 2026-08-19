"use client";

import React from "react";
import { AreaChart } from "@tremor/react";

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
 * Renders a single statistics card with an optional sparkline.
 * @param {StatsCardProps} props - The component props.
 * @returns The rendered stats card.
 */
export default function StatsCard({ title, value, description, data }: StatsCardProps) {
  // Форматируем данные для AreaChart (массив объектов)
  const chartData = data ? data.map((val, i) => ({ index: i, value: val })) : [];

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {data && (
          <div className="h-8 w-20 text-primary">
            <AreaChart
              data={chartData}
              index="index"
              categories={["value"]}
              colors={["indigo"]}
              showXAxis={false}
              showYAxis={false}
              showLegend={false}
              showGridLines={false}
              className="h-8 w-20"
            />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
