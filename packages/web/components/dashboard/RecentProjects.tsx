/**
 * @file RecentProjects component for displaying a grid of recent extractions.
 */

import React from "react";

/**
 * Represents a recently extracted project.
 * @property {string} id - Unique identifier.
 * @property {string} name - Project name.
 * @property {string} url - Source URL.
 * @property {string} date - Date of extraction.
 * @property {string} status - Current status (e.g., 'Completed', 'Failed').
 */
export interface Project {
  id: string;
  name: string;
  url: string;
  date: string;
  status: "Completed" | "Failed" | "Processing";
}

/**
 * Props for the RecentProjects component.
 * @property {Project[]} projects - List of projects to display.
 */
interface RecentProjectsProps {
  projects: Project[];
}

/**
 * Renders a grid of recent project cards.
 * @param {RecentProjectsProps} props - The component props.
 * @returns The rendered projects grid.
 */
export default function RecentProjects({ projects }: RecentProjectsProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-border p-8">
        <p className="text-sm text-muted-foreground">No recent projects found.</p>
      </div>
    );
  }

  // Разбиваем длинные строки классов, чтобы уложиться в 100 символов
  const cardClass = [
    "flex flex-col gap-2 rounded-lg border border-border",
    "bg-card p-4 text-card-foreground transition-colors",
    "hover:bg-accent/50",
  ].join(" ");

  const badgeClass = [
    "shrink-0 rounded-full bg-muted px-2 py-1",
    "text-xs text-muted-foreground",
  ].join(" ");

  const linkClass = ["truncate text-sm text-muted-foreground", "hover:underline"].join(" ");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div key={project.id} className={cardClass}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-foreground">{project.name}</h3>
            <span className={badgeClass}>{project.status}</span>
          </div>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {project.url}
          </a>
          <p className="mt-auto border-t border-border pt-2 text-xs text-muted-foreground">
            {project.date}
          </p>
        </div>
      ))}
    </div>
  );
}
