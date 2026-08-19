"use client";

/**
 * @file ComponentTree component for displaying extracted components.
 */

import React from "react";

/**
 * Props for the ComponentTree component.
 * @property {(name: string) => void} onSelect - Callback when a component is selected.
 */
interface ComponentTreeProps {
  onSelect: (name: string) => void;
}

// Моковые данные. В будущем они будут приходить из API /api/results
const mockComponents = [
  { id: "1", name: "Header", type: "layout" },
  { id: "2", name: "Button", type: "ui" },
  { id: "3", name: "Card", type: "ui" },
  { id: "4", name: "Footer", type: "layout" },
];

/**
 * Renders a list of components.
 * @param {ComponentTreeProps} props - The component props.
 * @returns The rendered component tree.
 */
export default function ComponentTree({ onSelect }: ComponentTreeProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">Components</h2>
      <ul className="space-y-1">
        {mockComponents.map((comp) => (
          <li key={comp.id}>
            <button
              onClick={() => onSelect(comp.name)}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {comp.name} <span className="text-xs opacity-50">({comp.type})</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
