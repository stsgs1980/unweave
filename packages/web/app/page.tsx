/**
 * @file Main entry point for the web application dashboard.
 * @description Renders the initial dashboard layout matching the UI reference.
 */

import React from "react";
import ExtractInput from "@/components/dashboard/ExtractInput";

/**
 * Handles the URL submission event.
 * @param url - The URL submitted by the user.
 * @returns No return value.
 */
const handleExtractSubmit = (url: string): void => {
  // [TODO] Connect to Core via API routes (Priority #4)
  console.log("Extracting URL:", url);
};

/**
 * Dashboard component representing the main landing page.
 * @returns The rendered dashboard page.
 */
export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to unweave web interface.</p>
      </header>

      <section className="flex flex-1 flex-col gap-8">
        {/* Hero extract input */}
        <div className="rounded-lg border border-border p-6">
          <ExtractInput onSubmit={handleExtractSubmit} />
        </div>

        {/* [TODO] Implement stats cards with sparklines */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm">Stats</p>
          </div>
        </div>

        {/* [TODO] Implement recent projects grid */}
        <div className="flex-1 rounded-lg border border-border p-4">
          <p className="text-sm">Recent Projects</p>
        </div>
      </section>
    </main>
  );
}
