export type DeviceKind = "android" | "ios";

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectArchitecture {
  summary: string;
  stack: string[];
}

export interface ProjectLinks {
  github?: string;
  playStore?: string;
  appStore?: string;
  website?: string;
}

export interface ProjectExtra {
  title: string;
  body: string;
}

export interface Project {
  slug: string; // url-safe, unique
  name: string;
  tagline: string; // short hero line
  description: string; // 2-3 sentence paragraph
  cover: string; // "/projects/<slug>/cover.png"  (9:16 portrait)
  screenshot: string; // "/projects/<slug>/screen.png" (phone screen)
  device: DeviceKind; // which 3D phone model renders on its page
  year: string;
  role: string;
  features: ProjectFeature[]; // >= 1
  architecture: ProjectArchitecture;
  links: ProjectLinks; // all optional
  extras?: ProjectExtra[]; // optional, rendered after architecture
}
