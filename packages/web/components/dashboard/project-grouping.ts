/**
 * @file Project grouping helpers: normalize URLs and group extraction runs by site.
 */

import { Project } from "@/components/dashboard/RecentProjects";

export interface ProjectGroup {
  latest: Project;
  runs: Project[];
}

/**
 * Builds a stable grouping key for a project URL, ignoring protocol,
 * trailing slash, and surrounding whitespace.
 * @param {string} rawUrl - The raw project URL.
 * @returns The normalized grouping key.
 */
export function normalizeProjectKey(rawUrl: string): string {
  const trimmed = (rawUrl ?? "").trim();
  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return `${parsed.hostname}${parsed.pathname.replace(/\/+$/, "")}`;
  } catch {
    return trimmed;
  }
}

/**
 * Groups projects by normalized URL, preserving the incoming order of groups
 * and ordering runs from newest to oldest within each group.
 * @param {Project[]} projects - Projects sorted newest first.
 * @returns {ProjectGroup[]} One group per unique site.
 */
export function groupProjects(projects: Project[]): ProjectGroup[] {
  const byKey = new Map<string, ProjectGroup>();
  for (const project of projects) {
    const key = normalizeProjectKey(project.url);
    const group = byKey.get(key);
    if (!group) {
      byKey.set(key, { latest: project, runs: [project] });
    } else {
      group.runs.push(project);
    }
  }
  return Array.from(byKey.values());
}
