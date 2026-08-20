"use client";

import React from "react";
import { AreaChart } from "@tremor/react";
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
 * Renders a single statistics card with an optional sparkline.
 * @param {StatsCardProps} props - The component props.
 * @returns The rendered stats card.
 */
export default function StatsCard({ title, value, description, data }: StatsCardProps) {
  // Format data for AreaChart (array of objects)
  const chartData = data ? data.map((val, i) => ({ index: i, value: val })) : [];

  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {data && (
          <div className="h-8 w-20">
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
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
