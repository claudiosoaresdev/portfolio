import type { Metadata } from "next";
import Link from "next/link";
import HudBackdrop from "@/components/ui/hud-backdrop";
import { getProfile } from "@/data/profile";
import { absoluteUrl, ogImage, site } from "@/lib/site";

const title = "Política de Privacidade";
const description =
  "Quais dados este site coleta, por que coleta e como recusar — cookies do " +
  "Google Analytics só com o seu consentimento.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/privacy") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/privacy"),
    title: `${title} — ${site.name}`,
    description,
    images: [ogImage("home", site.title)],
  },
};

// Data da última revisão do texto — mude junto com o conteúdo.
const UPDATED = "2026-09-25";

export default function PrivacyPage() {
  const email = getProfile().social?.email?.replace(/^mailto:/, "");

  return (
    <main id="conteudo" className="min-h-svh pt-36 pb-24">
      <HudBackdrop fixed />

      <article className="blur-panel mx-auto max-w-3xl px-6">
        <header className="mb-14 border-b border-foreground/10 pb-10">
          <Link
            href="/"
            className="font-body text-xs uppercase tracking-[0.3em] text-primary transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Início
          </Link>
          <h1 className="mt-6 font-display text-3xl uppercase leading-tight tracking-wide text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-5 font-body text-xl leading-relaxed text-muted">
            {description}
          </p>
        </header>

        <div className="prose prose-invert max-w-none font-body text-lg prose-headings:font-display prose-headings:uppercase prose-headings:font-normal prose-headings:tracking-wide prose-h2:text-xl prose-h2:text-primary prose-a:text-primary">
          <h2>O que é coletado</h2>
          <p>
            Com o seu consentimento, o site usa o <strong>Google Analytics 4</strong>{" "}
            para medir visitas: páginas vistas, tempo na página, origem do
            acesso (busca, link, redes sociais), tipo de dispositivo,
            navegador e localização aproximada (cidade/país). O GA4 não
            armazena o endereço IP completo.
          </p>
          <p>
            Não há formulários, contas, publicidade, pixels de redes sociais
            ou rastreamento entre sites.
          </p>

          <h2>Cookies</h2>
          <p>
            Se você clicar em <strong>Aceitar</strong>, o Google Analytics grava
            os cookies <code>_ga</code> e <code>_ga_*</code>, que distinguem
            visitantes e sessões e expiram em até 2 anos. Se clicar em{" "}
            <strong>Recusar</strong>, nenhum script do Google é carregado e
            nenhum cookie é gravado — o site funciona igual.
          </p>
          <p>
            Sua escolha fica salva no próprio navegador (<code>localStorage</code>
            ), sem sair do seu dispositivo.
          </p>

          <h2>Base legal e finalidade</h2>
          <p>
            O tratamento se apoia no seu consentimento (LGPD, art. 7º, I) e
            serve apenas para entender quais conteúdos são úteis e melhorar o
            site. Os dados são processados pelo Google conforme a{" "}
            <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
              política de privacidade do Google
            </a>
            .
          </p>

          <h2>Como mudar de ideia</h2>
          <p>
            Use o link <strong>Cookies</strong> no rodapé de qualquer página
            para reabrir o aviso e trocar a escolha. Ao recusar depois de ter
            aceitado, os cookies <code>_ga</code> são apagados.
          </p>

          <h2>Seus direitos</h2>
          <p>
            Você pode pedir acesso, correção ou eliminação de dados a qualquer
            momento
            {email ? (
              <>
                {" "}
                pelo e-mail <a href={`mailto:${email}`}>{email}</a>
              </>
            ) : null}
            .
          </p>
        </div>

        <p className="mt-16 font-body text-xs uppercase tracking-[0.25em] text-muted">
          Atualizado em <time dateTime={UPDATED}>25 de setembro de 2026</time>
        </p>
      </article>
    </main>
  );
}
