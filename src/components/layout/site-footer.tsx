import SocialLinks from "@/components/layout/social-links";
import { getProfile } from "@/data/profile";

export default function SiteFooter() {
  const { social } = getProfile();
  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-6 text-[0.7rem] uppercase tracking-[0.25em] text-muted sm:flex-row sm:justify-between">
        <span className="font-body">© 2026 Claudio Soares Dev</span>
        <SocialLinks social={social} />
      </div>
    </footer>
  );
}
