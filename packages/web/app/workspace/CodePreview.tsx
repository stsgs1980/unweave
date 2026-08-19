"use client";

/**
 * @file CodePreview component for displaying generated code.
 */

import React from "react";

/**
 * Props for the CodePreview component.
 * @property {string | null} componentName - The name of the selected component.
 */
interface CodePreviewProps {
  componentName: string | null;
}

/**
 * Renders a code preview panel.
 * @param {CodePreviewProps} props - The component props.
 * @returns The rendered code preview.
 */
export default function CodePreview({ componentName }: CodePreviewProps) {
  const codeBlockClass = [
    "mt-4 rounded-md bg-muted p-4 font-mono text-sm",
    "text-muted-foreground overflow-x-auto",
  ].join(" ");

  if (!componentName) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a component to view its code.</p>
      </div>
    );
  }

  // Мок сгенерированного кода
  const mockCode = `import React from 'react';

interface ${componentName}Props {
  children: React.ReactNode;
}

export const ${componentName} = ({ children }: ${componentName}Props) => {
  return (
    <div className="${componentName.toLowerCase()}-container">
      {children}
    </div>
  );
};
`;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{componentName}</h2>
      <pre className={codeBlockClass}>
        <code>{mockCode}</code>
      </pre>
    </div>
  );
}
