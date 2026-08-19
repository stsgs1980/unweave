"use client";

/**
 * @file ExtractInput component for entering URLs to analyze.
 */

import React, { useState } from "react";

/**
 * Renders a form with a URL input and a submit button.
 * @returns The rendered input form.
 */
export default function ExtractInput() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "[FAIL] Failed to start extraction");
        return;
      }

      console.log("[OK] Extraction initiated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Разбиваем длинные строки классов, чтобы уложиться в 100 символов
  const inputClass = [
    "flex-1 rounded-md border border-border bg-background",
    "px-4 py-2 placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring",
    "disabled:opacity-50",
  ].join(" ");

  const buttonClass = [
    "rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground",
    "transition-colors hover:bg-primary/90 disabled:opacity-50",
  ].join(" ");

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Enter website URL to extract..."
          className={inputClass}
          required
          disabled={isLoading}
        />
        <button type="submit" className={buttonClass} disabled={isLoading}>
          {isLoading ? "Extracting..." : "Extract UI"}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-sm text-muted-foreground">
        Enter the URL of the site you want to analyze and extract components from.
      </p>
    </form>
  );
}
