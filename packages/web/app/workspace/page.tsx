"use client";

/**
 * @file Workspace page for viewing extraction results.
 */

import React, { useState } from "react";
import ComponentTree from "./ComponentTree";
import CodePreview from "./CodePreview";

/**
 * Renders the split-view workspace layout.
 * @returns The workspace page.
 */
export default function WorkspacePage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  return (
    <main className="flex h-screen flex-col">
      <header className="border-b border-border p-4">
        <h1 className="text-xl font-bold text-foreground">Workspace</h1>
        <p className="text-sm text-muted-foreground">Extraction Results</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Component Tree */}
        <aside className="w-1/3 border-r border-border overflow-y-auto p-4">
          <ComponentTree onSelect={setSelectedComponent} />
        </aside>

        {/* Right Panel: Code Preview */}
        <section className="flex-1 overflow-y-auto p-4">
          <CodePreview componentName={selectedComponent} />
        </section>
      </div>
    </main>
  );
}
