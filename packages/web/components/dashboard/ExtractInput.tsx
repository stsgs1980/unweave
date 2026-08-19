/**
 * @file ExtractInput component for entering URLs to analyze.
 */

import React, { useState } from "react";

/**
 * Props for the ExtractInput component.
 * @property {(url: string) => void} onSubmit - Callback triggered when a URL is submitted.
 */
interface ExtractInputProps {
  onSubmit: (url: string) => void;
}

/**
 * Renders a form with a URL input and a submit button.
 * @param {ExtractInputProps} props - The component props.
 * @returns {React.JSX.Element} The rendered input form.
 */
export default function ExtractInput({ onSubmit }: ExtractInputProps) {
  const [url, setUrl] = useState("");

  // Разбиваем длинные строки классов, чтобы уложиться в 100 символов
  const inputClass = [
    "flex-1 rounded-md border border-border bg-background",
    "px-4 py-2 placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring",
  ].join(" ");

  const buttonClass = [
    "rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground",
    "transition-colors hover:bg-primary/90 disabled:opacity-50",
  ].join(" ");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (url.trim()) {
          onSubmit(url.trim());
        }
      }}
      className="w-full space-y-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Enter website URL to extract..."
          className={inputClass}
          required
        />
        <button type="submit" className={buttonClass}>
          Extract UI
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Enter the URL of the site you want to analyze and extract components from.
      </p>
    </form>
  );
}
