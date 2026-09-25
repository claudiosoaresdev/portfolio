"use client";

import { gaId, resetConsent } from "@/lib/consent";

// Link do rodapé que reabre o banner: retirar o consentimento tem que ser tão
// fácil quanto dá-lo (LGPD art. 8º, §5º).
export default function CookiePreferencesButton() {
  if (!gaId) return null;
  return (
    <button
      type="button"
      onClick={resetConsent}
      className="uppercase tracking-[0.25em] transition-colors hover:text-primary"
    >
      Cookies
    </button>
  );
}
