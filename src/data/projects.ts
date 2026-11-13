import { readFileSync } from "node:fs";
import path from "node:path";
import type { Project } from "./types";
import { PROJECT_TAGS, PROJECT_TYPES, hasDesktop } from "./platform";

// Content source of truth: public/projects/projects.json. Editing that file
// (adding/removing entries) is the only step needed to change the portfolio —
// the carousel, routes and detail template all derive from it (REQ-005).
// Read from the filesystem because generateStaticParams runs at build time,
// where fetching the app's own /public URL is not available.
const JSON_PATH = path.join(process.cwd(), "public", "projects", "projects.json");

let cached: Project[] | null = null;

export function getProjects(): Project[] {
  // Re-read on every call in dev so JSON edits show up without a restart;
  // cache in production builds where the file is immutable.
  if (cached && process.env.NODE_ENV === "production") return cached;
  const raw = JSON.parse(readFileSync(JSON_PATH, "utf8")) as {
    projects?: Project[];
  };
  if (!Array.isArray(raw.projects)) {
    throw new Error(
      `Invalid ${JSON_PATH}: expected a top-level "projects" array`,
    );
  }
  for (const project of raw.projects) {
    if (!PROJECT_TYPES.includes(project.device)) {
      throw new Error(
        `Invalid ${JSON_PATH}: project "${project.slug}" has unknown device "${project.device}" (expected ${PROJECT_TYPES.join(" | ")})`,
      );
    }
    const badTag = project.tags?.find((tag) => !PROJECT_TAGS.includes(tag));
    if (badTag) {
      throw new Error(
        `Invalid ${JSON_PATH}: project "${project.slug}" has unknown tag "${badTag}" (expected ${PROJECT_TAGS.join(" | ")})`,
      );
    }
    if (hasDesktop(project.device) && !project.desktopScreenshot) {
      throw new Error(
        `Invalid ${JSON_PATH}: project "${project.slug}" (${project.device}) requires "desktopScreenshot"`,
      );
    }
  }
  cached = raw.projects;
  return cached;
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}
