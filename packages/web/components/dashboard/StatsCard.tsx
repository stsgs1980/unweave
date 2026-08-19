/**
 * @file StatsCard component for displaying dashboard metrics.
 */

import React from "react";

/**
 * Props for the StatsCard component.
 * @property {string} title - The title of the metric.
 * @property {string | number} value - The main value to display.
 * @property {string} [description] - Optional descriptive text below the value.
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
}

/**
 * Renders a single statistics card with a placeholder for a sparkline.
 * @param {StatsCardProps} props - The component props.
 * @returns {React.JSX.Element} The rendered stats card.
 */
export default function StatsCard({
  title,
  value,
  description,
}: StatsCardProps): React.JSX.Element {
  const cardClass = [
    "flex flex-col gap-2 rounded-lg border border-border bg-card",
    "p-4 text-card-foreground",
  ].join(" ");

  const headerClass = "flex items-center justify-between";

  const titleClass = "text-sm font-medium text-muted-foreground";

  const sparklineClass = "h-8 w-16 rounded-sm bg-muted/50";

  return (
    <div className={cardClass}>
      <div className={headerClass}>
        <h3 className={titleClass}>{title}</h3>
        {/* [TODO] Replace with actual Sparkline component later */}
        <div className={sparklineClass} aria-hidden="true" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
