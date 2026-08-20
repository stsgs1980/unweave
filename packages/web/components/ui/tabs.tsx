"use client";

/**
 * @file Tabs component using react-aria-components.
 * Provides accessible tab interface with keyboard navigation.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  TabList as TabListPrimitive,
  TabPanel as TabPanelPrimitive,
  Tab as TabPrimitive,
  Tabs as TabsPrimitive,
} from "react-aria-components";

import { cn } from "@/lib/utils";

/**
 * Root Tabs component wrapper.
 * @param props - Component props forwarded to react-aria-components Tabs.
 * @param props.className - Optional CSS class name.
 * @returns Tabs component.
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive>) {
  return (
    <TabsPrimitive
      data-slot="tabs"
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

/**
 * Variant configuration for TabsList.
 * @type {cva.Config}
 */
const tabsListVariants = cva(
  [
    "group/tabs-list inline-flex w-fit items-center justify-center",
    "rounded-lg p-[3px] text-muted-foreground",
    "group-data-horizontal/tabs:h-8",
    "group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
    "data-[variant=line]:rounded-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * TabsList component - container for tab triggers.
 * @param props - Component props including variant.
 * @param props.className - Optional CSS class name.
 * @param props.variant - Visual variant ("default" | "line").
 * @returns TabsList component.
 */
function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabListPrimitive> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabListPrimitive
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * TabsTrigger component - individual tab button.
 * @param props - Component props.
 * @param props.className - Optional CSS class name.
 * @returns Tab trigger component.
 */
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabPrimitive>) {
  return (
    <TabPrimitive
      data-slot="tabs-trigger"
      className={cn(
        [
          "relative inline-flex h-[calc(100%-1px)] flex-1 cursor-default",
          "items-center justify-center gap-1.5 rounded-md",
          "border border-transparent px-1.5 py-0.5",
          "text-sm font-medium whitespace-nowrap",
          "text-foreground/60 transition-all",
          "group-data-vertical/tabs:w-full",
          "hover:text-foreground",
          "focus-visible:border-ring focus-visible:ring-[3px]",
          "focus-visible:ring-ring/50 focus-visible:outline-1",
          "focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1",
          "dark:text-muted-foreground dark:hover:text-foreground",
          "group-data-[variant=default]/tabs-list:data-selected:shadow-sm",
          "group-data-[variant=line]/tabs-list:data-selected:shadow-none",
          "group-data-[variant=default]/tabs-list:data-active:shadow-sm",
          "group-data-[variant=line]/tabs-list:data-active:shadow-none",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-4",
        ].join(" "),
        [
          "group-data-[variant=line]/tabs-list:bg-transparent",
          "group-data-[variant=line]/tabs-list:data-selected:bg-transparent",
          "dark:group-data-[variant=line]/tabs-list:data-selected:border-transparent",
          "dark:group-data-[variant=line]/tabs-list:data-selected:bg-transparent",
        ].join(" "),
        [
          "data-selected:bg-background data-selected:text-foreground",
          "dark:data-selected:border-input dark:data-selected:bg-input/30",
          "dark:data-selected:text-foreground",
        ].join(" "),
        [
          "after:absolute after:bg-foreground after:opacity-0",
          "after:transition-opacity",
          "group-data-horizontal/tabs:after:inset-x-0",
          "group-data-horizontal/tabs:after:-bottom-1.25",
          "group-data-horizontal/tabs:after:h-0.5",
          "group-data-vertical/tabs:after:inset-y-0",
          "group-data-vertical/tabs:after:-right-1",
          "group-data-vertical/tabs:after:w-0.5",
          "group-data-[variant=line]/tabs-list:data-selected:after:opacity-100",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

/**
 * TabsContent component - panel for tab content.
 * @param props - Component props.
 * @param props.className - Optional CSS class name.
 * @returns Tab content component.
 */
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabPanelPrimitive>) {
  return (
    <TabPanelPrimitive
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
