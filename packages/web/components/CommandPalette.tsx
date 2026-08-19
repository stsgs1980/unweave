"use client";

/**
 * @file CommandPalette component for quick actions and navigation.
 */

import React, { useEffect } from "react";
import { Command } from "cmdk";
import { useUIStore } from "@/store/ui-store";

/**
 * CommandPalette component that listens for Ctrl/Cmd+K.
 * @returns The rendered command palette dialog.
 */
export default function CommandPalette() {
  const isCommandPaletteOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const overlayClass = [
    "fixed inset-0 z-50 flex items-start justify-center",
    "bg-black/50 pt-[20vh]",
  ].join(" ");

  const dialogClass = [
    "w-full max-w-xl rounded-lg border border-border bg-card",
    "shadow-lg overflow-hidden",
  ].join(" ");

  const inputClass = [
    "w-full border-0 bg-transparent px-4 py-4 text-foreground",
    "outline-none placeholder:text-muted-foreground",
  ].join(" ");

  const listClass = "max-h-[40vh] overflow-y-auto p-2";

  const itemClass = [
    "cursor-pointer rounded-md p-2 text-sm text-foreground",
    "aria-selected:bg-accent aria-selected:text-accent-foreground",
  ].join(" ");

  return (
    <div className={overlayClass}>
      <Command
        className={dialogClass}
        onKeyDown={(e) => {
          if (e.key === "Escape") setCommandPaletteOpen(false);
        }}
      >
        <Command.Input autoFocus placeholder="Type a command or search..." className={inputClass} />
        <Command.List className={listClass}>
          <Command.Empty className="p-4 text-sm text-muted-foreground">
            No results found.
          </Command.Empty>
          <Command.Group heading="Actions" className="text-xs text-muted-foreground px-2 pt-2">
            <Command.Item className={itemClass}>Run Extraction Pipeline</Command.Item>
            <Command.Item className={itemClass}>View Recent Projects</Command.Item>
          </Command.Group>
          <Command.Group heading="Settings" className="text-xs text-muted-foreground px-2 pt-2">
            <Command.Item className={itemClass}>Toggle Theme</Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
