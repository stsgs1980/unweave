/**
 * @file References page for viewing saved extraction references.
 */

import React, { Suspense } from "react";
import ReferencesGrid from "./ReferencesGrid";

/**
 * Renders the References page layout.
 * @returns The references page.
 */
export default function ReferencesPage() {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">References</h1>
        <p className="text-muted-foreground">Saved design system extractions.</p>
      </header>

      <section className="flex flex-1 flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">Saved Catalog</h2>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
          <ReferencesGrid />
        </Suspense>
      </section>
    </main>
  );
}
