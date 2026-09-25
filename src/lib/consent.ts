/**
 * Consentimento de cookies de analytics.
 *
 * A escolha vive no localStorage do visitante — site estático, sem servidor
 * para guardar nada. O estado é exposto como uma store externa (subscribe +
 * snapshot) para ser lido com `useSyncExternalStore`, e não com efeito +
 * setState, que o lint do Next 16 barra.
 */

/** ID de medição do GA4 (G-XXXXXXX). Vazio = analytics desligado no build. */
export const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "";

export type Consent = "granted" | "denied";

const KEY = "cookie-consent";
const EVENT = "cookie-consent-change";

// Fallback quando o localStorage lança: a escolha dura até recarregar.
let memory: Consent | null = null;

function read(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Storage bloqueado (modo privado, política do navegador): trata como
    // "ainda não respondeu" — o banner aparece e a escolha vale na sessão.
    return memory;
  }
}

export function subscribe(callback: () => void) {
  // `storage` sincroniza abas abertas; o evento próprio, a aba atual.
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/** `null` = visitante ainda não escolheu. */
export const getSnapshot = read;

/**
 * No servidor (e na hidratação) a escolha é desconhecida. Um valor distinto de
 * `null` impede que o banner pisque no HTML estático para quem já respondeu.
 */
export const getServerSnapshot = (): Consent | "unknown" => "unknown";

export function setConsent(value: Consent | null) {
  memory = value;
  try {
    if (value) window.localStorage.setItem(KEY, value);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Sem storage: `memory` já guardou a escolha.
  }

  if (value === "denied") revokeAnalytics();
  if (value === "granted") restoreAnalytics();
  window.dispatchEvent(new Event(EVENT));
}

/** Reabre o banner — usado pelo link "Preferências de cookies" do rodapé. */
export function resetConsent() {
  setConsent(null);
}

type GtagWindow = {
  gtag?: (...args: unknown[]) => void;
  [flag: `ga-disable-${string}`]: boolean;
};

// Recusou e depois aceitou sem recarregar: o gtag da primeira aceitação ainda
// está na página (next/script não reexecuta o init), então é religado aqui.
function restoreAnalytics() {
  const w = window as unknown as GtagWindow;
  if (gaId) w[`ga-disable-${gaId}`] = false;
  w.gtag?.("consent", "update", { analytics_storage: "granted" });
}

// Quem aceitou e depois recusou já tem o gtag carregado nesta página: ele é
// desligado na hora e os cookies `_ga*` saem do domínio.
function revokeAnalytics() {
  const w = window as unknown as GtagWindow;
  if (gaId) w[`ga-disable-${gaId}`] = true;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });

  const host = window.location.hostname;
  // O GA grava no domínio registrável (`.claudiosoares.dev`); apagar exige o
  // mesmo atributo `domain` — por isso tenta o host e o pai.
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
