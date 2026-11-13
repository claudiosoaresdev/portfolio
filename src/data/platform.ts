import type { DeviceSpec, PhoneKind, Project, ProjectType } from "./types";

export const PROJECT_TYPES: readonly ProjectType[] = [
  "android",
  "ios",
  "web",
  "fullstack",
];

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
