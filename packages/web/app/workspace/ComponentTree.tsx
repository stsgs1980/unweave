"use client";

/**
 * @file ComponentTree component for displaying and filtering extracted components.
 */

import React, { useState } from "react";
import {
  Search,
  Layers,
  Box,
  MousePointerClick,
  CreditCard,
  Compass,
  FormInput,
  Maximize2,
  Table,
  List,
  Heading,
  Image,
  Link2,
  X,
} from "lucide-react";

/**
 * Props for the ComponentTree component.
 */
interface ComponentTreeProps {
  components: any[];
  onSelect: (name: string) => void;
  selectedComponent?: string | null;
}

// Helper to determine appropriate icon based on component name / type
/**
 * Picks a lucide icon matching the component type or name.
 * @param {string} name - Display name of the component.
 * @param {string | undefined} type - Semantic component type.
 * @returns The icon component.
 */
function getComponentIcon(name: string, type?: string) {
  const norm = (type || name || "").toLowerCase();
  if (norm.includes("button") || norm.includes("btn")) return MousePointerClick;
  if (norm.includes("card") || norm.includes("tile")) return CreditCard;
  if (norm.includes("nav") || norm.includes("menu") || norm.includes("header")) return Compass;
  if (
    norm.includes("input") ||
    norm.includes("search") ||
    norm.includes("field") ||
    norm.includes("form")
  )
    return FormInput;
  if (norm.includes("modal") || norm.includes("dialog")) return Maximize2;
  if (norm.includes("table") || norm.includes("grid")) return Table;
  if (norm.includes("list") || norm.includes("ul") || norm.includes("ol")) return List;
  if (
    norm.includes("heading") ||
    norm.includes("h1") ||
    norm.includes("h2") ||
    norm.includes("title")
  )
    return Heading;
  if (norm.includes("image") || norm.includes("img") || norm.includes("pic")) return Image;
  if (norm.includes("link") || norm.includes("a")) return Link2;
  return Box;
}

// Real variant count produced by the analyzer (distinct style signatures)
/**
 * Returns the number of real visual variants detected by the analyzer.
 * @param comp - Analyzed component with optional variants array.
 * @returns Variant count (at least 1).
 */
function getVariantCount(comp: any): number {
  if (Array.isArray(comp.variants) && comp.variants.length > 0) return comp.variants.length;
  return 1;
}

// Tags that shouldn't clutter the list unless they have explicit class names
const GENERIC_TAGS = ["div", "span", "p", "ul", "li", "a", "br", "hr", "img", "svg", "path"];

/**
 * Renders a searchable list of components with icons and variant count badges.
 * @param root0 - Component props.
 * @param root0.components - Analyzed components from the extraction result.
 * @param root0.onSelect - Callback fired with the component name on click.
 * @param root0.selectedComponent - Currently selected component name.
 * @returns The rendered component tree.
 */
export default function ComponentTree({
  components,
  onSelect,
  selectedComponent,
}: ComponentTreeProps) {
  const [search, setSearch] = useState("");

  const filteredComponents = components.filter((comp) => {
    const name = comp.name || comp.tagName || "";
    const className = comp.className || comp.attributes?.class;

    if (GENERIC_TAGS.includes(name.toLowerCase()) && !className) {
      return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchesName = name.toLowerCase().includes(q);
    const matchesClass = className && String(className).toLowerCase().includes(q);
    return matchesName || matchesClass;
  });

  return (
    <div className="flex h-full flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Layers className="h-4 w-4" />
          Components
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {filteredComponents.length}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search component..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-8 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {filteredComponents.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No components match your search.
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredComponents.map((comp, index) => {
              const name = comp.name || comp.tagName || `Component ${index + 1}`;
              const className = comp.className || comp.attributes?.class;
              const isSelected = selectedComponent === name;
              const Icon = getComponentIcon(name, comp.type);
              const variantCount = getVariantCount(comp);

              return (
                <li key={index}>
                  <button
                    onClick={() => onSelect(name)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-foreground hover:bg-accent/70 hover:text-accent-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 truncate">
                        <div className="truncate font-semibold">{name}</div>
                        <div
                          className={`truncate text-[10px] ${
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {variantCount} variant{variantCount > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {className && (
                      <span
                        className={`truncate max-w-[70px] text-[10px] font-mono ${
                          isSelected ? "text-primary-foreground/70" : "text-muted-foreground/60"
                        }`}
                      >
                        .{String(className).split(" ")[0]}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
