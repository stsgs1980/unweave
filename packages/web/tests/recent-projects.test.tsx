// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import RecentProjects, { Project } from "@/components/dashboard/RecentProjects";
import { normalizeProjectKey, groupProjects } from "@/components/dashboard/project-grouping";

/**
 * Creates a Project fixture with sensible defaults.
 * @param overrides - Fields to override and the required id.
 * @returns The constructed Project.
 */
function makeProject(overrides: Partial<Project> & { id: string }): Project {
  return {
    name: "example.com",
    url: "https://example.com",
    date: "2026-08-23T12:00:00Z",
    status: "completed",
    ...overrides,
  };
}

describe("normalizeProjectKey", () => {
  it("treats trailing slash and protocol variants as the same site", () => {
    expect(normalizeProjectKey("https://t-code.ru/")).toBe(
      normalizeProjectKey("https://t-code.ru"),
    );
    expect(normalizeProjectKey("http://t-code.ru/")).toBe(
      normalizeProjectKey("https://t-code.ru/"),
    );
  });

  it("keeps different paths separate", () => {
    expect(normalizeProjectKey("https://a.ru/x")).not.toBe(normalizeProjectKey("https://a.ru/y"));
  });
});

describe("groupProjects", () => {
  it("keeps the latest run first and attaches earlier runs", () => {
    const latest = makeProject({ id: "b", date: "2026-08-23T13:00:00Z" });
    const earlier = makeProject({ id: "a", date: "2026-08-23T12:00:00Z" });
    const groups = groupProjects([latest, earlier]);
    expect(groups).toHaveLength(1);
    expect(groups[0].latest.id).toBe("b");
    expect(groups[0].runs.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("does not merge different urls", () => {
    const groups = groupProjects([
      makeProject({ id: "a", url: "https://a.ru" }),
      makeProject({ id: "b", url: "https://b.ru" }),
    ]);
    expect(groups).toHaveLength(2);
  });
});

describe("RecentProjects grouping UI", () => {
  afterEach(cleanup);

  it("renders one card per site with earlier-runs toggle", () => {
    const view = render(
      <RecentProjects
        projects={[
          makeProject({ id: "b", date: "2026-08-23T13:00:00Z" }),
          makeProject({ id: "a", date: "2026-08-23T12:00:00Z" }),
        ]}
      />,
    );
    expect(screen.getAllByText("example.com").length).toBe(1);
    expect(screen.getByText(/1 earlier run/i)).toBeTruthy();
    expect(screen.queryByText("12:00")).toBeNull();
    view.unmount();
  });

  it("expands earlier runs on click", () => {
    const view = render(
      <RecentProjects
        projects={[
          makeProject({ id: "b", date: "2026-08-23T13:00:00Z" }),
          makeProject({ id: "a", date: "2026-08-23T12:00:00Z" }),
          makeProject({
            id: "c",
            url: "https://other.ru",
            name: "other.ru",
            date: "2026-08-23T11:00:00Z",
          }),
        ]}
      />,
    );
    fireEvent.click(screen.getByText(/earlier run/i));
    const links = screen.getAllByRole("link", { name: /open/i });
    expect(links.length).toBe(3);
    view.unmount();
  });

  it("shows no toggle for single-run sites", () => {
    const view = render(<RecentProjects projects={[makeProject({ id: "a" })]} />);
    expect(screen.queryByText(/earlier run/i)).toBeNull();
    view.unmount();
  });
});
