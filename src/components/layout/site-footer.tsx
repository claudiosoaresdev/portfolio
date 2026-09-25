import Link from "next/link";
import CookiePreferencesButton from "@/components/consent/cookie-preferences-button";
import SocialLinks from "@/components/layout/social-links";
import { getProfile } from "@/data/profile";
import { site } from "@/lib/site";

export default function SiteFooter() {
  const { social } = getProfile();
  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-6 text-[0.7rem] uppercase tracking-[0.25em] text-muted sm:flex-row sm:justify-between">
        {/* Avaliado no build — em site estático é a data do último deploy. */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-body">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <Link href="/privacidade" className="transition-colors hover:text-primary">
            Privacidade
          </Link>
          <CookiePreferencesButton />
        </div>
        <SocialLinks social={social} />
      </div>
    </footer>
  );
}
