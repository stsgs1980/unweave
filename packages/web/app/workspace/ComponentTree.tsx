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

// Теги, которые мы не хотим видеть в списке, если у них нет CSS-классов
const GENERIC_TAGS = ["div", "span", "p", "ul", "li", "a", "br", "hr", "img", "svg", "path"];

/**
 * Renders a list of components.
 * @param {ComponentTreeProps} props - The component props.
 * @returns The rendered component tree.
 */
export default function ComponentTree({ components, onSelect }: ComponentTreeProps) {
  // Фильтруем "мусорные" узлы без классов
  const filteredComponents = components.filter((comp) => {
    const name = comp.name || comp.tagName || "";
    const className = comp.className || comp.attributes?.class;

    // Если это generic тег и у него нет класса, скрываем его
    if (GENERIC_TAGS.includes(name.toLowerCase()) && !className) {
      return false;
    }
    return true;
  });

  if (filteredComponents.length === 0) {
    return <div className="text-sm text-muted-foreground">No meaningful components found.</div>;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">
        Components ({filteredComponents.length})
      </h2>
      <ul className="space-y-1">
        {filteredComponents.map((comp, index) => {
          const name = comp.name || comp.tagName || `Component ${index + 1}`;
          // Если есть класс, показываем его рядом с тегом
          const className = comp.className || comp.attributes?.class;
          const displayName = className ? `${name} (.${String(className).split(" ")[0]})` : name;

          return (
            <li key={index}>
              <button
                onClick={() => onSelect(name)}
                className="w-full truncate rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title={displayName}
              >
                {displayName}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
