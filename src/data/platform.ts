import type {
  DeviceSpec,
  PhoneKind,
  Project,
  ProjectTag,
  ProjectType,
} from "./types";

export const PROJECT_TYPES: readonly ProjectType[] = [
  "android",
  "ios",
  "web",
  "fullstack",
];

export const PROJECT_TAGS: readonly ProjectTag[] = ["backend"];

const LABELS = {
  android: "Android",
  ios: "iOS",
  web: "Web",
  fullstack: "Fullstack",
} as const satisfies Record<ProjectType, string>;

export type PlatformLabel = (typeof LABELS)[ProjectType];

/** Rótulo exibido (hero, vitrine, card, OG). */
export function platformLabel(type: ProjectType): PlatformLabel {
  return LABELS[type];
}

/** web e fullstack mostram o MacBook com o site desktop. */
export function hasDesktop(type: ProjectType): boolean {
  return type === "web" || type === "fullstack";
}

/** Estilo do celular: o próprio tipo em apps; `phone` (padrão iOS) no fullstack; iOS no web. */
function phoneKind(project: Project): PhoneKind {
  if (project.device === "android" || project.device === "ios") {
    return project.device;
  }
  if (project.device === "fullstack") return project.phone ?? "ios";
  return "ios";
}

export function deviceSpec(project: Project): DeviceSpec {
  return {
    kind: project.device,
    phone: phoneKind(project),
    screenshot: project.screenshot,
    desktopScreenshot: project.desktopScreenshot,
  };
}

/** Filtros da vitrine da home, na ordem dos chips. */
export const PROJECT_FILTERS = [
  "android",
  "ios",
  "mobile",
  "web",
  "backend",
  "fullstack",
] as const;

export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

export const FILTER_LABELS = {
  android: "Android",
  ios: "iOS",
  mobile: "Mobile",
  web: "Web",
  backend: "Backend",
  fullstack: "Fullstack",
} as const satisfies Record<ProjectFilter, string>;

export function isProjectFilter(value: unknown): value is ProjectFilter {
  return (PROJECT_FILTERS as readonly unknown[]).includes(value);
}

/**
 * Um projeto pode cair em vários filtros: fullstack tem app (Mobile, e
 * Android/iOS pelo `phone`), site (Web) e servidor (Backend).
 */
export function matchesFilter(project: Project, filter: ProjectFilter): boolean {
  const { device } = project;
  switch (filter) {
    case "android":
    case "ios":
      return (
        device === filter ||
        (device === "fullstack" && phoneKind(project) === filter)
      );
    case "mobile":
      return device !== "web";
    case "web":
      return hasDesktop(device);
    case "backend":
      return device === "fullstack" || !!project.tags?.includes("backend");
    case "fullstack":
      return device === "fullstack";
  }
}
