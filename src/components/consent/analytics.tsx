"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import {
  gaId,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/consent";

// O gtag só entra na página depois do "Aceitar": antes disso nenhum script do
// Google é baixado e nenhum cookie é gravado. Page views das navegações
// client-side vêm da medição otimizada do GA4 (mudança de histórico).
export default function Analytics() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!gaId || consent !== "granted") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
window['ga-disable-${gaId}']=false;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());
gtag('config','${gaId}');`}
      </Script>
    </>
  );
}
