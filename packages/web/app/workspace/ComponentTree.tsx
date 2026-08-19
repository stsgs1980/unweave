"use client";

/**
 * @file ComponentTree component for displaying extracted components.
 */

import React from "react";

/**
 * Props for the ComponentTree component.
 * @property {any[]} components - List of extracted components.
 * @property {(name: string) => void} onSelect - Callback when a component is selected.
 */
interface ComponentTreeProps {
  components: any[];
  onSelect: (name: string) => void;
}

/**
 * Renders a list of components.
 * @param {ComponentTreeProps} props - The component props.
 * @returns The rendered component tree.
 */
export default function ComponentTree({ components, onSelect }: ComponentTreeProps) {
  // Добавлена проверка на !components, чтобы избежать ошибки undefined
  if (!components || components.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No components found in extraction results.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">Components ({components.length})</h2>
      <ul className="space-y-1">
        {components.map((comp, index) => {
          // Ядро может возвращать разные структуры, берем name или tagName
          const name = comp.name || comp.tagName || `Component ${index + 1}`;
          return (
            <li key={index}>
              <button
                onClick={() => onSelect(name)}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
