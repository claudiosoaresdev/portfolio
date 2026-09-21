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

/**
 * Os caminhos de asset (`cover`, `screenshot`) são relativos à raiz do site,
 * SEM o basePath. Quem entrega a URL ao browser — `<Image src>` e a textura do
 * WebGL — aplica `assetPath()`; o JSON-LD aplica `absoluteUrl()`. Guardar o
 * caminho cru aqui evita prefixar duas vezes.
 */
export interface Project {
  slug: string; // url-safe, unique
  name: string;
  tagline: string; // short hero line
  description: string; // 2-3 sentence paragraph
  cover: string; // "/projects/<slug>/cover.webp"  (9:16 portrait)
  screenshot: string; // "/projects/<slug>/screen.webp" (phone screen)
  device: DeviceKind; // which 3D phone model renders on its page
  year: string;
  role: string;
  features: ProjectFeature[]; // >= 1
  architecture: ProjectArchitecture;
  links: ProjectLinks; // all optional
  extras?: ProjectExtra[]; // optional, rendered after architecture
}
