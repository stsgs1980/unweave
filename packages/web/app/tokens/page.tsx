/**
 * @file Tokens page for viewing extracted design tokens.
 */

import React, { Suspense } from "react";
import TokensView from "./TokensView";

/**
 * Renders the Tokens page layout.
 * @returns The tokens page.
 */
export default function TokensPage() {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Design Tokens</h1>
        <p className="text-muted-foreground">Visual representation of extracted design system.</p>
      </header>

      <section className="flex flex-1 flex-col gap-4">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
          <TokensView />
        </Suspense>
      </section>
    </main>
  );
}
