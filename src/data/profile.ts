import { readFileSync } from "node:fs";
import path from "node:path";

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
  x?: string;
  email?: string;
}

export interface HeroProfile {
  eyebrow: string;
  title: { lines: string[]; accent: string };
  description: string;
  photo: string;
  photoAlt: string;
  skills: string[];
  social?: SocialLinks;
}

// Hero copy lives in public/profile.json so presentation text, photo and
// skill tags are editable without touching code. Same contract as the
// projects loader: fresh reads in dev, cached in production builds.
const JSON_PATH = path.join(process.cwd(), "public", "profile.json");

let cached: HeroProfile | null = null;

export function getProfile(): HeroProfile {
  if (cached && process.env.NODE_ENV === "production") return cached;
  const raw = JSON.parse(readFileSync(JSON_PATH, "utf8")) as HeroProfile;
  if (!raw.title || !Array.isArray(raw.title.lines) || !raw.title.accent) {
    throw new Error(
      `Invalid ${JSON_PATH}: expected "title" with "lines" array and "accent"`,
    );
  }
  cached = raw;
  return cached;
}
